import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: z.object({
    line1: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(4),
    country: z.string().min(2),
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1),
  paymentIntent: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
