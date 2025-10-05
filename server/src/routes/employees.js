import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';
import { requireAuth } from '../middleware/auth.js';
import { sendOrderEmail } from '../lib/mailer.js';

const router = Router();

router.use(requireAuth({ allowedRoles: ['employee', 'admin'] }));

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
        'customers.name as customer_name',
        'customers.email as customer_email'
      );

    const orderIds = orders.map((order) => order.id);
    const items = await db('order_items')
      .whereIn('order_id', orderIds)
      .select('order_id', 'name', 'quantity', 'unit_price');

    const itemMap = items.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price)
      });
      return acc;
    }, {});

    res.json(
      orders.map((order) => ({
        id: order.id,
        status: order.status,
        fulfillmentStatus: order.fulfillment_status,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        total: Number(order.total),
        placedAt: order.placed_at,
        customer: {
          name: order.customer_name,
          email: order.customer_email
        },
        items: itemMap[order.id] ?? []
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.string().min(2),
      fulfillmentStatus: z.string().min(2).optional(),
      note: z.string().optional()
    });
    const payload = schema.parse(req.body);
    const db = getDb();

    const [order] = await db('orders')
      .where({ id: req.params.id })
      .update(
        {
          status: payload.status,
          fulfillment_status: payload.fulfillmentStatus ?? db.raw('fulfillment_status')
        },
        '*'
      );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db('order_status_history').insert({
      order_id: order.id,
      status: payload.status,
      note: payload.note ?? null,
      changed_by: req.user.id
    });

    if (payload.status === 'shipped' || payload.status === 'completed') {
      const shipmentStatus = payload.status === 'shipped' ? 'in_transit' : 'delivered';
      await db('shipments').where({ order_id: order.id }).update({ status: shipmentStatus });
    }

    const customer = await db('customers').where({ id: order.customer_id }).first();
    if (customer?.email) {
      await sendOrderEmail({
        to: customer.email,
        subject: `Your order ${order.id} is now ${payload.status}`,
        html: `<p>Hi ${customer.name ?? 'there'},</p><p>Your order status has been updated to <strong>${payload.status}</strong>.</p>`
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/inquiries', async (_req, res, next) => {
  try {
    const db = getDb();
    const inquiries = await db('employee_inquiries')
      .leftJoin('employees', 'employee_inquiries.assigned_to', 'employees.id')
      .orderBy('employee_inquiries.created_at', 'desc')
      .select(
        'employee_inquiries.id',
        'employee_inquiries.customer_email',
        'employee_inquiries.subject',
        'employee_inquiries.message',
        'employee_inquiries.status',
        'employee_inquiries.created_at',
        'employees.name as assignee'
      );
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

router.patch('/inquiries/:id', async (req, res, next) => {
  try {
    const schema = z.object({ status: z.string().min(2), assignTo: z.string().uuid().optional() });
    const payload = schema.parse(req.body);
    const db = getDb();

    const update = {
      status: payload.status,
      assigned_to: payload.assignTo ?? null
    };

    const updated = await db('employee_inquiries')
      .where({ id: req.params.id })
      .update(update, '*');

    if (!updated?.length) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
