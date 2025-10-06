// app/api/revalidate/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/revalidate
 * Triggers revalidation for a given path in Next.js 14+
 * Example request body: { "path": "/shop" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = body.path;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required.' },
        { status: 400 }
      );
    }

    // ✅ Correct Next.js 14 method
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Revalidate API Error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed.' },
      { status: 500 }
    );
  }
}