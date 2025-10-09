import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email so we can send order confirmations.' }),
  shippingAddress: z.object({
    line1: z.string().min(3, { message: 'Street address must include at least 3 characters.' }),
    line2: z.string().min(3, { message: 'Apartment, suite, etc. should be at least 3 characters.' }).optional(),
    city: z.string().min(2, { message: 'City name needs at least 2 characters.' }),
    state: z.string().min(2, { message: 'State or region requires at least 2 characters.' }),
    postalCode: z.string().min(3, { message: 'Postal code must be at least 3 characters long.' }),
    country: z.string().min(2, { message: 'Country must be at least 2 characters long.' }),
  }),
  items: z
    .array(
      z.object({
        id: z.string({ message: 'Each item requires a valid identifier.' }),
        quantity: z
          .number({ invalid_type_error: 'Quantity must be a number.' })
          .int({ message: 'Quantity must be a whole number.' })
          .positive({ message: 'Quantity must be at least 1.' })
          .max(20, { message: 'For bulk orders please contact support.' }),
      }),
    )
    .min(1, { message: 'Add at least one product to your cart before checking out.' }),
  paymentIntent: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
