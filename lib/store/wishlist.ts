'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
};

type WishlistState = {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isSaved: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => {
        set((state) => {
          if (state.items.some((existing) => existing.productId === item.productId)) {
            return { items: state.items.filter((existing) => existing.productId !== item.productId) };
          }

          return { items: [...state.items, item] };
        });
      },
      isSaved: (productId) => get().items.some((item) => item.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: 'bbd-wishlist' },
  ),
);
