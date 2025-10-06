import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

export const revalidate = 300;

async function ProductsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const products = await optimizedProductQueries.getProducts(searchParams);
  return (
    <ProductGrid
      products={products.map((product: any) => ({
        ...product,
        price: Number(product.price ?? 0),
      }))}
    />
  );
}

export default function ShopProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-8 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge>Live inventory sync</Badge>
          <h1 className="font-display text-3xl text-[#2F1F52]">Shop emotionally responsive rituals</h1>
          <p className="max-w-2xl text-sm text-[#4F3C75]">
            Filter by mood, ingredients, or sustainability tags. AI recommendations refine in real time.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/shop/products?sort=trending">Trending</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/shop/products?sort=new">New arrivals</a>
          </Button>
          <Button asChild>
            <a href="/shop/products?sort=seasonal">Seasonal curation</a>
          </Button>
        </div>
            </div>
      <Suspense fallback={<ProductGrid products={[]} isLoading />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
