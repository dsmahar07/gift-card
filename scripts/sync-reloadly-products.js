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

async function fetchProducts(page = 1, size = 50, countryCode = "US") {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}/products`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());
  url.searchParams.append("countryCode", countryCode);

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

    // Get country code from command line args or default to US
    const countryCode = process.argv[2] || "US";
    console.log(`📍 Fetching products for country: ${countryCode}\n`);

    console.log("📦 Fetching products from Reloadly...");
    const data = await fetchProducts(1, 20, countryCode); // Get first 20 products
    
    if (!data.content || data.content.length === 0) {
      console.log("⚠️  No products found in Reloadly.");
      return;
    }

    console.log(`Found ${data.content.length} products\n`);

    let added = 0;
    let skipped = 0;

    for (const product of data.content) {
      try {
        // Parse denominations (support fixed or variable range)
        let denominations = [];
        if (Array.isArray(product.fixedRecipientDenominations) && product.fixedRecipientDenominations.length > 0) {
          denominations = product.fixedRecipientDenominations;
        } else if (product.minRecipientDenomination && product.maxRecipientDenomination) {
          denominations = [product.minRecipientDenomination, product.maxRecipientDenomination];
        } else if (Array.isArray(product.fixedSenderDenominations) && product.fixedSenderDenominations.length > 0) {
          denominations = product.fixedSenderDenominations;
        } else if (product.minSenderDenomination && product.maxSenderDenomination) {
          denominations = [product.minSenderDenomination, product.maxSenderDenomination];
        } else {
          // Fallback
          denominations = [10, 100];
        }

        // Get image URL
        const imageUrl = product.logoUrls?.[0] || "https://via.placeholder.com/300";

        // Extract country information
        const country = product.country?.name || "United States";
        const productCountryCode = product.country?.isoName || countryCode;
        const currency = product.recipientCurrencyCode || product.senderCurrencyCode || "USD";
        
        await sql`
          INSERT INTO gift_cards (
            brand, 
            name, 
            image, 
            category, 
            country,
            country_code,
            currency,
            denominations, 
            reloadly_product_id, 
            active
          )
          VALUES (
            ${product.brand?.brandName || product.productName},
            ${product.productName},
            ${imageUrl},
            ${product.brand?.brandName ? "Gift Cards" : "General"},
            ${country},
            ${productCountryCode},
            ${currency},
            ${JSON.stringify(denominations)},
            ${product.productId},
            ${true}
          )
          ON CONFLICT (reloadly_product_id) DO UPDATE SET
            brand = EXCLUDED.brand,
            name = EXCLUDED.name,
            image = EXCLUDED.image,
            category = EXCLUDED.category,
            country = EXCLUDED.country,
            country_code = EXCLUDED.country_code,
            currency = EXCLUDED.currency,
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

