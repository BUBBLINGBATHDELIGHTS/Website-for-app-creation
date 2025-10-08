import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type RelatedProduct = {
  id: string;
  name: string;
  price?: number;
};

type ProductDetail = {
  id: string;
  name: string;
  price?: number;
  hero_image?: string;
  description?: string;
  category?: string;
  related_products?: RelatedProduct[];
};

export const revalidate = 120;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = (await optimizedProductQueries.getProductById(params.id)) as ProductDetail | null;

  if (!product) {
    notFound();
  }

  const price = Number(product.price ?? 0);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blush-200/30 to-eucalyptus-200/20">
          <Image
            src={
              product.hero_image ||
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
            }
            alt={product.name}
            width={900}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="outline">{product.category ?? 'Signature collection'}</Badge>
            <h1 className="font-display text-4xl text-purple-900">{product.name}</h1>
            <p className="text-sm text-purple-700">{product.description ?? 'Awaiting AI description generation.'}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold text-purple-900">${price.toFixed(2)}</span>
            <Button size="lg" asChild>
              <Link href={`/shop/cart?add=${product.id}`}>Add to ritual</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={`/shop/products/${product.id}#reviews`}>See reviews</Link>
            </Button>
          </div>
          <div className="rounded-3xl bg-white/70 p-6 shadow-inner">
            <h2 className="font-display text-xl text-purple-900">Recommended pairings</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(product.related_products ?? []).map((related) => (
                <Link key={related.id} href={`/shop/products/${related.id}`} className="group space-y-2">
                  <p className="font-semibold text-purple-700 group-hover:text-purple-900">{related.name}</p>
                  <span className="text-sm text-purple-600">${Number(related.price ?? 0).toFixed(2)}</span>
                </Link>
              ))}
              {(product.related_products ?? []).length === 0 && (
                <p className="text-sm text-purple-700">
                  AI curation will surface pairings after first purchase data is available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <section id="reviews" className="space-y-4 rounded-3xl bg-white/80 p-8 shadow-lg">
        <h2 className="font-display text-2xl text-purple-900">Reviews & sentiment</h2>
        <p className="text-sm text-purple-700">
          Privacy-preserving analytics summarise guest reflections without exposing personal data.
        </p>
      </section>
    </div>
  );
}
