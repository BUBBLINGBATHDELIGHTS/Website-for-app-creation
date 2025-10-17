import { cache } from 'react';
import { filterProducts, getProduct, listProducts } from '@/lib/data/products';
import { listReviewsForProduct } from '@/lib/data/reviews';

function parseFilters(filters: Record<string, string | number | undefined>) {
  return {
    search: typeof filters.search === 'string' ? filters.search : undefined,
    category: typeof filters.category === 'string' ? filters.category : undefined,
    season: typeof filters.season === 'string' ? (filters.season as any) : undefined,
    tag: typeof filters.tag === 'string' ? filters.tag : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  } as const;
}

export const optimizedProductQueries = {
  getProducts: cache(async (filters: Record<string, string | number | undefined> = {}) => {
    const parsed = parseFilters(filters);
    const hasFilter = Object.values(parsed).some((value) => value !== undefined);
    const products = hasFilter ? await filterProducts(parsed) : await listProducts();
    return products;
  }),
  getProductById: cache(async (id: string) => {
    const product = await getProduct(id);
    if (!product) {
      return null;
    }

    const related = await filterProducts({ category: product.category });
    const reviews = await listReviewsForProduct(product.id);

    return {
      ...product,
      related_products: related.filter((item) => item.id !== product.id).slice(0, 4).map((item) => ({
        id: item.id,
        name: item.name,
        hero_image: item.images[0],
        price: item.price,
      })),
      reviews,
    };
  }),
};
