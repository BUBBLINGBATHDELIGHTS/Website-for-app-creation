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
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : undefined;

    if (!prompt && !body.name) {
      return NextResponse.json({ error: 'A prompt or product name is required.' }, { status: 400 });
    }

    const result = await generateProductDescriptions({
      name: typeof body.name === 'string' ? body.name : undefined,
      ingredients: typeof body.ingredients === 'string' ? body.ingredients : undefined,
      mood: typeof body.mood === 'string' ? body.mood : undefined,
      prompt,
    });

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate descriptions' }, { status: 500 });
  }
}
