'use server';

import { z } from 'zod';
import { createOrder } from '@/lib/data/orders';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string().optional(),
      }),
    )
    .min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  name: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().default('US'),
  method: z.enum(['standard', 'expedited', 'overnight']),
  paymentMethod: z.enum(['stripe', 'paypal', 'apple-pay']).default('stripe'),
  saveAccount: z.boolean().optional(),
});

type CheckoutState = {
  error?: string;
  success?: boolean;
  orderId?: string;
};

export async function submitCheckout(_: CheckoutState | undefined, formData: FormData): Promise<CheckoutState> {
  const rawItems = formData.get('items');
  let items;
  try {
    items = JSON.parse(typeof rawItems === 'string' ? rawItems : String(rawItems ?? '[]'));
  } catch (error) {
    return { error: 'Could not read cart items. Please refresh and try again.' };
  }

  const parsed = checkoutSchema.safeParse({
    items,
    email: formData.get('email'),
    phone: formData.get('phone'),
    name: formData.get('name'),
    address1: formData.get('address1'),
    address2: formData.get('address2') || undefined,
    city: formData.get('city'),
    state: formData.get('state'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country') ?? 'US',
    method: formData.get('method') ?? 'standard',
    paymentMethod: formData.get('paymentMethod') ?? 'stripe',
    saveAccount: formData.get('saveAccount') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Please review the checkout form.' };
  }

  const subtotal = parsed.data.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = parsed.data.saveAccount ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const order = await createOrder({
    items: parsed.data.items.map(({ productId, name, price, quantity }) => ({ productId, name, price, quantity })),
    shipping: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address1: parsed.data.address1,
      address2: parsed.data.address2 ?? '',
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      method: parsed.data.method,
    },
    payment: {
      method: parsed.data.paymentMethod,
      last4: '4242',
      status: 'authorized',
    },
    discount,
    total,
  });

  return { success: true, orderId: order.id };
}
