import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('DATABASE_URL not configured. Falling back to in-memory store.');
      return null;
    }

    pool = new Pool({ connectionString, ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined });
  }

  return pool;
}

export async function ensureDatabase() {
  const pgPool = getPool();
  if (!pgPool) {
    return;
  }

  const client = await pgPool.connect();
  try {
    await client.query('SELECT NOW()');
  } finally {
    client.release();
  }
}

export async function runMigrations() {
  const pgPool = getPool();
  if (!pgPool) {
    throw new Error('Cannot run migrations without DATABASE_URL');
  }

  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await pgPool.query(sql);
  }
}
