import { Pool } from "pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const { rows: applied } = await client.query(
      `SELECT hash FROM "__drizzle_migrations"`,
    );
    const appliedHashes = new Set(applied.map((r: { hash: string }) => r.hash));

    const migrationsDir = "./migrations";
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of sqlFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      const hash = crypto.createHash("sha256").update(sql).digest("hex");

      if (appliedHashes.has(hash)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
          [hash, Date.now()],
        );
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (err: unknown) {
        await client.query("ROLLBACK");
        const pgErr = err as { code?: string };
        const alreadyExists = ["42P07", "42701", "42710"].includes(pgErr.code ?? "");
        if (alreadyExists) {
          // Object already exists — baseline this migration as applied
          await client.query(
            `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
            [hash, Date.now()],
          );
          console.log(`Baselined ${file} (tables already exist)`);
        } else {
          throw err;
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
