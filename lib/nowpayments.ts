import crypto from "crypto";

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

if (!API_KEY) {
  console.warn("NOWPayments API key not configured");
}
if (!IPN_SECRET) {
  console.warn("NOWPayments IPN secret not configured (needed for webhooks)");
}

interface CreatePaymentParams {
  amount: number;
  currency: string; // USD
  payCurrency?: string; // BTC, ETH, etc. (optional, user can choose)
  orderId: string;
  orderDescription: string;
  customerEmail?: string;
  ipnCallbackUrl?: string;
}

interface NOWPaymentsResponse {
  error?: string;
  payment_id?: string;
  payment_status?: string;
  pay_address?: string;
  price_amount?: number;
  price_currency?: string;
  pay_amount?: number;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  invoice_url?: string;
  success_url?: string;
  cancel_url?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<NOWPaymentsResponse> {
  if (!API_KEY) {
    throw new Error("NOWPayments not configured");
  }

  // Use invoice endpoint to allow user to select cryptocurrency
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://giftswap.shop';
  
  // Ensure baseUrl is a valid URL
  let validBaseUrl = baseUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    validBaseUrl = `https://${baseUrl}`;
  }
  
  const payload: any = {
    price_amount: params.amount,
    price_currency: params.currency,
    order_id: params.orderId,
    order_description: params.orderDescription,
    success_url: `${validBaseUrl}/account/orders/${params.orderId}?success=true`,
    cancel_url: `${validBaseUrl}/checkout?cancelled=true`,
  };

  // Always add IPN callback URL (required by NOWPayments)
  // For localhost, use ngrok or similar tunnel service, or use a production URL
  if (!validBaseUrl.includes('localhost')) {
    payload.ipn_callback_url = params.ipnCallbackUrl || `${validBaseUrl}/api/payments/webhook`;
  } else {
    // For local development, fallback to production URL
    payload.ipn_callback_url = `https://giftswap.shop/api/payments/webhook`;
  }

  console.log("Creating NOWPayments invoice with payload:", JSON.stringify(payload, null, 2));
  console.log("Base URL used:", validBaseUrl);
  console.log("IPN Callback URL:", payload.ipn_callback_url);

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("NOWPayments response:", data);

    if (!response.ok) {
      // Provide detailed error message
      let errorMsg = data.message || "Failed to create payment";
      console.error("NOWPayments error:", errorMsg, data);
      
      // Handle specific NOWPayments errors
      if (data.message && data.message.includes("minimal")) {
        errorMsg = "Payment amount is below the minimum threshold for the selected cryptocurrency. Try switching to USDT, TRX, or LTC which have lower minimums ($2-5). Or select a denomination of $20+ for Bitcoin.";
      } else if (data.message && data.message.includes("ipn_callback_url")) {
        errorMsg = "Invalid callback URL. Please ensure NEXT_PUBLIC_APP_URL is set correctly in your environment variables.";
      }
      
      return {
        error: errorMsg,
      };
    }

    // Invoice endpoint returns id and invoice_url
    return {
      payment_id: data.id,
      invoice_url: data.invoice_url,
      ...data
    };
  } catch (error) {
    console.error("NOWPayments API error:", error);
    throw error;
  }
}

export function verifyWebhook(
  payload: string,
  signature: string
): boolean {
  if (!IPN_SECRET) {
    return false;
  }

  // NOWPayments uses HMAC SHA512 signature
  const calculatedSignature = crypto
    .createHmac("sha512", IPN_SECRET)
    .update(payload)
    .digest("hex");

  return calculatedSignature === signature;
}

export async function getPaymentStatus(paymentId: string): Promise<any> {
  if (!API_KEY) {
    throw new Error("NOWPayments not configured");
  }

  try {
    const response = await fetch(
      `https://api.nowpayments.io/v1/payment/${paymentId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    return response.json();
  } catch (error) {
    console.error("NOWPayments API error:", error);
    throw error;
  }
}

export async function getAvailableCurrencies(): Promise<string[]> {
  if (!API_KEY) {
    throw new Error("NOWPayments not configured");
  }

  try {
    const response = await fetch(
      "https://api.nowpayments.io/v1/currencies",
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const data = await response.json();
    return data.currencies || [];
  } catch (error) {
    console.error("NOWPayments API error:", error);
    return [];
  }
}

