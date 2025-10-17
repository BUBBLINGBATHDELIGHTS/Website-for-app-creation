import Image from 'next/image';
import { notFound } from 'next/navigation';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';
import { Badge } from '@/components/ui/badge';
import { ProductDetailActions } from '@/components/product/product-detail-actions';
import { ProductReviews } from '@/components/product/product-reviews';
import Link from 'next/link';

export const revalidate = 120;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product: any = await optimizedProductQueries.getProductById(params.id);

  if (!product) {
    notFound();
  }

  const price = Number(product.price ?? 0);
  const heroImage = product.images?.[0] ?? product.hero_image;

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#B8A8EA]/20 to-[#7FB9A7]/10">
          <Image
            src={
              heroImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
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
            <h1 className="font-display text-4xl text-[#2F1F52]">{product.name}</h1>
            <p className="text-sm text-[#4F3C75]">{product.description ?? 'Awaiting AI description generation.'}</p>
          </div>
          <div className="flex items-center gap-4 text-[#2F1F52]">
            <span className="text-3xl font-semibold">${price.toFixed(2)}</span>
            <span className="text-sm text-[#4F3C75]">Inventory: {product.inventory}</span>
          </div>
          <ProductDetailActions
            productId={product.id}
            name={product.name}
            price={price}
            image={heroImage}
            category={product.category}
            season={product.season}
          />
          <div className="rounded-3xl bg-white/70 p-6 shadow-inner">
            <h2 className="font-display text-xl text-[#2F1F52]">Recommended pairings</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {(product.related_products ?? []).map((related: any) => (
                <Link key={related.id} href={`/shop/products/${related.id}`} className="group space-y-2">
                  <p className="font-semibold text-[#4F3C75] group-hover:text-[#2F1F52]">{related.name}</p>
                  <span className="text-sm text-[#8C7BAF]">${Number(related.price ?? 0).toFixed(2)}</span>
                </Link>
              ))}
              {(product.related_products ?? []).length === 0 && (
                <p className="text-sm text-[#4F3C75]">AI curation will surface pairings after first purchase data is available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <section id="reviews" className="space-y-4 rounded-3xl bg-white/80 p-8 shadow-lg">
        <div className="space-y-2">
          <h2 className="font-display text-2xl text-[#2F1F52]">Reviews & sentiment</h2>
          <p className="text-sm text-[#4F3C75]">
            Privacy-preserving analytics summarise guest reflections without exposing personal data.
          </p>
        </div>
        <ProductReviews productId={product.id} reviews={product.reviews ?? []} />
      </section>
    </div>
  );
}
