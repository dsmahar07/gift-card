import { GiftCardProvider, PurchaseParams, PurchaseResponse, GiftCardProduct } from "./base-provider";

// Example second provider - Ding
// Get API key from: https://www.ding.com
export class DingProvider extends GiftCardProvider {
  name = "Ding";
  
  private getApiKey() {
    return process.env.DING_API_KEY;
  }

  async authenticate(): Promise<void> {
    // Ding uses API key, no separate auth needed
    if (!this.getApiKey()) {
      throw new Error("Ding API key not configured");
    }
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResponse> {
    await this.authenticate();

    const response = await fetch("https://api.dingconnect.com/api/V1/SendTransfer", {
      method: "POST",
      headers: {
        "api_key": this.getApiKey()!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        SkuCode: params.productId,
        SendValue: params.amount,
        ReceivingPhoneNumber: params.recipientEmail, // Or phone
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Ding purchase failed: ${error.ErrorMessage || "Unknown error"}`);
    }

    const data = await response.json();

    return {
      transactionId: data.TransferId || data.TransferRef,
      pinDetail: {
        pin: data.Pin || data.Code,
      },
      redemptionInstructions: data.Instructions,
    };
  }

  async getProducts(country?: string): Promise<GiftCardProduct[]> {
    await this.authenticate();

    const response = await fetch("https://api.dingconnect.com/api/V1/GetProducts", {
      headers: {
        "api_key": this.getApiKey()!,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Ding products");
    }

    const data = await response.json();

    return data.Items.map((product: any) => ({
      id: product.SkuCode,
      name: product.OperatorName,
      brand: product.OperatorName,
      denominations: product.SendValues,
      country: product.RegionCode,
      currency: product.SendCurrencyIso,
      provider: this.name,
    }));
  }

  isAvailable(): boolean {
    return !!process.env.DING_API_KEY;
  }

  async getBalance(): Promise<number> {
    await this.authenticate();

    const response = await fetch("https://api.dingconnect.com/api/V1/GetBalance", {
      headers: {
        "api_key": this.getApiKey()!,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get Ding balance");
    }

    const data = await response.json();
    return data.Balance || 0;
  }
}
