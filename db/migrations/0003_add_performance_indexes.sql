-- Add indexes for better query performance
-- Index on brand for faster brand lookups
CREATE INDEX IF NOT EXISTS idx_gift_cards_brand_active ON gift_cards(brand, active);

-- Index on category for faster category filtering
CREATE INDEX IF NOT EXISTS idx_gift_cards_category_active ON gift_cards(category, active) WHERE category IS NOT NULL;

-- Index on active status for faster active card queries
CREATE INDEX IF NOT EXISTS idx_gift_cards_active ON gift_cards(active) WHERE active = true;

-- Composite index for search queries
CREATE INDEX IF NOT EXISTS idx_gift_cards_search ON gift_cards(lower(brand), lower(name), active);

