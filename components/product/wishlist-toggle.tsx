'use client';

import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/lib/store/wishlist';

type WishlistToggleProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  className?: string;
};

export function WishlistToggle({ productId, name, price, image, className }: WishlistToggleProps) {
  const toggle = useWishlistStore((state) => state.toggleItem);
  const isSaved = useWishlistStore((state) => state.isSaved(productId));

  return (
    <Button
      type="button"
      variant={isSaved ? 'default' : 'outline'}
      className={className}
      onClick={() => toggle({ productId, name, price, image })}
    >
      {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
    </Button>
  );
}
