require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function addCountryFields() {
  try {
    console.log("🔄 Adding country fields to gift_cards table...\n");

    // Add country field (nullable first to handle existing data)
    await sql`
      ALTER TABLE gift_cards 
      ADD COLUMN IF NOT EXISTS country TEXT
    `;
    console.log("✓ Added country field");

    // Add countryCode field (nullable first)
    await sql`
      ALTER TABLE gift_cards 
      ADD COLUMN IF NOT EXISTS country_code TEXT
    `;
    console.log("✓ Added country_code field");

    // Add currency field (nullable first)
    await sql`
      ALTER TABLE gift_cards 
      ADD COLUMN IF NOT EXISTS currency TEXT
    `;
    console.log("✓ Added currency field");

    // Update existing records with default values
    await sql`
      UPDATE gift_cards 
      SET 
        country = COALESCE(country, 'United States'),
        country_code = COALESCE(country_code, 'US'),
        currency = COALESCE(currency, 'USD')
      WHERE country IS NULL OR country_code IS NULL OR currency IS NULL
    `;
    console.log("✓ Updated existing records with defaults");

    // Now make the fields NOT NULL
    await sql`
      ALTER TABLE gift_cards 
      ALTER COLUMN country SET NOT NULL,
      ALTER COLUMN country SET DEFAULT 'United States'
    `;
    console.log("✓ Set country as NOT NULL");

    await sql`
      ALTER TABLE gift_cards 
      ALTER COLUMN country_code SET NOT NULL,
      ALTER COLUMN country_code SET DEFAULT 'US'
    `;
    console.log("✓ Set country_code as NOT NULL");

    await sql`
      ALTER TABLE gift_cards 
      ALTER COLUMN currency SET NOT NULL,
      ALTER COLUMN currency SET DEFAULT 'USD'
    `;
    console.log("✓ Set currency as NOT NULL");

    // Create index on country_code for faster filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_country_code 
      ON gift_cards(country_code) 
      WHERE active = true
    `;
    console.log("✓ Created index on country_code");

    console.log("\n✅ Migration completed successfully!");
    console.log("🎉 Gift cards now support country-specific filtering!\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

addCountryFields();
