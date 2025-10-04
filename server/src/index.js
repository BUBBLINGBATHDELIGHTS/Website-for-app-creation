import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import { ensureDatabase, closeDb } from './lib/database.js';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors(
    allowedOrigin
      ? {
          origin: allowedOrigin,
          credentials: true
        }
      : {}
  )
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  ensureDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`API server listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server', error);
      process.exit(1);
    });
}

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});

export default app;
