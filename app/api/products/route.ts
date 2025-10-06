// app/api/products/route.ts
export const runtime = 'nodejs';
export const revalidate = 60;

import { NextResponse } from 'next/server';
import { getOrSet } from '@/lib/utils/cache';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';

/**
 * Fetches products with caching and Supabase optimization.
 * Uses Node.js runtime for full library compatibility.
 */
export async function GET(request: Request) {
  try {
    const products = await getOrSet(
      'products',
      async () => {
        return await optimizedProductQueries.fetchAllProducts();
      },
      60 * 60 // Cache for 1 hour
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
