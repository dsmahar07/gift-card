import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { giftCards } from "../db/schema";
import { eq } from "drizzle-orm";

const updatedDenominations = {
  "Amazon": [25, 50, 100, 200],
  "Steam": [20, 50, 100],
  "Google Play": [25, 50, 100],
  "Apple": [25, 50, 100, 200],
  "Netflix": [30, 60, 100],
  "Spotify": [25, 50, 100],
};

async function updateDenominations() {
  try {
    console.log("Updating gift card denominations to meet $20 minimum...\n");

    for (const [brand, denoms] of Object.entries(updatedDenominations)) {
      try {
        await db
          .update(giftCards)
          .set({ denominations: JSON.stringify(denoms) })
          .where(eq(giftCards.brand, brand));
        
        console.log(`✅ Updated ${brand}: ${denoms.join(', ')}`);
      } catch (error: any) {
        console.error(`❌ Error updating ${brand}:`, error.message);
      }
    }

    console.log("\n✅ Done! All denominations updated.");
    console.log("💡 Minimum payment amount is now $15 USD. Use USDT, TRX, or LTC for best experience!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateDenominations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
