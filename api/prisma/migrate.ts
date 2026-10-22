import { Pool } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const pool = new Pool({ connectionString: databaseUrl });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(7381924)");
  await client.query(
    'CREATE TABLE IF NOT EXISTS "_studio_migrations" (name TEXT PRIMARY KEY, checksum TEXT NOT NULL)',
  );
  const root = new URL("./migrations/", import.meta.url);
  for (const folder of (await readdir(root, { withFileTypes: true }))
    .filter((f) => f.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const sql = await readFile(
      new URL(folder.name + "/migration.sql", root),
      "utf8",
    );
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query(
      'SELECT checksum FROM "_studio_migrations" WHERE name=$1',
      [folder.name],
    );
    if (existing.rows.length) {
      if (existing.rows[0].checksum !== checksum)
        throw new Error("Applied migration changed: " + folder.name);
      continue;
    }
    await client.query(sql);
    await client.query(
      'INSERT INTO "_studio_migrations" (name,checksum) VALUES ($1,$2)',
      [folder.name, checksum],
    );
  }
  await client.query("COMMIT");
  console.log("Studio migrations applied.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
