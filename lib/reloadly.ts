function getClientId() {
  return process.env.RELOADLY_CLIENT_ID;
}

function getClientSecret() {
  return process.env.RELOADLY_CLIENT_SECRET;
}

function isSandbox() {
  return process.env.RELOADLY_SANDBOX === "true";
}

function getBaseUrl() {
  return isSandbox()
    ? "https://topups-sandbox.reloadly.com"
    : "https://topups.reloadly.com";
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

interface ReloadlyAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const CLIENT_ID = getClientId();
  const CLIENT_SECRET = getClientSecret();

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Reloadly credentials not configured");
  }

  const response = await fetch(`${getBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/com.reloadly.topups-v1+json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: "https://topups.reloadly.com",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reloadly auth failed: ${error}`);
  }

  const data: ReloadlyAuthResponse = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 60s before expiry

  return accessToken;
}

export interface ReloadlyProduct {
  productId: number;
  productName: string;
  global: boolean;
  senderFee: number;
  discountPercentage: number;
  denominationType: string;
  recipientCurrencyCode: string;
  minRecipientDenomination: number;
  maxRecipientDenomination: number;
  senderCurrencyCode: string;
  minSenderDenomination: number;
  maxSenderDenomination: number;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations: number[];
  logoUrls: string[];
  brand: {
    brandId: number;
    brandName: string;
  };
  country: {
    isoName: string;
    name: string;
  };
}

export interface ReloadlyTopupRequest {
  productId: number;
  countryCode: string;
  quantity: number;
  unitPrice: number;
  customIdentifier?: string;
  recipientEmail?: string;
  recipientPhoneNumber?: string;
  senderPhoneNumber?: string;
}

export interface ReloadlyTopupResponse {
  transactionId: number;
  operatorTransactionId: string | null;
  customIdentifier: string | null;
  recipientEmail: string | null;
  recipientPhoneNumber: string | null;
  senderPhoneNumber: string | null;
  operatorId: number;
  operatorName: string;
  discount: number;
  discountCurrencyCode: string;
  requestedAmount: number;
  requestedAmountCurrencyCode: string;
  deliveredAmount: number;
  deliveredAmountCurrencyCode: string;
  transactionDate: string;
  pinDetail: {
    pin: string;
    serial: string | null;
    expiry: string | null;
    info: string | null;
  } | null;
  redemptionInstructions: string | null;
}

export async function getProducts(
  countryCode?: string,
  page = 1,
  size = 50
): Promise<{ content: ReloadlyProduct[]; totalElements: number }> {
  const token = await getAccessToken();
  const url = new URL(`${getBaseUrl()}/products`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  if (countryCode) {
    url.searchParams.append("countryCode", countryCode);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/com.reloadly.topups-v1+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch products: ${error}`);
  }

  return response.json();
}

export async function getProductById(productId: number): Promise<ReloadlyProduct> {
  const token = await getAccessToken();
  const response = await fetch(`${getBaseUrl()}/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/com.reloadly.topups-v1+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch product: ${error}`);
  }

  return response.json();
}

export async function purchaseTopup(
  request: ReloadlyTopupRequest
): Promise<ReloadlyTopupResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getBaseUrl()}/topups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/com.reloadly.topups-v1+json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Topup purchase failed: ${error}`);
  }

  return response.json();
}

export async function getTransactionStatus(
  transactionId: number
): Promise<ReloadlyTopupResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getBaseUrl()}/topups/reports/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/com.reloadly.topups-v1+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch transaction: ${error}`);
  }

  return response.json();
}

