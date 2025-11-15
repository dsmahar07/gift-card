const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(connectionString);
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, "../db/migrations/0000_init.sql"),
    "utf8"
  );

  try {
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement) {
        await sql(statement);
        console.log("✓ Executed:", statement.substring(0, 50) + "...");
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();

