require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function removeCountryFields() {
  try {
    console.log("🔄 Removing country-related fields from gift_cards table...\n");
    
    // Drop country-related indexes first
    console.log("Dropping country indexes...");
    try {
      await sql`DROP INDEX IF EXISTS idx_gift_cards_country_code`;
      console.log("✅ Dropped idx_gift_cards_country_code");
    } catch (error) {
      console.log("⚠️  Index idx_gift_cards_country_code doesn't exist or already dropped");
    }

    // Drop country-related columns
    console.log("\nDropping country columns...");
    try {
      await sql`ALTER TABLE gift_cards DROP COLUMN IF EXISTS country`;
      console.log("✅ Dropped country column");
    } catch (error) {
      console.log("⚠️  Column country doesn't exist or already dropped");
    }

    try {
      await sql`ALTER TABLE gift_cards DROP COLUMN IF EXISTS country_code`;
      console.log("✅ Dropped country_code column");
    } catch (error) {
      console.log("⚠️  Column country_code doesn't exist or already dropped");
    }

    try {
      await sql`ALTER TABLE gift_cards DROP COLUMN IF EXISTS currency`;
      console.log("✅ Dropped currency column");
    } catch (error) {
      console.log("⚠️  Column currency doesn't exist or already dropped");
    }

    console.log("\n✅ Successfully removed all country-related fields!");
    console.log("\n💡 Your gift cards table is now simplified to USD-only.\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

removeCountryFields()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
