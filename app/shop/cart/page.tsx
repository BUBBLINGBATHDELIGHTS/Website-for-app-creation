'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { submitCheckout } from './actions';
import { useCartStore } from '@/lib/store/cart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/shared/textarea';

const initialState = { success: false } as { success?: boolean; error?: string; orderId?: string };

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Processing…' : 'Place order'}
    </Button>
  );
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const [state, formAction] = useFormState(submitCheckout, initialState);

  useEffect(() => {
    if (state?.success) {
      clear();
    }
  }, [state?.success, clear]);

  if (state?.success) {
    return (
      <section className="rounded-[3rem] border border-white/40 bg-white/80 p-10 text-center text-[#2F1F52] shadow-lg">
        <h1 className="font-display text-3xl">Thank you for your order!</h1>
        <p className="mt-3 text-sm text-[#4F3C75]">
          Order <span className="font-semibold">{state.orderId}</span> is awaiting approval in our atelier. We will send updates to your email shortly.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop/products">Continue shopping</Link>
        </Button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[3rem] border border-white/40 bg-white/80 p-10 text-center text-[#2F1F52] shadow-lg">
        <h1 className="font-display text-3xl">Your ritual cart is empty</h1>
        <p className="mt-3 text-sm text-[#4F3C75]">Discover seasonal delights to begin your immersive ceremony.</p>
        <Button asChild className="mt-6">
          <Link href="/shop/products">Browse collections</Link>
        </Button>
      </section>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cart items</CardTitle>
            <CardDescription>Adjust quantities or remove items before checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-xl text-[#2F1F52]">{item.name}</p>
                  <p className="text-sm text-[#4F3C75]">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                    aria-label={`Quantity for ${item.name}`}
                    className="w-24 bg-white/80"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeItem(item.productId)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipping details</CardTitle>
            <CardDescription>We validate addresses to prevent delivery delays.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Full name" required className="bg-white/80 md:col-span-2" />
            <Input name="email" type="email" placeholder="Email" required className="bg-white/80" />
            <Input name="phone" placeholder="Phone" required className="bg-white/80" />
            <Input name="address1" placeholder="Address line 1" required className="bg-white/80 md:col-span-2" />
            <Input name="address2" placeholder="Address line 2" className="bg-white/80 md:col-span-2" />
            <Input name="city" placeholder="City" required className="bg-white/80" />
            <Input name="state" placeholder="State" required className="bg-white/80" />
            <Input name="postalCode" placeholder="Postal code" required className="bg-white/80" />
            <Input name="country" placeholder="Country" defaultValue="US" className="bg-white/80" />
            <Input name="method" placeholder="Shipping method (standard, expedited, overnight)" defaultValue="standard" className="bg-white/80 md:col-span-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gift notes & concierge requests</CardTitle>
            <CardDescription>Optional message for our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea name="notes" rows={4} placeholder="Share sensory preferences, delivery timing, or gift wrap instructions." className="bg-white/80" />
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>Loyalty members receive a 10% welcome incentive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-[#2F1F52]">
            <p className="flex items-center justify-between text-sm text-[#4F3C75]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="flex items-center justify-between text-sm text-[#4F3C75]">
              <span>Membership savings</span>
              <span>-10% when you create an account</span>
            </p>
            <p className="flex items-center justify-between text-sm text-[#4F3C75]">
              <span>Total with membership</span>
              <span>${(subtotal * 0.9).toFixed(2)}</span>
            </p>
            <Input
              type="hidden"
              name="paymentMethod"
              defaultValue="stripe"
            />
            <label className="flex items-center gap-2 text-sm text-[#4F3C75]">
              <input type="checkbox" name="saveAccount" /> Create an account for 10% off and ritual rewards
            </label>
            <CheckoutButton />
            {state?.error && <p className="rounded-2xl bg-red-50/60 p-3 text-sm text-red-700">{state.error}</p>}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
