import 'dotenv/config';

const sslRequired = process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production';

const sharedConfig = {
  client: 'pg',
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'js'
  },
  pool: {
    min: 0,
    max: 10
  },
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: sslRequired ? { rejectUnauthorized: false } : false
  }
};

export default {
  development: sharedConfig,
  production: sharedConfig,
  test: sharedConfig
};
