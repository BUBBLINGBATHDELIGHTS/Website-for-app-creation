import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';
import { sendOrderEmail } from '../lib/mailer.js';
import { getSupabase } from '../lib/supabase.js';

const router = Router();

const orderSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(3),
    address: z.string().min(3),
    city: z.string().min(2),
    postalCode: z.string().min(3),
    createAccount: z.boolean().default(false),
    password: z.string().min(6).optional(),
    wantsMarketing: z.boolean().default(false)
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
  }),
  discountCode: z.string().optional()
});

router.post('/', async (req, res, next) => {
  const db = getDb();
  try {
    const payload = orderSchema.parse(req.body);

    const discountRecord = payload.discountCode
      ? await db('discounts').whereRaw('upper(code) = upper(?)', payload.discountCode).first()
      : null;

    if (discountRecord) {
      if (discountRecord.expires_at && new Date(discountRecord.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Discount code expired' });
      }
      if (discountRecord.usage_limit && discountRecord.times_used >= discountRecord.usage_limit) {
        return res.status(400).json({ error: 'Discount code fully redeemed' });
      }
    }

    const result = await db.transaction(async (trx) => {
      const [customer] = await trx('customers')
        .insert({
          email: payload.customer.email,
          name: payload.customer.name,
          has_account: payload.customer.createAccount,
          wants_marketing: payload.customer.wantsMarketing,
          loyalty_opt_in: payload.customer.createAccount
        })
        .onConflict('email')
        .merge({
          name: payload.customer.name,
          wants_marketing: payload.customer.wantsMarketing,
          loyalty_opt_in: payload.customer.createAccount
        })
        .returning('*');

      const computedSubtotal = payload.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const loyaltyEligible = payload.customer.createAccount || customer.has_account;
      const loyaltyDiscountAmount = loyaltyEligible ? computedSubtotal * 0.1 : 0;
      const codeDiscountAmount = discountRecord
        ? computedSubtotal * Number(discountRecord.percentage) * 0.01
        : 0;
      const computedDiscount = Math.max(0, loyaltyDiscountAmount + codeDiscountAmount);
      const computedTotal = Math.max(0, computedSubtotal - computedDiscount);

      const orderTotals = {
        subtotal: computedSubtotal,
        discount: computedDiscount,
        total: computedTotal
      };

      const [order] = await trx('orders')
        .insert({
          customer_id: customer.id,
          subtotal: orderTotals.subtotal,
          discount: orderTotals.discount,
          total: orderTotals.total,
          payment_brand: payload.payment.brand,
          payment_last4: payload.payment.last4,
          discount_code: payload.discountCode ? payload.discountCode.toUpperCase() : null,
          status: 'processing',
          fulfillment_status: 'preparing'
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

        await trx('products').where({ id: item.id }).decrement('inventory', item.quantity);
        await trx('inventory_ledger').insert({
          product_id: item.id,
          delta: -item.quantity,
          reason: `Order ${order.id}`
        });
      }

      await trx('order_status_history').insert({
        order_id: order.id,
        status: 'processing',
        note: 'Order confirmed'
      });

      await trx('shipments').insert({
        order_id: order.id,
        carrier: 'BubblePost',
        tracking_number: `BB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        status: 'label_created'
      });

      if (discountRecord) {
        await trx('discounts')
          .where({ id: discountRecord.id })
          .increment('times_used', 1);
      }

      return { order, customer };
    });

    if (payload.customer.createAccount && payload.customer.password) {
      try {
        const supabase = getSupabase();
        await supabase.auth.admin.createUser({
          email: payload.customer.email,
          password: payload.customer.password,
          email_confirm: true,
          user_metadata: { role: 'customer', name: payload.customer.name }
        });
      } catch (error) {
        console.warn('Failed to auto-create Supabase account', error.message);
      }
    }

    await sendOrderEmail({
      to: payload.customer.email,
      subject: 'Your Bubbling Bath Delights order is confirmed',
      html: `<p>Hi ${payload.customer.name},</p><p>Thanks for your order! Your items are being prepared.</p>`
    });

    res.status(201).json({
      id: result.order.id,
      createdAt:
        result.order.created_at instanceof Date
          ? result.order.created_at.toISOString()
          : result.order.created_at,
      rewardProgress: Math.min(100, Math.round(Number(result.order.total) * 5)),
      tier: payload.customer.createAccount ? 'Soak Society +' : 'Guest'
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
        'o.status',
        'o.fulfillment_status',
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

    const shipments = await db('shipments')
      .where({ order_id: orderId })
      .select('carrier', 'tracking_number', 'status', 'estimated_delivery');

    const history = await db('order_status_history')
      .where({ order_id: orderId })
      .orderBy('created_at', 'asc')
      .select('status', 'note', 'created_at');

    const createdAt = order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at;

    res.json({
      id: order.id,
      createdAt,
      status: order.status,
      fulfillmentStatus: order.fulfillment_status,
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
      shipments: shipments.map((shipment) => ({
        carrier: shipment.carrier,
        trackingNumber: shipment.tracking_number,
        status: shipment.status,
        estimatedDelivery: shipment.estimated_delivery
      })),
      timeline: history.map((entry) => ({
        status: entry.status,
        description: entry.note,
        timestamp: entry.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
