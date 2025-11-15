// CRITICAL: Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local before importing anything that needs env vars
const envPath = resolve(process.cwd(), ".env.local");
const result = config({ path: envPath });

if (result.error) {
  console.warn("Warning: Could not load .env.local:", result.error.message);
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found in environment variables");
  console.error("Make sure .env.local exists and contains DATABASE_URL");
  process.exit(1);
}

// Now import modules that depend on environment variables
import { db } from "../lib/db";
import { giftCards } from "../db/schema";
import { getProducts } from "../lib/reloadly";
import { eq } from "drizzle-orm";

async function seedGiftCards() {
  try {
    console.log("Fetching products from Reloadly...");
    
    // Fetch products from Reloadly (US market)
    const products = await getProducts("US", 1, 50);
    
    console.log(`Found ${products.content.length} products`);
    
    let added = 0;
    let skipped = 0;

    for (const product of products.content) {
      try {
        // Check if product already exists
        const existing = await db
          .select()
          .from(giftCards)
          .where(eq(giftCards.reloadlyProductId, product.productId))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Determine denominations
        let denominations: number[] = [];
        if (product.fixedRecipientDenominations && product.fixedRecipientDenominations.length > 0) {
          denominations = product.fixedRecipientDenominations;
        } else if (product.minRecipientDenomination && product.maxRecipientDenomination) {
          // Create common denominations between min and max
          const min = product.minRecipientDenomination;
          const max = product.maxRecipientDenomination;
          if (max <= 100) {
            denominations = [min, Math.floor((min + max) / 2), max].filter((v, i, arr) => arr.indexOf(v) === i);
          } else {
            denominations = [25, 50, 100].filter(d => d >= min && d <= max);
          }
        }

        if (denominations.length === 0) {
          skipped++;
          continue;
        }

        // Get image URL
        const imageUrl = product.logoUrls && product.logoUrls.length > 0 
          ? product.logoUrls[0] 
          : `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.brand.brandName)}`;

        // Insert gift card
        await db.insert(giftCards).values({
          brand: product.brand.brandName,
          name: product.productName,
          image: imageUrl,
          category: product.country?.name || "General",
          denominations: JSON.stringify(denominations),
          reloadlyProductId: product.productId,
          active: true,
        });

        added++;
        console.log(`✓ Added: ${product.brand.brandName} - ${product.productName}`);
      } catch (error: any) {
        console.error(`Error adding ${product.productName}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Added: ${added} gift cards`);
    console.log(`   Skipped: ${skipped} products`);
  } catch (error) {
    console.error("Error seeding gift cards:", error);
    process.exit(1);
  }
}

// Run if called directly
seedGiftCards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
