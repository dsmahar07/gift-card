import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../lib/db";
import { giftCards } from "../db/schema";
import { eq } from "drizzle-orm";

// Map brand names to logo filenames in /public/giftcard-logos/
const logoMapping: Record<string, string> = {
  "Amazon": "/giftcard-logos/Amazon_logo.svg",
  "Netflix": "/giftcard-logos/Netflix.png",
  "Spotify": "/giftcard-logos/Spotify.webp",
  "Steam": "/giftcard-logos/Steam.webp",
  "Apple": "/giftcard-logos/apple.webp",
  // Add more as you add logos
};

async function updateGiftCardLogos() {
  try {
    console.log("Updating gift card logos...\n");

    for (const [brand, logoPath] of Object.entries(logoMapping)) {
      try {
        const result = await db
          .update(giftCards)
          .set({ image: logoPath })
          .where(eq(giftCards.brand, brand));
        
        console.log(`✅ Updated ${brand}: ${logoPath}`);
      } catch (error: any) {
        console.error(`❌ Error updating ${brand}:`, error.message);
      }
    }

    console.log("\n✅ Done! All gift card logos updated.");
    console.log("💡 Gift cards now use local logos from /public/giftcard-logos/");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateGiftCardLogos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
