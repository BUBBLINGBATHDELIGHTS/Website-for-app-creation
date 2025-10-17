import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getActiveSeasonalTheme } from '@/lib/utils/seasonal-theme';
import { listProducts } from '@/lib/data/products';
import { PersonalizedRecommendations } from '@/components/product/personalized-recommendations';

export const runtime = 'nodejs';
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
  const palette = theme?.palette ?? {
    gradientStart: '#B8A8EA',
    gradientEnd: '#7FB9A7',
  };
  const flashDeals = [...products].sort((a, b) => a.price - b.price).slice(0, 4);
  const trending = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3);
  const curated = products.filter((product) => product.collections?.includes('Signature')).slice(0, 3);

  return (
    <div className="space-y-20 md:space-y-24">
      <section className="glass-panel relative overflow-hidden px-8 py-16 md:px-14">
        <span
          className="glow-orb"
          style={{
            top: '-18%',
            left: '-12%',
            width: '45%',
            height: '45%',
            background: `radial-gradient(circle at top, ${palette.gradientStart}, transparent 65%)`,
          }}
        />
        <span
          className="glow-orb"
          style={{
            bottom: '-22%',
            right: '-14%',
            width: '50%',
            height: '50%',
            background: `radial-gradient(circle at top, ${palette.gradientEnd}, transparent 60%)`,
            animationDelay: '4s',
          }}
        />
        <div className="relative grid gap-12 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.4em] text-white/80">
              <Badge className="bg-white/20 text-white">{theme?.name ?? 'Seasonless Luxury'}</Badge>
              <span className="rounded-full border border-white/30 px-3 py-1 text-[0.6rem] font-semibold text-white/70">
                {promotion ? formatCountdown(promotion.countdown) : 'Live Now'}
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-white md:text-6xl">
                {hero?.headline ?? 'Immerse Yourself in Future Luxury'}
              </h1>
              <p className="max-w-xl text-lg text-white/80 md:text-xl">
                {hero?.subheading ?? 'Rich colours, dramatic lighting, and AI-guided rituals anticipate your every desire.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#2F1F52] shadow-[0_16px_30px_rgba(255,255,255,0.35)] transition hover:translate-y-0.5 hover:bg-white/90"
              >
                <Link href="/shop/products">{hero?.cta ?? 'Explore Collections'}</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="border-white/70 bg-white/10 text-white shadow-[0_12px_30px_rgba(12,4,40,0.35)] backdrop-blur"
              >
                <Link href="/shop/customize">Craft Your Ritual</Link>
              </Button>
            </div>
            <dl className="grid gap-6 text-sm text-white/70 sm:grid-cols-3">
              <div>
                <dt className="uppercase tracking-[0.3em]">AI Concierge</dt>
                <dd className="mt-1 text-base text-white">Predictive rituals curated in seconds.</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em]">48h Dispatch</dt>
                <dd className="mt-1 text-base text-white">Priority shipping on every approval.</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em]">Members +10%</dt>
                <dd className="mt-1 text-base text-white">Unlock instant rewards when you create an account.</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 shadow-[0_24px_60px_rgba(8,5,35,0.45)]">
              {hero?.image && (
                <Image
                  src={hero.image}
                  alt={hero?.headline ?? 'Seasonal ritual hero'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 520px, 80vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/20 bg-white/10 px-6 py-5 text-white shadow-[0_12px_30px_rgba(10,4,30,0.45)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Tonight&apos;s Ritual Script</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Hyper-personalized aromatics calibrated to your biometric mood board.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="marquee-container text-[0.7rem] uppercase tracking-[0.6em] text-white/80">
        <div className="marquee-track">
          {['Flash Drops Every 2 Hours', 'AI-Styled Ritual Pairings', 'Members Earn 2x Glow Points', 'Instant Wishlist Reminders', 'Free Shipping Over $120'].map((item) => (
            <span key={item}>{item}</span>
          ))}
          {['Flash Drops Every 2 Hours', 'AI-Styled Ritual Pairings', 'Members Earn 2x Glow Points', 'Instant Wishlist Reminders', 'Free Shipping Over $120'].map((item) => (
            <span key={`${item}-duplicate`}>{item}</span>
          ))}
        </div>
      </section>
      {promotion && (
        <section className="grid gap-6 rounded-[2.8rem] border border-white/30 bg-white/10 p-8 shadow-[0_18px_50px_rgba(12,4,38,0.45)] md:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-3">
            <h2 className="font-display text-3xl text-white">{promotion.title}</h2>
            <p className="text-base text-white/80">{promotion.description}</p>
          </div>
          <div className="flex items-center justify-end gap-4 text-right">
            <span className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              Countdown
            </span>
            <span className="rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white">
              {formatCountdown(promotion.countdown)}
            </span>
          </div>
        </section>
      )}
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-white">Flash Rituals You Can&apos;t Resist</h2>
            <Button variant="outline" asChild className="border-white/40 bg-white/10 text-white/90">
              <Link href="/shop/products">Shop All</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {flashDeals.map((product) => (
              <div key={product.id} className="ticket-card">
                <div className="flex items-start justify-between gap-3">
                  <Badge className="bg-white/20 text-white">Limited</Badge>
                  <span className="text-sm font-semibold text-white/80">{product.rating?.toFixed(1)}★</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{product.name}</h3>
                <p className="mt-2 text-sm text-white/75">{product.shortDescription}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Today Only</p>
                    <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                  </div>
                  <Button asChild size="sm" className="bg-white text-[#2F1F52] hover:bg-white/90">
                    <Link href={`/shop/products/${product.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-white/25 bg-white/10 p-8 shadow-[0_18px_50px_rgba(12,4,38,0.45)]">
            <h2 className="font-display text-3xl text-white">Trending Temptations</h2>
            <p className="mt-2 text-sm text-white/75">
              High-velocity bestsellers our AI concierge is recommending on repeat.
            </p>
            <div className="mt-6 space-y-5">
              {trending.map((product, index) => (
                <Link key={product.id} href={`/shop/products/${product.id}`} className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 transition hover:border-white/40">
                  {product.images?.[0] && (
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">#{index + 1}</p>
                    <h3 className="text-base font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-white/70">${product.price.toFixed(2)} · {product.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-white/20 bg-white/10 p-8 shadow-[0_18px_50px_rgba(12,4,38,0.45)]">
            <h3 className="font-display text-2xl text-white">Signature Capsules</h3>
            <p className="mt-2 text-sm text-white/75">Curated edits for collectors chasing our most indulgent blends.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {curated.map((product) => (
                <Link key={product.id} href={`/shop/products/${product.id}`} className="group space-y-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-center text-white transition hover:border-white/40">
                  {product.images?.[0] && (
                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">{product.category}</p>
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
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
