import { NextResponse } from 'next/server';
import { generateProductDescriptions } from '@/lib/ai/local-processing';

export const runtime = 'edge';

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = typeof body?.prompt === 'string' && body.prompt.trim().length > 0 ? body.prompt.trim() : 'Unnamed ritual';
  const result = await generateProductDescriptions({ name: prompt });
  return NextResponse.json({ result });
}
