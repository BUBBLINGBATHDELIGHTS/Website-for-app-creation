'use client';

import { useMemo } from 'react';
import { usePreferencesStore } from '@/lib/store/preferences';
import { ProductCard } from '@/components/product/product-card';

export type ProductSummary = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  season: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
};

type PersonalizedRecommendationsProps = {
  products: ProductSummary[];
};

export function PersonalizedRecommendations({ products }: PersonalizedRecommendationsProps) {
  const getTopCategories = usePreferencesStore((state) => state.getTopCategories);
  const topCategories = getTopCategories();

  const recommended = useMemo(() => {
    if (topCategories.length === 0) {
      return products.slice(0, 4);
    }

    return products
      .map((product) => {
        let score = 0;
        if (topCategories.includes(product.category)) score += 3;
        if (product.tags?.some((tag) => topCategories.some((category) => tag.toLowerCase().includes(category.toLowerCase())))) {
          score += 1.5;
        }
        if (product.rating) score += product.rating / 2;
        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ product }) => product);
  }, [products, topCategories]);

  return (
    <section className="space-y-4 rounded-[3rem] bg-white/80 p-8 shadow-lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl text-[#2F1F52]">Personalised rituals for you</h2>
          <p className="text-sm text-[#4F3C75]">
            {topCategories.length > 0
              ? `Based on your love for ${topCategories.join(', ')} rituals.`
              : 'Explore these cult-favourite experiences to begin your journey.'}
          </p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recommended.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
