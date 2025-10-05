import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { path } = await request.json();
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
