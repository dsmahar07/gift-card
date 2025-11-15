const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

// Sample gift cards data
const sampleGiftCards = [
  {
    brand: "Amazon",
    name: "Amazon Gift Card",
    image: "https://images-na.ssl-images-amazon.com/images/I/61YVqHdFRnL._AC_SL1000_.jpg",
    category: "Shopping",
    denominations: JSON.stringify([25, 50, 100, 200, 500]),
    reloadly_product_id: 1, // Replace with actual Reloadly product ID
    active: true,
  },
  {
    brand: "Steam",
    name: "Steam Gift Card",
    image: "https://cdn.akamai.steamstatic.com/steam/apps/753/header.jpg",
    category: "Gaming",
    denominations: JSON.stringify([10, 20, 50, 100]),
    reloadly_product_id: 2, // Replace with actual Reloadly product ID
    active: true,
  },
  {
    brand: "Google Play",
    name: "Google Play Gift Card",
    image: "https://play.google.com/about/images/play_logo.png",
    category: "Digital",
    denominations: JSON.stringify([10, 25, 50, 100]),
    reloadly_product_id: 3, // Replace with actual Reloadly product ID
    active: true,
  },
  {
    brand: "Apple",
    name: "Apple Gift Card",
    image: "https://www.apple.com/v/apple-card/d/images/overview/hero__fwk7h1h2xue2_large.jpg",
    category: "Digital",
    denominations: JSON.stringify([25, 50, 100, 200]),
    reloadly_product_id: 4, // Replace with actual Reloadly product ID
    active: true,
  },
  {
    brand: "Netflix",
    name: "Netflix Gift Card",
    image: "https://assets.nflxext.com/ffe/siteui/vlv3/ab4b0b22-2ddf-4d48-ae88-c201ae0267e9/0efe6360-4f6d-4b10-beb6-81e0762abfe3/US-en-20231030-popsignuptwoweeks-perspective_alpha_website_large.jpg",
    category: "Entertainment",
    denominations: JSON.stringify([15, 30, 60]),
    reloadly_product_id: 5, // Replace with actual Reloadly product ID
    active: true,
  },
];

async function seedGiftCards() {
  try {
    console.log("Checking existing gift cards...");
    const existing = await sql`SELECT COUNT(*) as count FROM gift_cards`;
    
    if (existing[0].count > 0) {
      console.log(`⚠️  Found ${existing[0].count} existing gift cards. Skipping seed.`);
      console.log("To add sample data, first clear the gift_cards table.");
      return;
    }

    console.log("Adding sample gift cards...");
    
    for (const card of sampleGiftCards) {
      await sql`
        INSERT INTO gift_cards (brand, name, image, category, denominations, reloadly_product_id, active)
        VALUES (${card.brand}, ${card.name}, ${card.image}, ${card.category}, ${card.denominations}, ${card.reloadly_product_id}, ${card.active})
        ON CONFLICT (reloadly_product_id) DO NOTHING
      `;
      console.log(`✓ Added: ${card.brand}`);
    }

    console.log("\n✅ Sample gift cards added successfully!");
    console.log("\n⚠️  IMPORTANT: Update the reloadly_product_id values with actual Reloadly product IDs!");
    console.log("You can get product IDs from the Reloadly API or dashboard.");
  } catch (error) {
    console.error("Error seeding gift cards:", error.message);
  }
}

seedGiftCards();

