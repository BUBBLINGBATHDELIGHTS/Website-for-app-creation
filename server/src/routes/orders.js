import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';

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
    const db = getDb();

    const result = await db.transaction(async (trx) => {
      const [customer] = await trx('customers')
        .insert({
          email: payload.customer.email,
          name: payload.customer.name,
          has_account: payload.customer.hasAccount
        })
        .onConflict('email')
        .merge({ name: payload.customer.name, has_account: payload.customer.hasAccount })
        .returning('*');

      const [order] = await trx('orders')
        .insert({
          customer_id: customer.id,
          subtotal: payload.totals.subtotal,
          discount: payload.totals.discount,
          total: payload.totals.total,
          payment_brand: payload.payment.brand,
          payment_last4: payload.payment.last4
        })
        .returning('*');

      await trx('shipping_addresses').insert({
        order_id: order.id,
        address_line: payload.customer.address,
        city: payload.customer.city,
        postal_code: payload.customer.postalCode
      });

      for (const item of payload.items) {
        await trx('order_items').insert({
          order_id: order.id,
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        });

        await trx('products')
          .where({ id: item.id })
          .decrement('inventory', item.quantity);

        await trx('inventory_ledger').insert({
          product_id: item.id,
          delta: -item.quantity,
          reason: `Order ${order.id}`
        });
      }

      return order;
    });

    res.status(201).json({
      id: result.id,
      createdAt: result.created_at instanceof Date ? result.created_at.toISOString() : result.created_at,
      rewardProgress: Math.min(100, Math.round(payload.totals.total * 5)),
      tier: payload.totals.total > 150 ? 'VIP Splash' : 'Soak Star'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const db = getDb();

    const order = await db('orders as o')
      .select(
        'o.id',
        'o.created_at',
        'o.subtotal',
        'o.discount',
        'o.total',
        'c.name as customer_name',
        'c.email',
        'c.has_account',
        's.address_line',
        's.city',
        's.postal_code'
      )
      .leftJoin('customers as c', 'c.id', 'o.customer_id')
      .leftJoin('shipping_addresses as s', 's.order_id', 'o.id')
      .where('o.id', orderId)
      .first();

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const items = await db('order_items')
      .select('product_id', 'name', 'quantity', 'unit_price')
      .where('order_id', orderId);

    const createdAt = order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at;

    res.json({
      id: order.id,
      createdAt,
      customer: {
        name: order.customer_name,
        email: order.email,
        address: order.address_line,
        city: order.city,
        postalCode: order.postal_code
      },
      items: items.map((item) => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.unit_price)
      })),
      totals: {
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total)
      },
      fulfillment: {
        carrier: 'BubblePost',
        trackingNumber: `BB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      },
      timeline: [
        { status: 'Order Placed', description: 'We received your order', timestamp: createdAt },
        {
          status: 'In Production',
          description: 'Hand-pressing your artisanal goodies',
          timestamp: new Date(new Date(createdAt).getTime() + 60 * 60 * 1000).toISOString()
        },
        {
          status: 'Ready to Ship',
          description: 'Packed with eco-friendly materials',
          timestamp: new Date(new Date(createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  } catch (error) {
    next(error);
  }
});

export default router;
