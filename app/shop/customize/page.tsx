'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomizationStore } from '@/lib/store/customization';
import { SocialProofFeed } from '@/components/shop/social-proof-feed';
import { estimateNextTier } from '@/lib/loyalty/ritual-points';

const moods: { label: 'Calm' | 'Joyful' | 'Grounded' | 'Dreamy'; gradient: string; copy: string }[] = [
  {
    label: 'Calm',
    gradient: 'from-blush-300 via-eucalyptus-200 to-eucalyptus-400',
    copy: 'Silken lavender and bergamot hush the senses.',
  },
  {
    label: 'Joyful',
    gradient: 'from-pink-300 via-amber-200 to-rose-200',
    copy: 'Citrus fizz and rose petals dance together.',
  },
  {
    label: 'Grounded',
    gradient: 'from-eucalyptus-300 via-emerald-400 to-teal-400',
    copy: 'Eucalyptus, cedar, and gentle mint align the breath.',
  },
  {
    label: 'Dreamy',
    gradient: 'from-blush-200 via-purple-200 to-indigo-200',
    copy: 'Vanilla moonlight and night-blooming jasmine embrace you.',
  },
];

const palette = ['Vanilla', 'Yuzu zest', 'Midnight jasmine', 'Amber resin', 'Sea salt bloom', 'Fig nectar'];

export default function CustomizePage() {
  const {
    mood,
    setMood,
    accents: accentState,
    toggleAccent,
    aromatics: aromaticState,
    toggleAromatic,
    reset,
  } = useCustomizationStore();
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canvasNotes, setCanvasNotes] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState(15 * 60);
  const expiryTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('bbd-config-notes') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setCanvasNotes(parsed);
      } catch {
        setCanvasNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bbd-config-notes', JSON.stringify(canvasNotes));
    }
  }, [canvasNotes]);

  useEffect(() => {
    expiryTimer.current = window.setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (expiryTimer.current) {
        clearInterval(expiryTimer.current);
      }
    };
  }, []);

  const aiRecommendation = useMemo(() => {
    if (accentState.includes('Aurora oils') || canvasNotes.includes('Midnight jasmine')) {
      return 'Pair your Dreamy blend with Aurora oils for a luminous Joy Index boost.';
    }
    if (aromaticState.includes('Eucalyptus')) {
      return 'Layer cooling eucalyptus with Sea salt bloom for restorative mornings.';
    }
    if (mood === 'Joyful') {
      return 'Add Yuzu zest and petal confetti to increase conversion from wishlist to checkout.';
    }
    return 'Infuse fig nectar accents to deepen repeat purchase propensity.';
  }, [accentState, aromaticState, canvasNotes, mood]);

  const expiryMinutes = String(Math.floor(expiresIn / 60)).padStart(2, '0');
  const expirySeconds = String(expiresIn % 60).padStart(2, '0');
  const loyaltyProjection = useMemo(() => estimateNextTier(1240, 2500), []);

  return (
    <div className="space-y-10">
      <header className="rounded-[3rem] bg-gradient-to-r from-purple-50 via-white to-purple-50 p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge>Ritual builder</Badge>
            <h1 className="font-display text-3xl text-purple-900">Compose your emotionally aware ritual</h1>
            <p className="max-w-2xl text-sm text-purple-700">
              Drag-and-drop scents, blend tactile accents, and watch the Joy Index prediction adjust in real time.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setCanvasNotes([]);
              }}
            >
              Reset ritual
            </Button>
            <Button asChild>
              <Link href="/shop/cart">Open cart</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {moods.map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.02 }}
            onClick={() => setMood(item.label)}
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

      <section className="grid gap-8 rounded-[3rem] bg-white/80 p-8 shadow-lg lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-purple-900">Accents</h2>
          <p className="text-sm text-purple-700">Toggle multisensory finishes to align with the mood AI model.</p>
          <div className="grid gap-3">
            {['Moonstone shimmer', 'Petal confetti', 'Aurora oils', 'Celestial glitter'].map((accent) => {
              const active = accentState.includes(accent);
              return (
                <button
                  key={accent}
                  onClick={() => toggleAccent(accent)}
                  className={`flex items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-eucalyptus-400 bg-eucalyptus-200/40 text-emerald-900'
                      : 'border-white/60 bg-white/60 text-purple-700'
                  }`}
                >
                  <span>{accent}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
          <div className="rounded-3xl border border-purple-100 bg-purple-50/80 p-4 text-sm text-purple-700">
            <p className="font-semibold text-purple-900">AI concierge tip</p>
            <p>{aiRecommendation}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-purple-900">Aromatics</h2>
          <p className="text-sm text-purple-700">Edge inference balances airflow, humidity, and emotional intent.</p>
          <div className="grid gap-3">
            {['Lavender', 'Eucalyptus', 'Sandalwood', 'Citrus', 'Jasmine'].map((aromatic) => {
              const active = aromaticState.includes(aromatic);
              return (
                <button
                  key={aromatic}
                  onClick={() => toggleAromatic(aromatic)}
                  className={`flex items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-blush-300 bg-blush-100 text-purple-800'
                      : 'border-white/60 bg-white/60 text-purple-700'
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

      <section className="grid gap-8 rounded-[3rem] bg-white/80 p-8 shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-purple-900">Drag-and-drop scent composer</h2>
          <p className="text-sm text-purple-700">
            Build a Customer Joy Index friendly profile. TODO: sync selections to Supabase function `compose_product_variant`.
          </p>
          <div className="flex flex-wrap gap-3">
            {palette.map((note) => (
              <span
                key={note}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', note)}
                className="cursor-grab rounded-full bg-purple-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700"
              >
                {note}
              </span>
            ))}
          </div>
          <div
            className="h-48 rounded-[2rem] border-2 border-dashed border-purple-200 bg-purple-50/60 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const note = event.dataTransfer.getData('text/plain');
              if (note && !canvasNotes.includes(note)) {
                setCanvasNotes((prev) => [...prev, note]);
              }
            }}
          >
            {canvasNotes.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-purple-400">
                Drag scent notes here to compose your hero product.
              </p>
            ) : (
              <ul className="flex h-full flex-wrap items-center gap-3">
                {canvasNotes.map((note) => (
                  <li key={note}>
                    <button
                      onClick={() => setCanvasNotes((prev) => prev.filter((item) => item !== note))}
                      className="rounded-full bg-eucalyptus-200/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-800 shadow-sm transition hover:bg-eucalyptus-200"
                    >
                      {note} ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-purple-900">Commerce intelligence</h2>
          <div className="rounded-3xl border border-purple-100 bg-purple-50/80 p-4 text-sm text-purple-700">
            <p className="font-semibold text-purple-900">Sentiment sales model</p>
            <p>
              Joy Index uplift of <span className="font-semibold text-emerald-600">+6.2%</span> predicts{' '}
              <span className="font-semibold text-emerald-600">+$14</span> AOV when streaks exceed five days.
            </p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/70 p-4 text-sm text-purple-700">
            <p className="font-semibold text-purple-900">Ritual Points forecast</p>
            <p>
              Your blend is worth 180 Ritual Points when shared to the Storytelling feed. {loyaltyProjection.remaining} points
              until Aurora tier (~{loyaltyProjection.estimatedDays} days at current cadence).
            </p>
          </div>
          <SocialProofFeed />
        </div>
      </section>

      <section className="rounded-[3rem] bg-white/80 p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-purple-900">Ritual summary</h2>
            <p className="text-sm text-purple-700">
              Mood: <strong>{mood}</strong> · Accents: {accentState.join(', ') || 'None yet'} · Aromatics:{' '}
              {aromaticState.join(', ') || 'Awaiting selection'} · Composer notes: {canvasNotes.join(', ') || 'Pending'}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-purple-400">
              Resonance / Joy Index forecast updates every save.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500 animate-pulse">
              Ritual cart expires in {expiryMinutes}:{expirySeconds}
            </div>
            <Button
              onClick={() => {
                setConfirmation('Ritual saved to cart. Vector recommendations are aligning to your sentiment.');
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = window.setTimeout(() => setConfirmation(null), 5000);
              }}
            >
              Save ritual
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop/cart">Checkout ritual</Link>
            </Button>
          </div>
        </div>
        {confirmation && <p className="mt-4 text-sm text-purple-700">{confirmation}</p>}
      </section>
    </div>
  );
}
