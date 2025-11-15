import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { giftCards } from "../db/schema";
import { eq } from "drizzle-orm";

const sampleGiftCards = [
  {
    brand: "Amazon",
    name: "Amazon Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png",
    category: "Shopping",
    denominations: JSON.stringify([25, 50, 100, 200]),
    reloadlyProductId: 1, // Placeholder - will need real ID from Reloadly
    active: true,
  },
  {
    brand: "Steam",
    name: "Steam Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/11/Steam-Logo.png",
    category: "Gaming",
    denominations: JSON.stringify([20, 50, 100]),
    reloadlyProductId: 2,
    active: true,
  },
  {
    brand: "Google Play",
    name: "Google Play Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/11/Google-Play-Logo.png",
    category: "Entertainment",
    denominations: JSON.stringify([25, 50, 100]),
    reloadlyProductId: 3,
    active: true,
  },
  {
    brand: "Apple",
    name: "Apple Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    category: "Technology",
    denominations: JSON.stringify([25, 50, 100, 200]),
    reloadlyProductId: 4,
    active: true,
  },
  {
    brand: "Netflix",
    name: "Netflix Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png",
    category: "Entertainment",
    denominations: JSON.stringify([30, 60, 100]),
    reloadlyProductId: 5,
    active: true,
  },
  {
    brand: "Spotify",
    name: "Spotify Gift Card",
    image: "https://logos-world.net/wp-content/uploads/2020/09/Spotify-Logo.png",
    category: "Entertainment",
    denominations: JSON.stringify([25, 50, 100]),
    reloadlyProductId: 6,
    active: true,
  },
];

async function addSampleGiftCards() {
  try {
    console.log("Adding sample gift cards...\n");

    for (const card of sampleGiftCards) {
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

    console.log(`\n✅ Done! Sample gift cards added.`);
    console.log(`\n⚠️  Note: These use placeholder Reloadly product IDs.`);
    console.log(`   You'll need to update them with real IDs from Reloadly API.`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addSampleGiftCards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

