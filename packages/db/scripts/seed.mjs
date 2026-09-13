// Applies packages/db/seed/seed.sql once, idempotently (the SQL itself guards re-inserts).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.join(__dirname, "..", "seed", "seed.sql");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL env var is required");
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const sql = readFileSync(seedFile, "utf8");
  console.log("applying seed data...");
  await client.query(sql);
  console.log("Seed complete.");
  await client.end();
}

main().catch((err) => {
  console.error("Seed FAILED:", err.message);
  process.exit(1);
});
