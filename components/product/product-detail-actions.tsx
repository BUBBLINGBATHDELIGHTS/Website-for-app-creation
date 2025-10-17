'use client';

import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { WishlistToggle } from '@/components/product/wishlist-toggle';
import { usePreferencesStore } from '@/lib/store/preferences';
import { useEffect } from 'react';

type ProductDetailActionsProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  season: string;
};

export function ProductDetailActions({ productId, name, price, image, category, season }: ProductDetailActionsProps) {
  const recordInteraction = usePreferencesStore((state) => state.recordInteraction);

  useEffect(() => {
    recordInteraction({ productId, category, season, timestamp: Date.now() });
  }, [recordInteraction, productId, category, season]);

  return (
    <div className="flex flex-wrap gap-3">
      <AddToCartButton productId={productId} name={name} price={price} image={image} size="lg" className="flex-1" />
      <WishlistToggle productId={productId} name={name} price={price} image={image} className="flex-1" />
    </div>
  );
}
