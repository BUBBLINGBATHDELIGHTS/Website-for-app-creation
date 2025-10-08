import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const expectedKey = process.env.REVALIDATE_API_KEY;
  const authHeader = request.headers.get('x-api-key') || request.headers.get('authorization');
  let providedKey = '';

  if (authHeader) {
    const normalized = authHeader.trim();
    providedKey = normalized.toLowerCase().startsWith('bearer ')
      ? normalized.slice(7).trim()
      : normalized;
  }

  if (!expectedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  const rawPath = typeof (payload as { path?: unknown })?.path === 'string' ? (payload as { path?: string }).path : '';
  const path = rawPath.trim();

  if (!path || !path.startsWith('/')) {
    return NextResponse.json({ error: 'Path must start with / and may not be empty.' }, { status: 400 });
  }

  if (path.includes('..')) {
    return NextResponse.json({ error: 'Path may not traverse directories.' }, { status: 400 });
  }

  const validPathPattern = /^\/[A-Za-z0-9/_\-.]*$/;
  if (!validPathPattern.test(path)) {
    return NextResponse.json({ error: 'Path contains invalid characters.' }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
