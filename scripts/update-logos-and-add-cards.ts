import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { giftCards } from "../db/schema";
import { eq, sql } from "drizzle-orm";

// Map of brand names to local logo paths
const logoMap: Record<string, string> = {
  "Amazon": "/giftcard-logos/amazon.svg",
  "Apple": "/giftcard-logos/apple.svg",
  "Netflix": "/giftcard-logos/netflix.svg",
  "Steam": "/giftcard-logos/steam.svg",
  "Spotify": "/giftcard-logos/spotify.svg",
  "Google Play": "/giftcard-logos/google_play.svg",
  "Airbnb": "/giftcard-logos/airbnb.svg",
  "PlayStation": "/giftcard-logos/playstation.svg",
};

// New gift cards to add (for logos we have but cards don't exist)
const newGiftCards = [
  {
    brand: "Airbnb",
    name: "Airbnb Gift Card",
    image: "/giftcard-logos/airbnb.svg",
    category: "Travel",
    denominations: JSON.stringify([25, 50, 100, 200, 500]),
    reloadlyProductId: 7001, // Placeholder - update with real ID
    active: true,
  },
  {
    brand: "PlayStation",
    name: "PlayStation Store Gift Card",
    image: "/giftcard-logos/playstation.svg",
    category: "Gaming",
    denominations: JSON.stringify([10, 25, 50, 75, 100]),
    reloadlyProductId: 7002, // Placeholder - update with real ID
    active: true,
  },
  {
    brand: "Google Play",
    name: "Google Play Gift Card",
    image: "/giftcard-logos/google_play.svg",
    category: "Entertainment",
    denominations: JSON.stringify([10, 25, 50, 100]),
    reloadlyProductId: 7003, // Placeholder - update with real ID
    active: true,
  },
];

async function updateLogosAndAddCards() {
  try {
    console.log("🔄 Updating gift card logos to use local files...\n");

    // Update existing cards with local logos
    for (const [brand, logoPath] of Object.entries(logoMap)) {
      try {
        const result = await db
          .update(giftCards)
          .set({ image: logoPath })
          .where(eq(giftCards.brand, brand))
          .returning();

        if (result.length > 0) {
          console.log(`✅ Updated ${brand} logo to ${logoPath}`);
        } else {
          console.log(`⏭️  ${brand} not found in database (will add if new)`);
        }
      } catch (error: any) {
        console.error(`❌ Error updating ${brand}:`, error.message);
      }
    }

    console.log("\n🆕 Adding new gift cards...\n");

    // Add new gift cards
    for (const card of newGiftCards) {
      try {
        // Check if already exists
        const existing = await db
          .select()
          .from(giftCards)
          .where(eq(giftCards.brand, card.brand))
          .limit(1);

        if (existing.length > 0) {
          console.log(`⏭️  Skipped: ${card.brand} (already exists)`);
          continue;
        }

        await db.insert(giftCards).values(card);
        console.log(`✅ Added: ${card.brand}`);
      } catch (error: any) {
        console.error(`❌ Error adding ${card.brand}:`, error.message);
      }
    }

    console.log("\n✅ Done! All logos updated and new cards added.");
    console.log("\n📝 Note: New cards use placeholder Reloadly product IDs.");
    console.log("   Update them with real IDs from Reloadly API when ready.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateLogosAndAddCards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

