import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../lib/database.js';
import { createOrder, findOrderById } from '../lib/store.js';

const router = Router();

const orderSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(3),
    address: z.string().min(3),
    city: z.string().min(2),
    postalCode: z.string().min(3),
    hasAccount: z.boolean().default(false)
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        imageUrl: z.string().url().optional()
      })
    )
    .min(1),
  payment: z.object({
    brand: z.string(),
    last4: z.string().min(4).max(4),
    holder: z.string().min(3)
  }),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    total: z.number().positive()
  })
});

router.post('/', async (req, res, next) => {
  try {
    const payload = orderSchema.parse(req.body);
    const pool = getPool();

    if (!pool) {
      const order = createOrder(payload);
      res.status(201).json(order);
      return;
    }

    await pool.query('BEGIN');

    const customerResult = await pool.query(
      `INSERT INTO customers (email, name, has_account)
       VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET name = $2, has_account = $3
       RETURNING id`,
      [payload.customer.email, payload.customer.name, payload.customer.hasAccount]
    );

    const customerId = customerResult.rows[0].id;

    const orderResult = await pool.query(
      `INSERT INTO orders (customer_id, subtotal, discount, total, payment_brand, payment_last4)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [
        customerId,
        payload.totals.subtotal,
        payload.totals.discount,
        payload.totals.total,
        payload.payment.brand,
        payload.payment.last4
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of payload.items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, unit_price)
         VALUES ($1,$2,$3,$4,$5)`,
        [orderId, item.id, item.name, item.quantity, item.price]
      );
      await pool.query(`UPDATE products SET inventory = inventory - $1 WHERE id = $2`, [item.quantity, item.id]);
    }

    await pool.query('COMMIT');

    res.status(201).json({
      id: orderId,
      createdAt: orderResult.rows[0].created_at,
      rewardProgress: Math.min(100, Math.round(payload.totals.total * 5)),
      tier: payload.totals.total > 150 ? 'VIP Splash' : 'Soak Star'
    });
  } catch (error) {
    await getPool()?.query('ROLLBACK');
    next(error);
  }
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const pool = getPool();

    if (!pool) {
      const order = findOrderById(orderId);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      res.json(order);
      return;
    }

    const orderResult = await pool.query(
      `SELECT o.id, o.created_at, o.subtotal, o.discount, o.total,
              c.name as customer_name, c.email, c.has_account, s.address_line, s.city, s.postal_code
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       LEFT JOIN shipping_addresses s ON s.order_id = o.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const itemsResult = await pool.query(
      `SELECT product_id, name, quantity, unit_price FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    res.json({
      id: orderId,
      createdAt: orderResult.rows[0].created_at,
      customer: {
        name: orderResult.rows[0].customer_name,
        email: orderResult.rows[0].email,
        address: orderResult.rows[0].address_line,
        city: orderResult.rows[0].city,
        postalCode: orderResult.rows[0].postal_code
      },
      items: itemsResult.rows.map((row) => ({
        id: row.product_id,
        name: row.name,
        quantity: row.quantity,
        price: Number(row.unit_price)
      })),
      totals: {
        subtotal: Number(orderResult.rows[0].subtotal),
        discount: Number(orderResult.rows[0].discount),
        total: Number(orderResult.rows[0].total)
      },
      fulfillment: {
        carrier: 'BubblePost',
        trackingNumber: `BB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      },
      timeline: [
        { status: 'Order Placed', description: 'We received your order', timestamp: orderResult.rows[0].created_at },
        {
          status: 'In Production',
          description: 'Hand-pressing your artisanal goodies',
          timestamp: new Date(new Date(orderResult.rows[0].created_at).getTime() + 60 * 60 * 1000)
        },
        {
          status: 'Ready to Ship',
          description: 'Packed with eco-friendly materials',
          timestamp: new Date(new Date(orderResult.rows[0].created_at).getTime() + 2 * 60 * 60 * 1000)
        }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
