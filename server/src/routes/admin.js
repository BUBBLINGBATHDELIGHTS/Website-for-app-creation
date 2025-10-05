import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth({ allowedRoles: ['admin'] }));

router.get('/overview', async (_req, res, next) => {
  try {
    const db = getDb();
    const [productCount] = await db('products').count({ count: '*' });
    const [orderCount] = await db('orders').count({ count: '*' });
    const [customerCount] = await db('customers').count({ count: '*' });
    const revenue = await db('orders').sum({ total: 'total' });

    res.json({
      products: Number(productCount?.count ?? 0),
      orders: Number(orderCount?.count ?? 0),
      customers: Number(customerCount?.count ?? 0),
      revenue: Number(revenue?.[0]?.total ?? 0)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/inventory', async (_req, res, next) => {
  try {
    const db = getDb();
    const products = await db('products')
      .select('id', 'name', 'inventory', 'inventory_threshold', 'price', 'is_active')
      .orderBy('name', 'asc');
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.patch('/inventory/:id', async (req, res, next) => {
  try {
    const schema = z.object({ inventory: z.number().int().nonnegative(), isActive: z.boolean().optional() });
    const payload = schema.parse(req.body);
    const db = getDb();

    const updated = await db('products')
      .where({ id: req.params.id })
      .update({ inventory: payload.inventory, is_active: payload.isActive ?? db.raw('is_active') }, '*');

    if (!updated?.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (_req, res, next) => {
  try {
    const db = getDb();
    const orders = await db('orders')
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .orderBy('orders.created_at', 'desc')
      .select(
        'orders.id',
        'orders.status',
        'orders.fulfillment_status',
        'orders.total',
        'orders.discount',
        'orders.subtotal',
        'orders.placed_at',
        'customers.email',
        'customers.name'
      );
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/customers', async (_req, res, next) => {
  try {
    const db = getDb();
    const customers = await db('customers')
      .orderBy('created_at', 'desc')
      .select('id', 'email', 'name', 'created_at', 'has_account', 'loyalty_opt_in');
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

router.get('/discounts', async (_req, res, next) => {
  try {
    const db = getDb();
    const discounts = await db('discounts').select('*').orderBy('created_at', 'desc');
    res.json(discounts);
  } catch (error) {
    next(error);
  }
});

router.post('/discounts', async (req, res, next) => {
  try {
    const schema = z.object({
      code: z.string().min(3),
      percentage: z.number().positive(),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional(),
      usageLimit: z.number().int().positive().optional(),
      stackable: z.boolean().default(false)
    });
    const payload = schema.parse(req.body);
    const db = getDb();

    const [discount] = await db('discounts')
      .insert({
        code: payload.code.toUpperCase(),
        percentage: payload.percentage,
        starts_at: payload.startsAt ?? null,
        expires_at: payload.expiresAt ?? null,
        usage_limit: payload.usageLimit ?? null,
        stackable: payload.stackable
      })
      .returning('*');
    res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
});

router.patch('/discounts/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      percentage: z.number().positive().optional(),
      active: z.boolean().optional(),
      expiresAt: z.string().optional()
    });
    const payload = schema.parse(req.body);
    const db = getDb();

    const update = {};
    if (payload.percentage) update.percentage = payload.percentage;
    if (payload.expiresAt) update.expires_at = payload.expiresAt;
    if (payload.active !== undefined) {
      update.expires_at = payload.active ? null : new Date().toISOString();
    }

    const updated = await db('discounts').where({ id: req.params.id }).update(update, '*');
    if (!updated?.length) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics/sales', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db('orders')
      .select(db.raw("date_trunc('day', placed_at) as day"), db.raw('sum(total) as revenue'))
      .groupBy('day')
      .orderBy('day', 'desc')
      .limit(14);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;
