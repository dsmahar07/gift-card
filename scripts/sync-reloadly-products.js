const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const RELOADLY_CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
const RELOADLY_CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
const RELOADLY_SANDBOX = process.env.RELOADLY_SANDBOX === "true";

const BASE_URL = RELOADLY_SANDBOX
  ? "https://topups-sandbox.reloadly.com"
  : "https://topups.reloadly.com";

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!RELOADLY_CLIENT_ID || !RELOADLY_CLIENT_SECRET) {
    throw new Error("Reloadly credentials not configured");
  }

  const response = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/com.reloadly.topups-v1+json",
    },
    body: JSON.stringify({
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: "https://topups.reloadly.com",
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

async function fetchProducts(page = 1, size = 50) {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}/products`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  url.searchParams.append("countryCode", "US");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/com.reloadly.topups-v1+json",
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
    console.log("🔐 Authenticating with Reloadly...");
    await getAccessToken();
    console.log("✅ Authenticated!\n");

    console.log("📦 Fetching products from Reloadly...");
    const data = await fetchProducts(1, 20); // Get first 20 products
    
    if (!data.content || data.content.length === 0) {
      console.log("⚠️  No products found in Reloadly.");
      return;
    }

    console.log(`Found ${data.content.length} products\n`);

    let added = 0;
    let skipped = 0;

    for (const product of data.content) {
      try {
        // Parse denominations
        const denominations = product.fixedRecipientDenominations?.length > 0
          ? product.fixedRecipientDenominations
          : [product.minRecipientDenomination || 10];

        // Get image URL
        const imageUrl = product.logoUrls?.[0] || "https://via.placeholder.com/300";

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
            ${product.country?.name || "General"},
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
        
        console.log(`✓ Added/Updated: ${product.productName}`);
        added++;
      } catch (error) {
        console.error(`✗ Error adding ${product.productName}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Sync complete!`);
    console.log(`   Added/Updated: ${added}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\n🎉 Gift cards are now available in your store!`);
  } catch (error) {
    console.error("❌ Error syncing products:", error.message);
    process.exit(1);
  }
}

syncProducts();

