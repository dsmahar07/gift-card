import { pgTable, text, numeric, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  category: text("category"),
  denominations: text("denominations").notNull(), // JSON array stored as text
  reloadlyProductId: integer("reloadly_product_id").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  giftCardId: integer("gift_card_id").notNull().references(() => giftCards.id),
  giftCardBrand: text("gift_card_brand").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  denomination: numeric("denomination", { precision: 10, scale: 2 }).notNull(),
  cryptoAmount: numeric("crypto_amount", { precision: 20, scale: 8 }).notNull(),
  cryptoCurrency: text("crypto_currency").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, cancelled
  paymentId: text("payment_id"),
  coinpaymentsTxnId: text("coinpayments_txn_id"),
  code: text("code"), // Encrypted
  serial: text("serial"),
  redemptionInstructions: text("redemption_instructions"),
  email: text("email"),
  reloadlyTransactionId: integer("reloadly_transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GiftCard = typeof giftCards.$inferSelect;
export type NewGiftCard = typeof giftCards.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
