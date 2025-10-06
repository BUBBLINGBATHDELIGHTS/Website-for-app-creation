// app/api/products/route.ts
export const runtime = 'nodejs';
export const revalidate = 60;

import { NextResponse } from 'next/server';
import { getOrSet } from '@/lib/utils/cache';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';

/**
 * Handles GET requests for fetching product data.
 * Utilizes caching and Supabase optimization under Node.js runtime.
 */
export async function GET(request: Request) {
  try {
    const products = await getOrSet('products', async () => {
      return await optimizedProductQueries.fetchAllProducts();
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
