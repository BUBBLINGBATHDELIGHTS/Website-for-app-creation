'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((entry) => entry.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.productId === item.productId
                  ? { ...entry, quantity: Math.min(10, entry.quantity + quantity) }
                  : entry,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: Math.min(10, quantity) }],
          };
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
      },
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    { name: 'bbd-cart' },
  ),
);
