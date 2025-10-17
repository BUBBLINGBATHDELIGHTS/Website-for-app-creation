'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';

export function CartFlyout() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const removeItem = useCartStore((state) => state.removeItem);
  const [open, setOpen] = useState(false);

  const count = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="rounded-full border-white/60 bg-white/70 text-[#2F1F52]"
        onClick={() => setOpen((value) => !value)}
      >
        Cart · {count}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 rounded-3xl border border-white/60 bg-white/90 p-4 text-[#2F1F52] shadow-2xl backdrop-blur"
          >
            <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
              {items.length === 0 && <p className="text-sm text-[#4F3C75]">Your ritual cart is ready for indulgence.</p>}
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 rounded-2xl bg-white/70 p-3">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-[#F2ECFB]" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[#4F3C75]">Qty {item.quantity}</p>
                    <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-xs font-semibold text-[#8C7BAF] hover:text-[#2F1F52]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#4F3C75]">Subtotal</p>
                <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
              </div>
              <Button asChild className="rounded-full">
                <Link href="/shop/cart">Checkout</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
