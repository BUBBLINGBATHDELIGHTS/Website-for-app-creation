'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/lib/store/wishlist';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';

export function WishlistView() {
  const items = useWishlistStore((state) => state.items);
  const clear = useWishlistStore((state) => state.clear);

  if (items.length === 0) {
    return (
      <section className="rounded-[3rem] border border-white/40 bg-white/70 p-8 text-center text-[#2F1F52] shadow-lg">
        <h1 className="font-display text-3xl">Your wishlist is waiting to be filled</h1>
        <p className="mt-3 text-sm text-[#4F3C75]">
          Save rituals you adore and we will remind you when seasonal capsules return.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop/products">Browse collections</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#2F1F52]">Saved delights</h1>
          <p className="text-sm text-[#4F3C75]">
            We will send gentle reminders before limited editions fade back into the atelier.
          </p>
        </div>
        <Button variant="outline" onClick={clear}>
          Clear wishlist
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard
            key={item.productId}
            id={item.productId}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </section>
  );
}
