import crypto from "crypto";

const MERCHANT_ID = process.env.COINPAYMENTS_MERCHANT_ID;
const PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY;
const PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY;
const IPN_SECRET = process.env.COINPAYMENTS_IPN_SECRET;

if (!MERCHANT_ID || !PRIVATE_KEY || !PUBLIC_KEY || !IPN_SECRET) {
  console.warn("CoinPayments credentials not configured");
}

interface CreateTransactionParams {
  amount: number;
  currency1: string; // USD
  currency2: string; // BTC, ETH, etc.
  buyer_email?: string;
  item_name: string;
  invoice?: string;
  custom?: string;
  ipn_url?: string;
}

interface CoinPaymentsResponse {
  error?: string;
  result?: {
    amount: string;
    txn_id: string;
    address: string;
    confirms_needed: string;
    timeout: number;
    status_url: string;
    qrcode_url: string;
  };
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<CoinPaymentsResponse> {
  if (!MERCHANT_ID || !PRIVATE_KEY || !PUBLIC_KEY) {
    throw new Error("CoinPayments not configured");
  }

  const formData = new URLSearchParams();
  formData.append("version", "1");
  formData.append("cmd", "create_transaction");
  formData.append("key", PUBLIC_KEY);
  formData.append("format", "json");
  formData.append("amount", params.amount.toString());
  formData.append("currency1", params.currency1);
  formData.append("currency2", params.currency2);
  formData.append("buyer_email", params.buyer_email || "");
  formData.append("item_name", params.item_name);
  formData.append("invoice", params.invoice || "");
  formData.append("custom", params.custom || "");
  formData.append("ipn_url", params.ipn_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`);

  // Create HMAC signature
  const hmac = crypto.createHmac("sha512", PRIVATE_KEY);
  hmac.update(formData.toString());
  const signature = hmac.digest("hex");

  try {
    const response = await fetch("https://www.coinpayments.net/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        HMAC: signature,
      },
      body: formData.toString(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("CoinPayments API error:", error);
    throw error;
  }
}

export function verifyIPN(data: Record<string, string>, hmac: string): boolean {
  if (!IPN_SECRET) {
    return false;
  }

  // Sort data and create query string
  const sortedData = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  // Create HMAC
  const calculatedHmac = crypto
    .createHmac("sha512", IPN_SECRET)
    .update(sortedData)
    .digest("hex");

  return calculatedHmac === hmac;
}

export function getTransactionStatus(txnId: string): Promise<any> {
  if (!MERCHANT_ID || !PRIVATE_KEY || !PUBLIC_KEY) {
    throw new Error("CoinPayments not configured");
  }

  const formData = new URLSearchParams();
  formData.append("version", "1");
  formData.append("cmd", "get_tx_info");
  formData.append("key", PUBLIC_KEY);
  formData.append("format", "json");
  formData.append("txid", txnId);

  const hmac = crypto.createHmac("sha512", PRIVATE_KEY);
  hmac.update(formData.toString());
  const signature = hmac.digest("hex");

  return fetch("https://www.coinpayments.net/api.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      HMAC: signature,
    },
    body: formData.toString(),
  }).then((res) => res.json());
}

