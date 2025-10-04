import knex from 'knex';
import knexConfig from '../../knexfile.js';
import 'dotenv/config';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL must be set before running migrations.');
  process.exit(1);
}

async function migrate() {
  const db = knex({
    ...config,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl:
        config.connection?.ssl ??
        (process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false)
    }
  });

  try {
    await db.migrate.latest();
    console.log('Migrations completed');
  } finally {
    await db.destroy();
  }
}

migrate().catch((error) => {
  console.error('Migration failed', error);
  process.exit(1);
});
