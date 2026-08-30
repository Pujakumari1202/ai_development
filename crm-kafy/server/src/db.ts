import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

export async function migrate(): Promise<void> {
  const migrationsDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../migrations",
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migration (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const filename of files) {
    const applied = await pool.query(
      "SELECT 1 FROM schema_migration WHERE filename = $1",
      [filename],
    );
    if (applied.rowCount) continue;

    const sql = await fs.readFile(path.join(migrationsDirectory, filename), "utf8");
    const client = await pool.connect();
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migration(filename) VALUES ($1)",
        [filename],
      );
    } finally {
      client.release();
    }
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
