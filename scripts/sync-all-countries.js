const { spawn } = require("child_process");

// Priority countries to sync
const COUNTRIES = [
  "US",  // United States
  "CA",  // Canada
  "GB",  // United Kingdom
  "AU",  // Australia
  "DE",  // Germany
  "FR",  // France
  "IT",  // Italy
  "ES",  // Spain
  "BR",  // Brazil
  "MX",  // Mexico
  "IN",  // India
  "SG",  // Singapore
  "AE",  // United Arab Emirates
];

async function syncCountry(countryCode) {
  return new Promise((resolve, reject) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🌍 Starting sync for ${countryCode}`);
    console.log(`${"=".repeat(60)}\n`);

    const child = spawn("node", ["scripts/sync-reloadly-products.js", countryCode], {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${countryCode} sync completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${countryCode} sync failed with code ${code}\n`);
        resolve(); // Continue with other countries even if one fails
      }
    });

    child.on("error", (error) => {
      console.error(`\n❌ ${countryCode} sync error:`, error.message, "\n");
      resolve(); // Continue with other countries
    });
  });
}

async function syncAllCountries() {
  console.log("\n🚀 Starting multi-country gift card sync...\n");
  console.log(`📋 Countries to sync: ${COUNTRIES.join(", ")}\n`);

  const startTime = Date.now();

  for (const country of COUNTRIES) {
    await syncCountry(country);
    // Small delay between countries to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL COUNTRIES SYNCED!");
  console.log("=".repeat(60));
  console.log(`⏱️  Total time: ${duration} minutes`);
  console.log(`📊 Countries processed: ${COUNTRIES.length}`);
  console.log("\n✅ Your gift card store is now globally ready!\n");
}

// Run the sync
syncAllCountries().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
