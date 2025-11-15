-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gift_cards_active ON gift_cards(active);
CREATE INDEX IF NOT EXISTS idx_gift_cards_brand ON gift_cards(brand);
CREATE INDEX IF NOT EXISTS idx_gift_cards_category ON gift_cards(category);
CREATE INDEX IF NOT EXISTS idx_gift_cards_active_brand ON gift_cards(active, brand);
CREATE INDEX IF NOT EXISTS idx_gift_cards_active_category ON gift_cards(active, category);

-- Add index for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

