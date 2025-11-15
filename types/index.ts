export interface GiftCard {
  _id?: string;
  brand: string;
  name: string;
  image: string;
  category?: string;
  country: string;
  countryCode: string;
  currency: string;
  denominations: number[];
  reloadlyProductId: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id?: string;
  userId: string;
  giftCardId: string;
  giftCardBrand: string;
  amount: number;
  denomination: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paymentId?: string;
  coinpaymentsTxnId?: string;
  code?: string; // Encrypted
  serial?: string;
  redemptionInstructions?: string;
  email?: string;
  reloadlyTransactionId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderStatus = Order["status"];

