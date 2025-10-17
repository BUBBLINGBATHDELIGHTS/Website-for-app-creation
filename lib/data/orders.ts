import { z } from 'zod';
import { mutateJsonFile, readJsonFile } from './fs-store';
import { decrementInventory } from './products';

const ORDERS_FILE = 'orders.json';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

const shippingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  address1: z.string().min(1),
  address2: z.string().optional().default(''),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  method: z.enum(['standard', 'expedited', 'overnight']).default('standard'),
});

const paymentSchema = z.object({
  method: z.enum(['stripe', 'paypal', 'apple-pay', 'google-pay', 'manual']).default('stripe'),
  last4: z.string().optional(),
  status: z.enum(['authorized', 'captured', 'refunded', 'failed']).default('authorized'),
});

const timelineEntrySchema = z.object({
  status: z.string(),
  note: z.string().optional(),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'approved', 'denied', 'fulfilled', 'refunded']).default('pending'),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
  total: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  payment: paymentSchema,
  shipping: shippingSchema,
  items: z.array(orderItemSchema).min(1),
  shippingLabel: z.string().optional(),
  denialReason: z.string().optional(),
  timeline: z.array(timelineEntrySchema).default([]),
});

export type Order = z.infer<typeof orderSchema>;

async function readOrders() {
  return readJsonFile<Order[]>(ORDERS_FILE, []);
}

export async function listOrders() {
  const orders = await readOrders();
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrder(id: string) {
  const orders = await readOrders();
  return orders.find((order) => order.id === id) ?? null;
}

const orderInputSchema = orderSchema.omit({ id: true, createdAt: true, updatedAt: true, status: true, timeline: true, shippingLabel: true, denialReason: true });

export type OrderInput = z.infer<typeof orderInputSchema>;

function createTimelineEntry(status: Order['status'], note?: string) {
  return { status, note, timestamp: new Date().toISOString() };
}

function generateLabel(order: Order): string {
  const customer = order.shipping;
  const base = `${customer.postalCode}${customer.city.replace(/[^A-Z0-9]/gi, '').toUpperCase()}${Date.now()}`;
  return `${base.slice(0, 20).padEnd(20, '0')}USPS`;
}

export async function createOrder(input: OrderInput) {
  const parsed = orderInputSchema.parse(input);
  const id = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`;
  const order: Order = {
    ...parsed,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [createTimelineEntry('pending', 'Order received via storefront')],
  };

  await mutateJsonFile<Order[]>(ORDERS_FILE, (orders) => [...orders, order], []);
  return order;
}

export async function approveOrder(id: string) {
  const order = await getOrder(id);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'approved') {
    return order;
  }

  const shippingLabel = generateLabel(order);

  await decrementInventory(order.items.map(({ productId, quantity }) => ({ productId, quantity })));

  const updated: Order = {
    ...order,
    status: 'approved',
    shippingLabel,
    payment: { ...order.payment, status: 'captured' },
    updatedAt: new Date().toISOString(),
    timeline: [...order.timeline, createTimelineEntry('approved', 'Approved and ready to fulfil')],
  };

  await mutateJsonFile<Order[]>(
    ORDERS_FILE,
    (orders) => orders.map((existing) => (existing.id === id ? updated : existing)),
    [],
  );

  return updated;
}

export async function denyOrder(id: string, reason: string) {
  const order = await getOrder(id);
  if (!order) {
    throw new Error('Order not found');
  }

  const updated: Order = {
    ...order,
    status: 'denied',
    denialReason: reason,
    payment: { ...order.payment, status: 'refunded' },
    updatedAt: new Date().toISOString(),
    timeline: [...order.timeline, createTimelineEntry('denied', reason)],
  };

  await mutateJsonFile<Order[]>(
    ORDERS_FILE,
    (orders) => orders.map((existing) => (existing.id === id ? updated : existing)),
    [],
  );

  return updated;
}

export async function updateOrderStatus(id: string, status: Order['status'], note?: string) {
  const order = await getOrder(id);
  if (!order) {
    throw new Error('Order not found');
  }

  const updated: Order = {
    ...order,
    status,
    updatedAt: new Date().toISOString(),
    timeline: [...order.timeline, createTimelineEntry(status, note)],
  };

  await mutateJsonFile<Order[]>(
    ORDERS_FILE,
    (orders) => orders.map((existing) => (existing.id === id ? updated : existing)),
    [],
  );

  return updated;
}
