'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomizationStore } from '@/lib/store/customization';
import { useState } from 'react';

const moods: { label: string; gradient: string; copy: string }[] = [
  {
    label: 'Calm',
    gradient: 'from-[#B8A8EA] to-[#7FB9A7]',
    copy: 'Silken lavender and bergamot hush the senses.',
  },
  {
    label: 'Joyful',
    gradient: 'from-[#FFB5D2] to-[#FFD599]',
    copy: 'Citrus fizz and rose petals dance together.',
  },
  {
    label: 'Grounded',
    gradient: 'from-[#7FB9A7] to-[#4E8A72]',
    copy: 'Eucalyptus, cedar, and gentle mint align the breath.',
  },
  {
    label: 'Dreamy',
    gradient: 'from-[#B8A8EA] to-[#F2ECFB]',
    copy: 'Vanilla moonlight and night-blooming jasmine embrace you.',
  },
];

const accents = ['Moonstone shimmer', 'Petal confetti', 'Aurora oils', 'Celestial glitter'];
const aromatics = ['Lavender', 'Eucalyptus', 'Sandalwood', 'Citrus', 'Jasmine'];

export default function CustomizePage() {
  const { mood, setMood, accents: accentState, toggleAccent, aromatics: aromaticState, toggleAromatic, reset } =
    useCustomizationStore();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <header className="rounded-[3rem] bg-white/80 p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge>Ritual builder</Badge>
            <h1 className="font-display text-3xl text-[#2F1F52]">Compose your emotionally aware ritual</h1>
            <p className="max-w-2xl text-sm text-[#4F3C75]">
              The UI adapts using Zustand state to reflect your selections. Optimistic updates keep the flow breezy.
            </p>
          </div>
          <Button variant="outline" onClick={() => reset()}>
            Reset ritual
          </Button>
        </div>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {moods.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.02 }}
            onClick={() => setMood(item.label as typeof mood)}
            className={`rounded-[2.5rem] border border-white/60 bg-gradient-to-r ${item.gradient} p-6 text-left text-white shadow-lg transition`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{item.label}</h2>
              {mood === item.label && <Badge className="bg-white/30 text-white">Current</Badge>}
            </div>
            <p className="mt-3 max-w-sm text-sm text-white/90">{item.copy}</p>
          </motion.button>
        ))}
      </section>
      <section className="grid gap-8 rounded-[3rem] bg-white/80 p-8 shadow-lg md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-[#2F1F52]">Select accents</h2>
          <p className="text-sm text-[#4F3C75]">Layer tactile sensations that mirror your chosen mood.</p>
          <div className="mt-4 grid gap-3">
            {accents.map((accent) => {
              const active = accentState.includes(accent);
              return (
                <button
                  key={accent}
                  onClick={() => toggleAccent(accent)}
                  className={`flex items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    active ? 'border-[#7FB9A7] bg-[#7FB9A7]/10 text-[#1F4E3B]' : 'border-white/60 bg-white/60 text-[#4F3C75]'
                  }`}
                >
                  <span>{accent}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl text-[#2F1F52]">Choose aromatics</h2>
          <p className="text-sm text-[#4F3C75]">Edge AI tunes the potency to your recent mood journal.</p>
          <div className="mt-4 grid gap-3">
            {aromatics.map((aromatic) => {
              const active = aromaticState.includes(aromatic);
              return (
                <button
                  key={aromatic}
                  onClick={() => toggleAromatic(aromatic)}
                  className={`flex items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    active ? 'border-[#B8A8EA] bg-[#B8A8EA]/10 text-[#3D2A66]' : 'border-white/60 bg-white/60 text-[#4F3C75]'
                  }`}
                >
                  <span>{aromatic}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="rounded-[3rem] bg-white/80 p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-[#2F1F52]">Ritual summary</h2>
            <p className="text-sm text-[#4F3C75]">
              Mood: <strong>{mood}</strong> · Accents: {accentState.join(', ') || 'None yet'} · Aromatics:{' '}
              {aromaticState.join(', ') || 'Awaiting selection'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setConfirmation('Ritual saved to cart. Vector recommendations are aligning to your sentiment.');
                setTimeout(() => setConfirmation(null), 5000);
              }}
            >
              Save ritual
            </Button>
            <Button variant="outline" asChild>
              <a href="/shop/cart">Open cart</a>
            </Button>
          </div>
        </div>
        {confirmation && <p className="mt-4 text-sm text-[#4F3C75]">{confirmation}</p>}
      </section>
    </div>
  );
}
