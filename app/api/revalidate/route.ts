// app/api/revalidate/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests for on-demand revalidation of pages.
 * This ensures cache or ISR pages can be refreshed manually after updates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: 'Missing "path" in request body' }, { status: 400 });
    }

    // Trigger revalidation for the specified path
    await request.revalidate(path);

    return NextResponse.json({
      revalidated: true,
      now: new Date().toISOString(),
      path
    });
  } catch (error: any) {
    console.error('Revalidation Error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate path', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
