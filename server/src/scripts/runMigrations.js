import dotenv from 'dotenv';
import { runMigrations } from '../lib/database.js';

dotenv.config();

runMigrations()
  .then(() => {
    console.log('Migrations completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed', error);
    process.exit(1);
  });
