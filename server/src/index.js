import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import wishlistRouter from './routes/wishlist.js';
import employeesRouter from './routes/employees.js';
import adminRouter from './routes/admin.js';
import accessRouter from './routes/access.js';
import { requireWorkspaceIdentity } from './middleware/workspace.js';
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
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  if (process.env.MAINTENANCE_MODE === 'true') {
    const previewToken = process.env.PREVIEW_ACCESS_TOKEN;
    const provided = req.headers['x-preview-token'];
    if (!previewToken || provided !== previewToken) {
      return res.status(503).json({ message: 'Storefront under construction' });
    }
  }
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/access', accessRouter);
app.use('/api/employees', requireWorkspaceIdentity({ allowedRoles: ['employee', 'admin'] }), employeesRouter);
app.use('/api/admin', requireWorkspaceIdentity({ allowedRoles: ['admin'] }), adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

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
