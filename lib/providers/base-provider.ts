// Abstract base class for gift card providers
export interface PurchaseParams {
  productId: number | string;
  amount: number;
  countryCode?: string;
  quantity?: number;
  customIdentifier?: string;
  recipientEmail?: string;
}

export interface PurchaseResponse {
  transactionId: string;
  pinDetail?: {
    pin: string;
    serial?: string;
  };
  cardNumber?: string;
  cardPin?: string;
  redemptionInstructions?: string;
  expiryDate?: string;
}

export interface GiftCardProduct {
  id: string | number;
  name: string;
  brand: string;
  denominations: number[];
  country: string;
  currency: string;
  provider: string;
}

export abstract class GiftCardProvider {
  abstract name: string;
  
  // Authenticate with provider
  abstract authenticate(): Promise<void>;
  
  // Purchase a gift card
  abstract purchase(params: PurchaseParams): Promise<PurchaseResponse>;
  
  // Get available products
  abstract getProducts(country?: string): Promise<GiftCardProduct[]>;
  
  // Check if provider is available
  abstract isAvailable(): boolean;
  
  // Get provider balance
  abstract getBalance(): Promise<number>;
}
