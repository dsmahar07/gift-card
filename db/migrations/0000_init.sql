-- Create gift_cards table
CREATE TABLE IF NOT EXISTS "gift_cards" (
  "id" SERIAL PRIMARY KEY,
  "brand" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "category" TEXT,
  "denominations" TEXT NOT NULL,
  "reloadly_product_id" INTEGER NOT NULL UNIQUE,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "gift_card_id" INTEGER NOT NULL REFERENCES "gift_cards"("id"),
  "gift_card_brand" TEXT NOT NULL,
  "amount" NUMERIC(10, 2) NOT NULL,
  "denomination" NUMERIC(10, 2) NOT NULL,
  "crypto_amount" NUMERIC(20, 8) NOT NULL,
  "crypto_currency" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_id" TEXT,
  "coinpayments_txn_id" TEXT,
  "code" TEXT,
  "serial" TEXT,
  "redemption_instructions" TEXT,
  "email" TEXT,
  "reloadly_transaction_id" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "gift_cards_brand_idx" ON "gift_cards"("brand");
CREATE INDEX IF NOT EXISTS "gift_cards_category_idx" ON "gift_cards"("category");
CREATE INDEX IF NOT EXISTS "gift_cards_active_idx" ON "gift_cards"("active");
CREATE INDEX IF NOT EXISTS "gift_cards_reloadly_product_id_idx" ON "gift_cards"("reloadly_product_id");

CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_coinpayments_txn_id_idx" ON "orders"("coinpayments_txn_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

