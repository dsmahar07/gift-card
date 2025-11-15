# Country-Based Gift Card Filtering - Production Setup Guide

## Overview
Your gift card platform now supports **automatic country detection** and **location-based filtering**. Users will only see gift cards available in their country with correct amounts and currencies.

## 🔧 Setup Steps

### 1. Run Database Migration
First, add the country fields to your database:

```bash
node scripts/add-country-fields.js
```

This will:
- Add `country`, `country_code`, and `currency` fields to `gift_cards` table
- Update existing records with default values (United States/US/USD)
- Create an index on `country_code` for fast filtering

### 2. Sync Gift Cards by Country

#### Option A: Sync Single Country
```bash
# Sync US gift cards
node scripts/sync-reloadly-products.js US

# Sync UK gift cards
node scripts/sync-reloadly-products.js GB

# Sync Canada gift cards
node scripts/sync-reloadly-products.js CA
```

#### Option B: Sync All Supported Countries (Recommended)
```bash
node scripts/sync-all-countries.js
```

This will automatically sync gift cards for:
- 🇺🇸 United States (US)
- 🇨🇦 Canada (CA)
- 🇬🇧 United Kingdom (GB)
- 🇦🇺 Australia (AU)
- 🇩🇪 Germany (DE)
- 🇫🇷 France (FR)
- 🇮🇹 Italy (IT)
- 🇪🇸 Spain (ES)
- 🇧🇷 Brazil (BR)
- 🇲🇽 Mexico (MX)
- 🇮🇳 India (IN)
- 🇸🇬 Singapore (SG)
- 🇦🇪 United Arab Emirates (AE)

## 🌍 How It Works

### Automatic Location Detection
The platform automatically detects user location using:
1. **Vercel Edge Network** - `x-vercel-ip-country` header (when deployed on Vercel)
2. **Cloudflare** - `cf-ipcountry` header (if using Cloudflare)
3. **AWS CloudFront** - `cloudfront-viewer-country` header
4. **Generic** - `x-country-code` header
5. **Fallback** - Defaults to United States (US) if detection fails

### What Users See
- ✅ Gift cards **only** for their country
- ✅ Prices in their **local currency** (USD, CAD, GBP, EUR, etc.)
- ✅ Correct **denomination amounts** for their region
- ✅ Country name displayed on each card

### Example Flow
1. User visits your site from Canada 🇨🇦
2. System detects country code: `CA`
3. Database query filters: `WHERE country_code = 'CA'`
4. User sees only Canadian gift cards with CAD prices

## 📊 Database Schema

```sql
gift_cards
├── country          TEXT NOT NULL DEFAULT 'United States'
├── country_code     TEXT NOT NULL DEFAULT 'US'
├── currency         TEXT NOT NULL DEFAULT 'USD'
└── INDEX idx_gift_cards_country_code ON (country_code) WHERE active = true
```

## 🎨 UI Features

### Currency Formatting
Prices are automatically formatted with the correct symbol:
- USD: `$50`
- CAD: `CA$50`
- GBP: `£50`
- EUR: `€50`
- INR: `₹500`
- And more...

### Country Display
Each gift card shows:
- Country name: "United States • Digital Gift Card"
- Local currency symbols
- Region-specific amounts

## 🔒 Production Checklist

Before going live, ensure:

- [ ] Database migration completed successfully
- [ ] Gift cards synced for all target countries
- [ ] At least 5+ gift cards available per supported country
- [ ] Tested location detection on Vercel/production environment
- [ ] Verified currency symbols display correctly
- [ ] Tested checkout flow with different currencies
- [ ] Confirmed Reloadly API credentials are production (not sandbox)
- [ ] Set `RELOADLY_SANDBOX=false` in production environment

## 🧪 Testing

### Local Testing
To test different countries locally, you can manually set the country in the URL:
```
http://localhost:3000/?countryCode=GB  # UK
http://localhost:3000/?countryCode=CA  # Canada
http://localhost:3000/?countryCode=AU  # Australia
```

### Production Testing
Deploy to Vercel/production and test from different locations:
1. Use a VPN to connect from different countries
2. Check that correct gift cards appear
3. Verify currency symbols are correct
4. Test the complete purchase flow

## 📈 Monitoring

### Key Metrics to Track
- Gift cards available per country
- User distribution by country
- Popular gift cards per region
- Currency conversion accuracy

### Database Queries

Check gift cards by country:
```sql
SELECT country_code, COUNT(*) as total
FROM gift_cards 
WHERE active = true 
GROUP BY country_code 
ORDER BY total DESC;
```

Check products needing sync:
```sql
SELECT country_code, COUNT(*) as total
FROM gift_cards 
WHERE active = true 
GROUP BY country_code 
HAVING COUNT(*) < 5;
```

## 🆘 Troubleshooting

### Issue: Users seeing no gift cards
**Solution:** Check if gift cards exist for that country
```bash
node scripts/sync-reloadly-products.js <COUNTRY_CODE>
```

### Issue: Wrong currency displayed
**Solution:** Re-sync gift cards to update currency field
```bash
node scripts/sync-reloadly-products.js <COUNTRY_CODE>
```

### Issue: Location not detected
**Solution:** 
1. Check deployment platform supports geo headers
2. Verify middleware.ts is running
3. Test with manual `?countryCode=XX` parameter

### Issue: Some countries have no products
**Solution:** Not all gift card brands are available in all countries. This is normal. Consider:
1. Syncing more products (increase page size in sync script)
2. Using multiple providers (Ding, TangoCard, etc.)
3. Displaying a message for unsupported countries

## 🚀 Scaling Tips

### Add More Countries
Edit `lib/location.ts` and add to `SUPPORTED_COUNTRIES`:
```typescript
{ code: "JP", name: "Japan", currency: "JPY" },
```

Then sync:
```bash
node scripts/sync-reloadly-products.js JP
```

### Increase Products Per Country
Edit `sync-reloadly-products.js` line 83:
```javascript
const data = await fetchProducts(1, 100, countryCode); // Get 100 products
```

### Add Multiple Provider Support
Uncomment Ding provider in `lib/providers/provider-manager.ts`:
```typescript
this.registerProvider(new DingProvider());
```

## 🎯 Best Practices

1. **Regular Syncs** - Run sync weekly to get new products
2. **Monitor Inventory** - Check products per country monthly
3. **Cache Wisely** - Use Next.js revalidation for performance
4. **Log Locations** - Track which countries visit your site
5. **A/B Testing** - Test different currency displays

## ✅ You're Production Ready!

After completing these steps:
- ✨ Users see location-appropriate gift cards
- 💰 Prices display in local currency
- 🌍 Multiple countries supported
- ⚡ Fast filtering with database indexes
- 🎯 Professional, localized experience

---

**Questions?** Check the inline code comments in:
- `lib/location.ts` - Location detection
- `lib/queries.ts` - Country filtering
- `scripts/sync-reloadly-products.js` - Product sync
