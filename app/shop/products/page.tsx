import { randomUUID } from 'crypto';
import Link from 'next/link';
import { Suspense } from 'react';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProductCardProps } from '@/components/product/product-card';

export const revalidate = 300;

function mapToProductCard(product: Record<string, unknown>): ProductCardProps {
  const idCandidate = typeof product.id === 'string' ? product.id : undefined;
  const slugCandidate = typeof product.slug === 'string' ? product.slug : undefined;
  const id = idCandidate && idCandidate.trim().length > 0 ? idCandidate : slugCandidate ?? randomUUID();

  return {
    id,
    name: String(product.name ?? 'Untitled ritual'),
    price: Number(product.price ?? 0),
    hero_image: typeof product.hero_image === 'string' ? product.hero_image : undefined,
    tags: Array.isArray(product.tags)
      ? (product.tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
      : [],
    rating: typeof product.rating === 'number' ? product.rating : undefined,
    review_count: typeof product.review_count === 'number' ? product.review_count : undefined,
  };
}

async function ProductsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const products = await optimizedProductQueries.getProducts(searchParams);
  return <ProductGrid products={products.map((product) => mapToProductCard(product as Record<string, unknown>))} />;
}

export default function ShopProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-8 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge>Live inventory sync</Badge>
          <h1 className="font-display text-3xl text-purple-900">Shop emotionally responsive rituals</h1>
          <p className="max-w-2xl text-sm text-purple-700">
            Filter by mood, ingredients, or sustainability tags. AI recommendations refine in real time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/shop/products?sort=trending">Trending</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop/products?sort=new">New arrivals</Link>
          </Button>
          <Button asChild>
            <Link href="/shop/products?sort=seasonal">Seasonal curation</Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<ProductGrid products={[]} isLoading />}>
        {/* @ts-expect-error Async Server Component */}
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
