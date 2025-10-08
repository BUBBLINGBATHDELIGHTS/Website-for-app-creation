import { NextResponse } from 'next/server';
import { generateProductDescriptions } from '@/lib/ai/local-processing';

/**
 * The route defaults to the Node.js runtime so it can tap into future file system or network extensions.
 * If you deploy this handler to the Edge runtime, strip any Node.js-only dependencies and fall back to the
 * local template generator exported from `lib/ai/local-processing` to ensure the UI still responds.
 */
export const runtime = 'nodejs';

const MAX_PROMPT_LENGTH = 500;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const promptInput = typeof (body as { prompt?: unknown })?.prompt === 'string' ? (body as { prompt: string }).prompt.trim() : '';

  if (!promptInput) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  if (promptInput.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt is too long. Keep it under ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  try {
    const result = await generateProductDescriptions({ name: promptInput });

    if (typeof result !== 'string' || !result.trim()) {
      return NextResponse.json({ error: 'AI response was empty.' }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI generation failed', error);
    return NextResponse.json({ error: 'Unable to generate product description.' }, { status: 500 });
  }
}
