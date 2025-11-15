require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function cleanupDatabase() {
  try {
    console.log("🧹 Starting database cleanup...\n");

    // 1. Find and handle duplicate gift cards (keeping the most recent one)
    console.log("🔍 Checking for duplicate gift cards by brand...");
    const duplicates = await sql`
      SELECT brand, COUNT(*) as count, ARRAY_AGG(id ORDER BY created_at DESC) as ids
      FROM gift_cards
      GROUP BY brand
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} brands with duplicates`);
      
      for (const dup of duplicates) {
        // Keep the first ID (most recent), mark others as inactive
        const idsToDeactivate = dup.ids.slice(1);
        console.log(`  Deactivating ${idsToDeactivate.length} duplicate(s) of "${dup.brand}"`);
        
        // First check if any have orders
        const hasOrders = await sql`
          SELECT COUNT(*) as count FROM orders 
          WHERE gift_card_id = ANY(${idsToDeactivate})
        `;
        
        if (hasOrders[0].count > 0) {
          // Just mark as inactive if they have orders
          await sql`
            UPDATE gift_cards 
            SET active = false
            WHERE id = ANY(${idsToDeactivate})
          `;
          console.log(`    (kept ${hasOrders[0].count} card(s) with existing orders, marked inactive)`);
        } else {
          // Safe to delete if no orders
          await sql`
            DELETE FROM gift_cards 
            WHERE id = ANY(${idsToDeactivate})
          `;
          console.log(`    (deleted safely)`);
        }
      }
      console.log("✅ Duplicates handled\n");
    } else {
      console.log("✅ No duplicates found\n");
    }

    // 2. Validate and fix denominations format
    console.log("🔍 Validating denomination formats...");
    const allCards = await sql`SELECT id, brand, denominations FROM gift_cards`;
    
    let fixed = 0;
    for (const card of allCards) {
      try {
        const denoms = JSON.parse(card.denominations);
        
        // Ensure it's an array
        if (!Array.isArray(denoms)) {
          console.log(`  ⚠️  Invalid denominations for ${card.brand}: not an array`);
          continue;
        }

        // Filter and validate denominations (must be numbers between 10-500)
        const validDenoms = denoms
          .filter(d => typeof d === 'number' && d >= 10 && d <= 500)
          .sort((a, b) => a - b);

        if (validDenoms.length === 0) {
          console.log(`  ⚠️  No valid denominations for ${card.brand}, marking as inactive`);
          await sql`UPDATE gift_cards SET active = false WHERE id = ${card.id}`;
          fixed++;
        } else if (JSON.stringify(validDenoms) !== JSON.stringify(denoms)) {
          console.log(`  ✓ Fixed denominations for ${card.brand}`);
          await sql`UPDATE gift_cards SET denominations = ${JSON.stringify(validDenoms)} WHERE id = ${card.id}`;
          fixed++;
        }
      } catch (error) {
        console.log(`  ⚠️  Error processing ${card.brand}: ${error.message}`);
      }
    }

    if (fixed > 0) {
      console.log(`✅ Fixed ${fixed} card(s)\n`);
    } else {
      console.log("✅ All denominations are valid\n");
    }

    // 3. Remove inactive cards that have no orders
    console.log("🔍 Removing inactive cards without orders...");
    const removed = await sql`
      DELETE FROM gift_cards 
      WHERE active = false
      AND id NOT IN (SELECT DISTINCT gift_card_id FROM orders)
    `;
    console.log(`✅ Removed ${removed.length} inactive card(s)\n`);
    
    // Count inactive cards that were kept due to orders
    const keptInactive = await sql`
      SELECT COUNT(*) as count FROM gift_cards
      WHERE active = false
    `;
    if (keptInactive[0].count > 0) {
      console.log(`📌 Kept ${keptInactive[0].count} inactive card(s) with existing orders\n`);
    }

    // 4. Show final statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_cards,
        COUNT(DISTINCT brand) as unique_brands,
        COUNT(CASE WHEN active = true THEN 1 END) as active_cards
      FROM gift_cards
    `;

    console.log("📊 Database Statistics:");
    console.log(`   Total cards: ${stats[0].total_cards}`);
    console.log(`   Unique brands: ${stats[0].unique_brands}`);
    console.log(`   Active cards: ${stats[0].active_cards}`);
    console.log("\n✨ Cleanup complete!");

  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
}

cleanupDatabase();
