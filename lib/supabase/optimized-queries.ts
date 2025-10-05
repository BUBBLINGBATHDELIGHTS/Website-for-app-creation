import { cache } from 'react';
import { demoProducts } from './mock-data';

let createClient: typeof import('./server-client').createClient | null = null;

async function getClient() {
  if (!createClient) {
    try {
      createClient = (await import('./server-client')).createClient;
    } catch (error) {
      console.warn('[supabase] falling back to demo data', error);
      return null;
    }
  }

  try {
    return createClient();
  } catch (error) {
    console.warn('[supabase] falling back to demo data', error);
    return null;
  }
}

export const optimizedProductQueries = {
  getProducts: cache(async (filters: Record<string, string | number | undefined> = {}) => {
    const client = await getClient();
    if (!client) {
      return demoProducts;
    }

    const query = client
      .from('products')
      .select('id, name, price, status, hero_image, tags, rating, review_count')
      .eq('status', 'active')
      .limit(50);

    if (filters.category) {
      query.eq('category', filters.category as string);
    }

    if (filters.search) {
      query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return demoProducts;
    }

    return data ?? demoProducts;
  }),
  getProductById: cache(async (id: string) => {
    const client = await getClient();
    if (!client) {
      return demoProducts.find((product) => product.id === id) ?? null;
    }

    const { data, error } = await client
      .from('products')
      .select('*, related_products(id, name, hero_image, price)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      return demoProducts.find((product) => product.id === id) ?? null;
    }

    return data;
  }),
};
