import { GiftCardProvider, PurchaseParams, PurchaseResponse } from "./base-provider";
import { ReloadlyProvider } from "./reloadly-provider";
// Import more providers here as you add them
// import { DingProvider } from "./ding-provider";
// import { TangoCardProvider } from "./tangocard-provider";

export class ProviderManager {
  private providers: Map<string, GiftCardProvider> = new Map();
  private defaultProvider: string = "reloadly";

  constructor() {
    // Register all available providers
    this.registerProvider(new ReloadlyProvider());
    // this.registerProvider(new DingProvider());
    // this.registerProvider(new TangoCardProvider());
  }

  private registerProvider(provider: GiftCardProvider) {
    if (provider.isAvailable()) {
      this.providers.set(provider.name.toLowerCase(), provider);
      console.log(`✅ Registered provider: ${provider.name}`);
    } else {
      console.log(`⚠️ Provider ${provider.name} not available (credentials missing)`);
    }
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string): GiftCardProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): GiftCardProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Purchase a gift card using specified provider or default
   */
  async purchase(
    params: PurchaseParams, 
    providerName?: string
  ): Promise<{ provider: string; response: PurchaseResponse }> {
    const provider = providerName 
      ? this.getProvider(providerName)
      : this.getProvider(this.defaultProvider);

    if (!provider) {
      throw new Error(`Provider ${providerName || this.defaultProvider} not available`);
    }

    console.log(`🛒 Purchasing gift card via ${provider.name}...`);
    
    try {
      const response = await provider.purchase(params);
      console.log(`✅ Purchase successful via ${provider.name}`);
      return { provider: provider.name, response };
    } catch (error: any) {
      console.error(`❌ Purchase failed via ${provider.name}:`, error.message);
      
      // Optional: Try fallback provider
      if (this.providers.size > 1) {
        console.log(`🔄 Attempting fallback to another provider...`);
        return this.purchaseWithFallback(params, provider.name);
      }
      
      throw error;
    }
  }

  /**
   * Try purchasing with another provider if the first one fails
   */
  private async purchaseWithFallback(
    params: PurchaseParams,
    failedProvider: string
  ): Promise<{ provider: string; response: PurchaseResponse }> {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.name !== failedProvider);

    for (const provider of availableProviders) {
      try {
        console.log(`Trying fallback provider: ${provider.name}`);
        const response = await provider.purchase(params);
        console.log(`✅ Fallback successful with ${provider.name}`);
        return { provider: provider.name, response };
      } catch (error) {
        console.log(`Fallback failed with ${provider.name}`);
        continue;
      }
    }

    throw new Error("All providers failed to process the purchase");
  }

  /**
   * Get the best provider based on criteria
   * (price, availability, speed, etc.)
   */
  async getBestProvider(
    productId: number | string,
    amount: number
  ): Promise<GiftCardProvider> {
    // Implement logic to choose best provider
    // For now, return default
    const provider = this.getProvider(this.defaultProvider);
    if (!provider) {
      throw new Error("No providers available");
    }
    return provider;
  }

  /**
   * Get combined balance across all providers
   */
  async getTotalBalance(): Promise<Record<string, number>> {
    const balances: Record<string, number> = {};
    
    for (const [name, provider] of this.providers) {
      try {
        balances[name] = await provider.getBalance();
      } catch (error) {
        balances[name] = 0;
      }
    }
    
    return balances;
  }
}

// Singleton instance
export const providerManager = new ProviderManager();
