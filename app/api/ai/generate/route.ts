// app/api/ai/generate/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateProductDescriptions } from '@/lib/ai/local-processing';

/**
 * Handles POST requests for generating AI-assisted product descriptions.
 * Uses Node.js runtime to access local libraries safely.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const descriptions = await generateProductDescriptions(body);
    return NextResponse.json({ data: descriptions });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate descriptions' }, { status: 500 });
  }
}
