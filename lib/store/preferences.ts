'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Interaction = {
  productId: string;
  category: string;
  season: string;
  timestamp: number;
};

type PreferencesState = {
  interactions: Interaction[];
  recordInteraction: (interaction: Interaction) => void;
  getTopCategories: () => string[];
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      interactions: [],
      recordInteraction: (interaction) => {
        set((state) => ({
          interactions: [...state.interactions.filter((entry) => entry.productId !== interaction.productId), interaction].slice(-30),
        }));
      },
      getTopCategories: () => {
        const counts = new Map<string, number>();
        get().interactions.forEach((interaction) => {
          counts.set(interaction.category, (counts.get(interaction.category) ?? 0) + 1);
        });
        return Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([category]) => category)
          .slice(0, 3);
      },
    }),
    { name: 'bbd-preferences' },
  ),
);
