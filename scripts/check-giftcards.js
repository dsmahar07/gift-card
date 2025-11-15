const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function checkGiftCards() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM gift_cards`;
    console.log("Total gift cards in database:", result[0].count);
    
    if (result[0].count === "0") {
      console.log("\n⚠️  No gift cards found in database!");
      console.log("You need to add gift cards to the database.");
      console.log("\nYou can:");
      console.log("1. Use the admin dashboard (once you have admin role)");
      console.log("2. Add them manually via SQL");
      console.log("3. Use the script: npm run seed:giftcards");
    } else {
      const cards = await sql`SELECT id, brand, name, active FROM gift_cards LIMIT 5`;
      console.log("\nSample gift cards:");
      cards.forEach(card => {
        console.log(`- ${card.brand}: ${card.name} (Active: ${card.active})`);
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkGiftCards();

