import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const runtime = 'edge';
export const revalidate = 3600;

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#B8A8EA] to-[#7FB9A7] px-8 py-16 text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80"
            alt="Calming bath ritual"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative space-y-6">
          <Badge className="bg-white/20 text-white/90">Emotionally intelligent commerce</Badge>
          <h1 className="max-w-2xl font-display text-4xl md:text-5xl">
            Build a ritual that senses your mood and glows with you.
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Bubbling Bath Delights learns from every shimmer of delight. Real-time empathy, adaptive colour palettes, and
            autonomous AI keep your sanctuary attuned to the moment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop/products">Explore Collections</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/shop/customize">Craft Your Ritual</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="grid gap-8 md:grid-cols-3">
        {["Adaptive Rituals", "Self-Sovereign Identity", "Autonomous Insights"].map((title, index) => (
          <div
            key={title}
            className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_60px_rgba(127,185,167,0.2)]"
          >
            <h2 className="font-display text-2xl text-[#2F1F52]">{title}</h2>
            <p className="mt-3 text-sm text-[#4F3C75]">
              {[
                'Framer Motion micro-interactions and mood-aware palettes tailor each session to the guest in real time.',
                'Decentralized identifiers and verifiable credentials give guests total control of their cherished wellness data.',
                'Edge AI agents orchestrate stock resilience, customer sentiment, and growth experiments around the clock.',
              ][index]}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-8 rounded-[3rem] bg-white/80 p-10 shadow-[0_40px_80px_rgba(184,168,234,0.2)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[#2F1F52]">Featured Mood Journeys</h2>
            <p className="text-sm text-[#4F3C75]">
              Generated daily by our autonomous agent collective.
            </p>
          </div>
          <Button asChild>
            <Link href="/shop/products?sort=trending">See all journeys</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {["Lavender Orbit", "Eucalyptus Echo", "Vanilla Moon"].map((name) => (
            <div key={name} className="rounded-3xl bg-gradient-to-br from-white to-[#F2ECFB] p-6">
              <h3 className="font-display text-xl text-[#2F1F52]">{name}</h3>
              <p className="mt-2 text-sm text-[#4F3C75]">
                AI-personalised sensory layering that adapts to time of day, weather, and your emotional cadence.
              </p>
              <Button variant="ghost" className="mt-4" asChild>
                <Link href={`/shop/products?highlight=${name.toLowerCase().replace(/\s+/g, '-')}`}>Open ritual</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
