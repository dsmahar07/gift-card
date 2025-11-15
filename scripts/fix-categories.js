require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// List of countries to remove from categories
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", 
  "Spain", "Austria", "Belgium", "Netherlands", "Switzerland", "Australia",
  "Brazil", "Mexico", "India", "Japan", "China", "Guatemala", "UAE",
  "Cuba", "Poland", "Romania", "Greece", "Portugal", "Sweden", "Norway",
  "Denmark", "Finland", "Ireland", "New Zealand", "Singapore", "Hong Kong",
  "South Korea", "Thailand", "Malaysia", "Indonesia", "Philippines", "Vietnam",
  "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Egypt", "Turkey",
  "South Africa", "Nigeria", "Kenya", "Ghana", "Morocco", "Algeria"
];

async function fixCategories() {
  console.log("🔧 Fixing gift card categories...\n");
  
  const allCards = await sql`SELECT id, brand, name, category FROM gift_cards WHERE active = true`;
  
  let fixed = 0;
  
  for (const card of allCards) {
    let newCategory = "Gift Cards"; // Default
    
    // Check if current category is a country name
    const isCountry = COUNTRIES.some(country => 
      card.category && card.category.includes(country)
    );
    
    // Determine proper category based on brand/name
    const brandLower = card.brand.toLowerCase();
    const nameLower = card.name.toLowerCase();
    const combined = brandLower + " " + nameLower;
    
    if (combined.includes("gaming") || combined.includes("game") || 
        combined.includes("xbox") || combined.includes("playstation") || 
        combined.includes("nintendo") || combined.includes("steam") ||
        combined.includes("mobile legends") || combined.includes("pubg") ||
        combined.includes("free fire") || combined.includes("ea play")) {
      newCategory = "Gaming";
    } else if (combined.includes("netflix") || combined.includes("spotify") || 
               combined.includes("hulu") || combined.includes("disney") ||
               combined.includes("paramount") || combined.includes("streaming")) {
      newCategory = "Entertainment";
    } else if (combined.includes("amazon") || combined.includes("walmart") || 
               combined.includes("target") || combined.includes("shop") ||
               combined.includes("retail") || combined.includes("ikea") ||
               combined.includes("decathlon")) {
      newCategory = "Shopping";
    } else if (combined.includes("restaurant") || combined.includes("food") ||
               combined.includes("steak") || combined.includes("eat") ||
               combined.includes("starbucks") || combined.includes("coffee")) {
      newCategory = "Food & Dining";
    } else if (combined.includes("hotel") || combined.includes("airbnb") ||
               combined.includes("travel") || combined.includes("booking")) {
      newCategory = "Travel";
    } else if (combined.includes("uber") || combined.includes("lyft") ||
               combined.includes("transport")) {
      newCategory = "Transportation";
    }
    
    // Update if category changed or is a country name
    if (isCountry || !card.category || card.category === "General") {
      await sql`
        UPDATE gift_cards 
        SET category = ${newCategory}
        WHERE id = ${card.id}
      `;
      console.log(`✓ ${card.brand}: ${card.category || 'None'} → ${newCategory}`);
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} gift card categories`);
  
  // Show category distribution
  const distribution = await sql`
    SELECT category, COUNT(*) as count
    FROM gift_cards
    WHERE active = true
    GROUP BY category
    ORDER BY count DESC
  `;
  
  console.log("\n📊 Category Distribution:");
  distribution.forEach(row => {
    console.log(`  ${row.category}: ${row.count} cards`);
  });
}

fixCategories().catch(console.error);
