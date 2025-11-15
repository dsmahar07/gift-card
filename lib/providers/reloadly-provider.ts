import { GiftCardProvider, PurchaseParams, PurchaseResponse, GiftCardProduct } from "./base-provider";

export class ReloadlyProvider extends GiftCardProvider {
  name = "Reloadly";
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private getBaseUrl() {
    const isSandbox = process.env.RELOADLY_SANDBOX === "true";
    return isSandbox
      ? "https://topups-sandbox.reloadly.com"
      : "https://topups.reloadly.com";
  }

  async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    const CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
    const CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Reloadly credentials not configured");
    }

    const response = await fetch(`${this.getBaseUrl()}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
        audience: this.getBaseUrl(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with Reloadly");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResponse> {
    await this.authenticate();

    const response = await fetch(`${this.getBaseUrl()}/topups`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/com.reloadly.topups-v1+json",
      },
      body: JSON.stringify({
        operatorId: params.productId,
        amount: params.amount,
        useLocalAmount: true,
        countryCode: params.countryCode || "US", // Default to US for USD transactions
        customIdentifier: params.customIdentifier,
        recipientEmail: params.recipientEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Reloadly purchase failed: ${error.message || "Unknown error"}`);
    }

    const data = await response.json();

    return {
      transactionId: data.transactionId,
      pinDetail: data.pinDetail ? {
        pin: data.pinDetail.pin,
        serial: data.pinDetail.serial,
      } : undefined,
      redemptionInstructions: data.pinDetail?.instructions,
    };
  }

  async getProducts(country?: string): Promise<GiftCardProduct[]> {
    await this.authenticate();

    const url = country 
      ? `${this.getBaseUrl()}/operators/countries/${country}`
      : `${this.getBaseUrl()}/operators`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Accept": "application/com.reloadly.topups-v1+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Reloadly products");
    }

    const data = await response.json();

    return data.map((product: any) => ({
      id: product.operatorId,
      name: product.name,
      brand: product.name,
      denominations: product.denominationType === "FIXED" 
        ? product.fixedAmounts 
        : [product.minAmount, product.maxAmount],
      country: product.country.isoName,
      currency: product.destinationCurrencyCode,
      provider: this.name,
    }));
  }

  isAvailable(): boolean {
    return !!(process.env.RELOADLY_CLIENT_ID && process.env.RELOADLY_CLIENT_SECRET);
  }

  async getBalance(): Promise<number> {
    await this.authenticate();

    const response = await fetch(`${this.getBaseUrl()}/accounts/balance`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Accept": "application/com.reloadly.topups-v1+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get Reloadly balance");
    }

    const data = await response.json();
    return data.balance || 0;
  }
}
