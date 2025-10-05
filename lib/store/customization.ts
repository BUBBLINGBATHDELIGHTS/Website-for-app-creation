'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mood = 'Calm' | 'Joyful' | 'Grounded' | 'Dreamy';

type CustomizationState = {
  mood: Mood;
  accents: string[];
  aromatics: string[];
  setMood: (mood: Mood) => void;
  toggleAccent: (accent: string) => void;
  toggleAromatic: (aromatic: string) => void;
  reset: () => void;
};

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set, get) => ({
      mood: 'Calm',
      accents: [],
      aromatics: [],
      setMood: (mood) => set({ mood }),
      toggleAccent: (accent) => {
        const accents = new Set(get().accents);
        accents.has(accent) ? accents.delete(accent) : accents.add(accent);
        set({ accents: Array.from(accents) });
      },
      toggleAromatic: (aromatic) => {
        const aromatics = new Set(get().aromatics);
        aromatics.has(aromatic) ? aromatics.delete(aromatic) : aromatics.add(aromatic);
        set({ aromatics: Array.from(aromatics) });
      },
      reset: () => set({ mood: 'Calm', accents: [], aromatics: [] }),
    }),
    { name: 'bubbles-customization' },
  ),
);
