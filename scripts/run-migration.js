const { neon } = require("@neondatabase/serverless");
const { readFileSync } = require("fs");
const { resolve } = require("path");
require("dotenv").config({ path: resolve(__dirname, "../.env.local") });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log("Running database indexes migration...\n");
    
    // Execute each index creation separately
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_cards_active ON gift_cards(active)`;
    console.log("✅ Created idx_gift_cards_active");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_cards_brand ON gift_cards(brand)`;
    console.log("✅ Created idx_gift_cards_brand");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_cards_category ON gift_cards(category)`;
    console.log("✅ Created idx_gift_cards_category");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_cards_active_brand ON gift_cards(active, brand)`;
    console.log("✅ Created idx_gift_cards_active_brand");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_gift_cards_active_category ON gift_cards(active, category)`;
    console.log("✅ Created idx_gift_cards_active_category");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    console.log("✅ Created idx_orders_user_id");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    console.log("✅ Created idx_orders_status");
    
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
    console.log("✅ Created idx_orders_created_at");
    
    console.log("\n✅ All indexes created successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

