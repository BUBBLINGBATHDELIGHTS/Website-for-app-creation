import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getActiveSeasonalTheme } from '@/lib/utils/seasonal-theme';
import { listProducts } from '@/lib/data/products';
import { PersonalizedRecommendations } from '@/components/product/personalized-recommendations';

export const runtime = 'edge';
export const revalidate = 3600;

function formatCountdown(target?: string) {
  if (!target) return '';
  const delta = new Date(target).getTime() - Date.now();
  if (Number.isNaN(delta) || delta <= 0) return 'Ending soon';
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  return `${days} days · ${hours} hours remaining`;
}

export default async function HomePage() {
  const [{ theme }, products] = await Promise.all([
    getActiveSeasonalTheme(),
    listProducts(),
  ]);

  const hero = theme?.hero;
  const promotion = theme?.promotion;

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/40 bg-white/10 px-8 py-16 text-white shadow-2xl">
        {hero?.image && (
          <div className="absolute inset-0 opacity-60">
            <Image src={hero.image} alt={hero.headline} fill className="object-cover" />
          </div>
        )}
        <div className="relative space-y-6">
          <Badge className="bg-black/30 text-white/90">{theme?.name ?? 'Seasonless luxury'}</Badge>
          <h1 className="max-w-2xl font-display text-4xl md:text-5xl">{hero?.headline ?? 'Immerse Yourself in Future Luxury'}</h1>
          <p className="max-w-2xl text-lg text-white/80">
            {hero?.subheading ?? 'Rich colours, dramatic lighting, and AI-guided rituals anticipate your every desire.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white/90 text-[#2F1F52] hover:bg-white">
              <Link href="/shop/products">{hero?.cta ?? 'Explore Collections'}</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-white/70 text-white">
              <Link href="/shop/customize">Craft Your Ritual</Link>
            </Button>
          </div>
        </div>
      </section>
      {promotion && (
        <section className="grid gap-4 rounded-[3rem] border border-white/40 bg-white/15 p-8 text-white shadow">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl">{promotion.title}</h2>
              <p className="text-sm text-white/80">{promotion.description}</p>
            </div>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              {formatCountdown(promotion.countdown)}
            </span>
          </div>
        </section>
      )}
      <section className="grid gap-8 md:grid-cols-3">
        {['Adaptive Rituals', 'Self-Sovereign Identity', 'Autonomous Insights'].map((title, index) => (
          <div key={title} className="rounded-3xl border border-white/40 bg-white/70 p-6 text-[#2F1F52] shadow-lg">
            <h2 className="font-display text-2xl">{title}</h2>
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
      <PersonalizedRecommendations
        products={products.slice(0, 8).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          category: product.category,
          season: product.season,
          tags: product.tags,
          rating: product.rating,
          reviewCount: product.reviewCount,
        }))}
      />
    </div>
  );
}
