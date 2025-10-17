'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
};

export function AddToCartButton({ productId, name, price, image, className, size = 'default' }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({ productId, name, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button onClick={handleClick} className={className} size={size}>
      {added ? 'Added ✨' : 'Add to Cart'}
    </Button>
  );
}
