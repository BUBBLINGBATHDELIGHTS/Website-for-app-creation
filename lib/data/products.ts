import { randomUUID } from 'crypto';
import { z } from 'zod';
import { mutateJsonFile, readJsonFile } from './fs-store';

const PRODUCTS_FILE = 'products.json';

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().nonnegative(),
  inventory: z.number().int().nonnegative(),
  category: z.string().min(1),
  collections: z.array(z.string()).default([]),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'holiday']),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  benefits: z.array(z.string()).default([]),
  fragranceNotes: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(5),
  reviewCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type Product = z.infer<typeof productSchema>;

async function readProducts() {
  return readJsonFile<Product[]>(PRODUCTS_FILE, []);
}

export async function listProducts() {
  const products = await readProducts();
  return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getProduct(id: string) {
  const products = await readProducts();
  return products.find((product) => product.id === id) ?? null;
}

const productInputSchema = productSchema.omit({ id: true, createdAt: true });

export type ProductInput = z.infer<typeof productInputSchema>;

export async function createProduct(input: ProductInput) {
  const parsed = productInputSchema.parse(input);
  const product: Product = {
    ...parsed,
    id: parsed.sku ? parsed.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-') : randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await mutateJsonFile<Product[]>(PRODUCTS_FILE, (products) => [...products, product], []);
  return product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const current = await getProduct(id);
  if (!current) {
    throw new Error('Product not found');
  }

  const merged = productSchema.parse({ ...current, ...input, id: current.id, createdAt: current.createdAt });

  await mutateJsonFile<Product[]>(
    PRODUCTS_FILE,
    (products) => products.map((product) => (product.id === id ? merged : product)),
    [],
  );

  return merged;
}

export async function deleteProduct(id: string) {
  await mutateJsonFile<Product[]>(
    PRODUCTS_FILE,
    (products) => products.filter((product) => product.id !== id),
    [],
  );
}

export type ProductFilters = {
  search?: string;
  category?: string;
  season?: Product['season'];
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function filterProducts(filters: ProductFilters) {
  const products = await readProducts();
  return products.filter((product) => {
    if (filters.search) {
      const haystack = `${product.name} ${product.shortDescription} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) {
        return false;
      }
    }

    if (filters.category && product.category !== filters.category) {
      return false;
    }

    if (filters.season && product.season !== filters.season) {
      return false;
    }

    if (filters.tag && !product.tags.includes(filters.tag)) {
      return false;
    }

    if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) {
      return false;
    }

    if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) {
      return false;
    }

    return true;
  });
}

export async function decrementInventory(items: { productId: string; quantity: number }[]) {
  await mutateJsonFile<Product[]>(
    PRODUCTS_FILE,
    (products) =>
      products.map((product) => {
        const match = items.find((item) => item.productId === product.id);
        if (!match) {
          return product;
        }

        return {
          ...product,
          inventory: Math.max(0, product.inventory - match.quantity),
        };
      }),
    [],
  );
}
