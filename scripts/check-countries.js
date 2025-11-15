require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function checkCountries() {
  try {
    const results = await sql`
      SELECT 
        country_code, 
        currency, 
        COUNT(*) as count 
      FROM gift_cards 
      WHERE active = true
      GROUP BY country_code, currency
      ORDER BY count DESC
    `;
    
    console.log("\n📊 Gift Cards by Country:\n");
    console.table(results);
    
    const total = await sql`SELECT COUNT(*) as total FROM gift_cards WHERE active = true`;
    console.log(`\n✅ Total active gift cards: ${total[0].total}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkCountries();
