import { NextResponse } from 'next/server';
import { getOrSet } from '@/lib/utils/cache';
import { optimizedProductQueries } from '@/lib/supabase/optimized-queries';

export const runtime = 'edge';
export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const products = await getOrSet(`products:${JSON.stringify(params)}`, 60, async () => {
    return optimizedProductQueries.getProducts(params);
  });

  return NextResponse.json({ products });
}
