import knex from 'knex';
import knexConfig from '../../knexfile.js';

let dbInstance;

export function getDb() {
  if (!dbInstance) {
    const environment = process.env.NODE_ENV || 'development';
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is required to connect to Supabase Postgres.');
    }

    const config = knexConfig[environment];

    if (!config) {
      throw new Error(`Knex configuration missing for environment: ${environment}`);
    }

    dbInstance = knex({
      ...config,
      connection: {
        connectionString,
        ssl:
          config.connection?.ssl ??
          (process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false)
      }
    });
  }

  return dbInstance;
}

export async function ensureDatabase() {
  const db = getDb();
  await db.raw('select 1');
}

export async function closeDb() {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = undefined;
  }
}
