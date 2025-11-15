require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// Country codes and names to remove from gift card names
const COUNTRY_SUFFIXES = [
  " US", " UK", " CA", " AU", " DE", " FR", " IT", " ES", " AT", " BE", " NL",
  " CH", " BR", " MX", " IN", " JP", " CN", " GT", " AE", " CU", " PL", " RO",
  " GR", " PT", " SE", " NO", " DK", " FI", " IE", " NZ", " SG", " HK", " KR",
  " TH", " MY", " ID", " PH", " VN", " AR", " CL", " CO", " PE", " VE", " EG",
  " TR", " ZA", " NG", " KE", " GH", " MA", " DZ",
  " United States", " Canada", " United Kingdom", " Germany", " France", 
  " Italy", " Spain", " Austria", " Belgium", " Netherlands", " Switzerland",
  " Australia", " Brazil", " Mexico", " India", " Japan", " China", " Guatemala",
  " UAE", " Cuba", " Poland", " Romania", " Greece", " Portugal", " Sweden"
];

async function cleanCardNames() {
  console.log("🧹 Cleaning gift card names...\n");
  
  const allCards = await sql`SELECT id, brand, name FROM gift_cards WHERE active = true`;
  
  let cleaned = 0;
  
  for (const card of allCards) {
    let newName = card.name;
    let newBrand = card.brand;
    
    // Remove country suffixes from name
    for (const suffix of COUNTRY_SUFFIXES) {
      if (newName.endsWith(suffix)) {
        newName = newName.slice(0, -suffix.length).trim();
      }
      if (newBrand.endsWith(suffix)) {
        newBrand = newBrand.slice(0, -suffix.length).trim();
      }
    }
    
    // Also remove patterns like "Gift Card XX" or "eCard XX" where XX is country code
    newName = newName.replace(/\s+(Gift Card|eCard)\s+[A-Z]{2}$/i, '');
    newName = newName.replace(/\s+[A-Z]{2}$/i, ''); // Remove trailing country codes
    
    // Update if changed
    if (newName !== card.name || newBrand !== card.brand) {
      await sql`
        UPDATE gift_cards 
        SET name = ${newName}, brand = ${newBrand}
        WHERE id = ${card.id}
      `;
      console.log(`✓ ${card.brand} → ${newBrand}`);
      console.log(`  ${card.name} → ${newName}`);
      cleaned++;
    }
  }
  
  console.log(`\n✅ Cleaned ${cleaned} gift card names`);
  
  // Show sample of cleaned names
  const sample = await sql`
    SELECT brand, name 
    FROM gift_cards 
    WHERE active = true 
    ORDER BY brand 
    LIMIT 10
  `;
  
  console.log("\n📋 Sample of cleaned names:");
  sample.forEach(card => {
    console.log(`  ${card.brand} - ${card.name}`);
  });
}

cleanCardNames().catch(console.error);
