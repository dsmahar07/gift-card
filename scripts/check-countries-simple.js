const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function checkCountries() {
  try {
    const result = await sql`
      SELECT 
        country_code, 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active_count
      FROM gift_cards 
      GROUP BY country_code 
      ORDER BY total DESC
    `;
    
    console.log("Gift cards by country:\n");
    result.forEach(row => {
      console.log(`${row.country_code}: ${row.active_count}/${row.total} active`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkCountries();
