# Gift Card System Update Summary

## Changes Made

### 1. ✅ Updated Sync Script (`scripts/sync-reloadly-products.js`)

**Changes:**
- Removed country-specific filtering - now fetches ALL global gift cards
- Implemented pagination to fetch up to 2000 products (10 pages × 200 products)
- Added USD-only filtering - only products with `senderCurrencyCode = "USD"` are included
- Added duplicate detection using brand name + product ID
- Enhanced denomination parsing to prefer USD sender denominations
- Added denomination validation (10-500 USD range)
- Improved category assignment based on brand names
- Added detailed logging for each product synced

**Key Features:**
- Fetches global products (not limited to specific countries)
- Ensures all pricing is in USD
- Prevents duplicate gift cards
- Validates and filters denominations appropriately

### 2. ✅ Created Cleanup Script (`scripts/cleanup-database.js`)

**Features:**
- Removes duplicate gift cards while preserving data integrity
- Handles foreign key constraints (keeps cards referenced in orders)
- Validates denomination formats
- Marks invalid cards as inactive instead of deleting them
- Provides detailed statistics after cleanup

### 3. ✅ Database Schema

**Current State:**
- Already USD-only (no country fields exist)
- `reloadly_product_id` is unique to prevent duplicates
- `currency` field in orders defaults to "USD"
- All denominations stored as JSON arrays in USD

### 4. ✅ Frontend Filters

**Current State:**
- No country filtering exists
- Filters work by: category, brand, and search query
- All pricing displayed in USD

## What Was Accomplished

✅ **Country-Specific Logic Removed:** System is now global
✅ **USD-Only Pricing:** All gift cards and transactions in USD
✅ **Duplicate Prevention:** Unique constraint on `reloadly_product_id`
✅ **Proper Pricing Options:** Denominations validated and standardized (10-500 USD)
✅ **Database Cleaned:** Removed duplicates and invalid entries

## What You Need to Do

### 1. Fix Reloadly Authentication

The sync script encountered an authentication error:
```
CREDENTIAL_VS_ENVIRONMENT_MISMATCH
```

**To fix this, you need to:**

1. Check your `.env.local` file and ensure you have:
   ```env
   RELOADLY_CLIENT_ID="your_client_id"
   RELOADLY_CLIENT_SECRET="your_client_secret"
   RELOADLY_SANDBOX="true"  # or "false" for production
   ```

2. **Important:** The sync script uses the **Gift Cards API**, not the Topups API. Make sure your credentials are for the correct Reloadly product:
   - Gift Cards API credentials (what the sync script needs)
   - Base URLs:
     - Sandbox: `https://giftcards-sandbox.reloadly.com`
     - Production: `https://giftcards.reloadly.com`

3. If you're using sandbox credentials, set `RELOADLY_SANDBOX="true"`
4. If you're using production credentials, set `RELOADLY_SANDBOX="false"` or remove the line

### 2. Run the Sync Script Again

Once authentication is fixed:
```bash
node scripts/sync-reloadly-products.js
```

This will:
- Fetch all available global gift cards
- Filter for USD-only products
- Remove duplicates automatically
- Add/update cards in your database

### 3. Verify the Results

After syncing, check:
- All gift cards are displayed on the homepage
- Pricing is in USD
- No duplicate cards appear
- Filters work correctly (category, brand, search)

## Database Statistics (After Cleanup)

- **Total cards:** 47
- **Unique brands:** 42  
- **Active cards:** 41
- **Inactive cards with orders:** 6 (kept for data integrity)

## Next Steps

1. Fix Reloadly authentication
2. Run `node scripts/sync-reloadly-products.js`
3. Test the website to ensure all features work
4. Monitor for any issues

## Notes

- The database already had some gift cards, which were cleaned up
- Cards with existing orders were preserved (even if marked inactive)
- All new cards will be in USD only
- The system is now completely country-agnostic
