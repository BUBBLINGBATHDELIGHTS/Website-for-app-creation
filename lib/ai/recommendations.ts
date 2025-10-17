import { listProducts, Product } from '@/lib/data/products';
import { SeasonKey } from '@/lib/utils/seasonal-theme';

type RecommendationInput = {
  topCategories: string[];
  preferredSeason?: SeasonKey;
};

export async function getRecommendations({ topCategories, preferredSeason }: RecommendationInput): Promise<Product[]> {
  const products = await listProducts();
  const scored = products.map((product) => {
    let score = 0;

    if (preferredSeason && product.season === preferredSeason) {
      score += 2;
    }

    if (topCategories.includes(product.category)) {
      score += 3;
    }

    if (product.rating) {
      score += product.rating / 2;
    }

    score += product.reviewCount / 200;

    return { product, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product }) => product);
}
