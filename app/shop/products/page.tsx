import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Suspense } from 'react';
import Link from 'next/link';

export const revalidate = 300;

async function ProductsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const products = await optimizedProductQueries.getProducts(searchParams);
  return (
    <ProductGrid
      products={products.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        image: product.images?.[0] ?? product.hero_image,
        tags: product.tags,
        rating: product.rating,
        reviewCount: product.reviewCount ?? product.review_count,
      }))}
    />
  );
}

export default function ShopProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <div className="space-y-8">
      <div className="space-y-6 rounded-3xl bg-white/80 p-8 shadow-lg">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge>Live inventory sync</Badge>
            <h1 className="font-display text-3xl text-[#2F1F52]">Shop emotionally responsive rituals</h1>
            <p className="max-w-2xl text-sm text-[#4F3C75]">
              Filter by mood, ingredients, or sustainability tags. AI recommendations refine in real time.
            </p>
          </div>
          <Link href="/shop/wishlist" className="text-sm font-semibold text-[#4F3C75] hover:text-[#2F1F52]">
            View wishlist →
          </Link>
        </div>
        <form className="grid gap-4 md:grid-cols-4" method="get">
          <Input
            name="search"
            placeholder="Search rituals, ingredients, moods"
            defaultValue={searchParams.search ?? ''}
            className="md:col-span-2 bg-white/80"
            aria-label="Search"
          />
          <Input
            name="category"
            placeholder="Category (Bath Bombs, Scrubs…)"
            defaultValue={searchParams.category ?? ''}
            className="bg-white/80"
            aria-label="Category"
          />
          <Input
            name="season"
            placeholder="Season (spring, summer…)"
            defaultValue={searchParams.season ?? ''}
            className="bg-white/80"
            aria-label="Season"
          />
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <Input name="minPrice" type="number" min={0} step={1} placeholder="Min price" defaultValue={searchParams.minPrice ?? ''} className="bg-white/80" />
            <Input name="maxPrice" type="number" min={0} step={1} placeholder="Max price" defaultValue={searchParams.maxPrice ?? ''} className="bg-white/80" />
          </div>
          <Input
            name="tag"
            placeholder="Tag (vegan, calming, shimmer…)"
            defaultValue={searchParams.tag ?? ''}
            className="bg-white/80"
            aria-label="Tag"
          />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Apply filters
            </Button>
            <Button type="reset" variant="outline" className="flex-1" asChild>
              <Link href="/shop/products">Reset</Link>
            </Button>
          </div>
        </form>
      </div>
      <Suspense fallback={<ProductGrid products={[]} isLoading />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
