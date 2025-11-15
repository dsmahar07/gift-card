require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function checkContent() {
  console.log("📊 Checking database content...\n");
  
  const cards = await sql`
    SELECT id, brand, name, category, denominations 
    FROM gift_cards 
    WHERE active = true 
    ORDER BY brand
    LIMIT 20
  `;
  
  console.log(`Found ${cards.length} active gift cards:\n`);
  cards.forEach(card => {
    console.log(`${card.brand} - ${card.name}`);
    console.log(`  Category: ${card.category || 'None'}`);
    console.log(`  Denominations: ${card.denominations}`);
    console.log();
  });
}

checkContent().catch(console.error);
