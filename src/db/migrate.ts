import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  await migrate(db, { migrationsFolder: "./migrations" });
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
