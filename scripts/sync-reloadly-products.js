require("dotenv").config({ path: ".env.local" });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const RELOADLY_CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
const RELOADLY_CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
const RELOADLY_SANDBOX = process.env.RELOADLY_SANDBOX === "true";

// Use Gift Cards API base
const BASE_URL = RELOADLY_SANDBOX
  ? "https://giftcards-sandbox.reloadly.com"
  : "https://giftcards.reloadly.com";

// OAuth token host is constant
const AUTH_URL = "https://auth.reloadly.com/oauth/token";

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!RELOADLY_CLIENT_ID || !RELOADLY_CLIENT_SECRET) {
    throw new Error("Reloadly credentials not configured");
  }

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: BASE_URL,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reloadly auth failed: ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken;
}

async function fetchProducts(page = 1, size = 200) {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}/products`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  // No countryCode filter - fetch all global products

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/com.reloadly.giftcards-v1+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch products: ${error}`);
  }

  return response.json();
}

async function syncProducts() {
  try {
    console.log("🔐 Authenticating with Reloadly...\n");
    await getAccessToken();
    console.log("✅ Authenticated!\n");

    console.log(`📍 Fetching all global gift cards (USD-based only)\n`);

    let page = 1;
    let totalProducts = 0;
    let added = 0;
    let skipped = 0;
    let hasMore = true;

    // Track unique products by brand name to avoid duplicates
    const processedBrands = new Set();

    while (hasMore) {
      console.log(`📦 Fetching page ${page}...`);
      const data = await fetchProducts(page, 200);
      
      if (!data.content || data.content.length === 0) {
        console.log("No more products found.");
        break;
      }

      console.log(`Found ${data.content.length} products on page ${page}`);
      totalProducts += data.content.length;

      for (const product of data.content) {
        try {
          // Filter: Only USD-based products (sender currency must be USD)
          if (product.senderCurrencyCode && product.senderCurrencyCode !== "USD") {
            skipped++;
            continue;
          }

          // Skip if we've already processed this brand to avoid duplicates
          const brandKey = `${product.brand?.brandName || product.productName}-${product.productId}`;
          if (processedBrands.has(brandKey)) {
            skipped++;
            continue;
          }
          processedBrands.add(brandKey);

          // Parse denominations (support fixed or variable range)
          let denominations = [];
          
          // Prefer sender denominations (USD) over recipient
          if (Array.isArray(product.fixedSenderDenominations) && product.fixedSenderDenominations.length > 0) {
            denominations = product.fixedSenderDenominations;
          } else if (product.minSenderDenomination && product.maxSenderDenomination) {
            denominations = [product.minSenderDenomination, product.maxSenderDenomination];
          } else if (Array.isArray(product.fixedRecipientDenominations) && product.fixedRecipientDenominations.length > 0) {
            denominations = product.fixedRecipientDenominations;
          } else if (product.minRecipientDenomination && product.maxRecipientDenomination) {
            denominations = [product.minRecipientDenomination, product.maxRecipientDenomination];
          } else {
            // Skip products with no denomination info
            skipped++;
            continue;
          }

          // Filter valid denominations (between 10 and 500 USD)
          denominations = denominations.filter(d => d >= 10 && d <= 500);
          if (denominations.length === 0) {
            skipped++;
            continue;
          }

          // Get image URL
          const imageUrl = product.logoUrls?.[0] || "https://via.placeholder.com/300";
          
          // Determine category
          let category = "Gift Cards";
          if (product.brand?.brandName) {
            const brandLower = product.brand.brandName.toLowerCase();
            if (brandLower.includes("gaming") || brandLower.includes("game")) category = "Gaming";
            else if (brandLower.includes("entertainment") || brandLower.includes("streaming")) category = "Entertainment";
            else if (brandLower.includes("shopping") || brandLower.includes("retail")) category = "Shopping";
            else if (brandLower.includes("food") || brandLower.includes("restaurant")) category = "Food & Dining";
          }
          
          await sql`
            INSERT INTO gift_cards (
              brand, 
              name, 
              image, 
              category, 
              denominations, 
              reloadly_product_id, 
              active
            )
            VALUES (
              ${product.brand?.brandName || product.productName},
              ${product.productName},
              ${imageUrl},
              ${category},
              ${JSON.stringify(denominations)},
              ${product.productId},
              ${true}
            )
            ON CONFLICT (reloadly_product_id) DO UPDATE SET
              brand = EXCLUDED.brand,
              name = EXCLUDED.name,
              image = EXCLUDED.image,
              category = EXCLUDED.category,
              denominations = EXCLUDED.denominations,
              active = EXCLUDED.active,
              updated_at = NOW()
          `;
          
          console.log(`✓ ${product.productName} (USD ${JSON.stringify(denominations)})`);
          added++;
        } catch (error) {
          console.error(`✗ Error adding ${product.productName}:`, error.message);
          skipped++;
        }
      }

      // Check if there are more pages
      if (data.content.length < 200 || page >= 10) { // Limit to 10 pages max (2000 products)
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`\n✅ Sync complete!`);
    console.log(`   Total products fetched: ${totalProducts}`);
    console.log(`   Added/Updated: ${added}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\n🎉 Gift cards are now available in your store!`);
  } catch (error) {
    console.error("❌ Error syncing products:", error.message);
    process.exit(1);
  }
}

syncProducts();

