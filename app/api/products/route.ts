// app/api/products/route.ts
export const runtime = 'nodejs';
export const revalidate = 60;

import { NextResponse } from 'next/server';
import { getOrSet } from '@/lib/utils/cache';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';

/**
 * Fetches products with caching and Supabase optimization.
 * Uses Node.js runtime for compatibility with Redis and local cache.
 */
export async function GET(request: Request) {
  try {
    const products = await getOrSet(
      'products',        // cache key
      60 * 60,           // TTL = 1 hour
      async () => {      // fetcher
        return await optimizedProductQueries.getProducts(); // ✅ fixed
      }
    );

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}