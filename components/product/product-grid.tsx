import { ProductCard, type ProductCardProps } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductGrid({ products, isLoading }: { products: ProductCardProps[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-96 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
