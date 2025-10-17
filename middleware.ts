import { NextRequest, NextResponse } from 'next/server';
import type { Session } from '@/lib/utils/auth';

const PROTECTED_ADMIN = ['/admin'];
const PROTECTED_EMPLOYEE = ['/employee'];

const SESSION_TTL = 60 * 60 * 8; // 8 hours
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const normalizedSecret = textEncoder.encode(
  process.env.AUTH_SECRET || 'development-secret',
);

let cachedKey: Promise<CryptoKey> | undefined;

function base64UrlDecode(raw: string) {
  const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function safeCompare(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function getKey() {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      'raw',
      normalizedSecret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  }
  return cachedKey;
}

async function sign(raw: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(raw));
  return bytesToHex(new Uint8Array(signature));
}

async function decodeSession(token: string): Promise<Session | null> {
  const [raw, signature] = token.split('.');
  if (!raw || !signature) {
    return null;
  }

  const computed = await sign(raw);
  if (!safeCompare(computed, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(textDecoder.decode(base64UrlDecode(raw))) as Session;
    if (Date.now() / 1000 - session.issuedAt > SESSION_TTL) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('[auth] Failed to parse session in middleware', error);
    return null;
  }
}

function requiresAuth(pathname: string) {
  return PROTECTED_ADMIN.some((route) => pathname.startsWith(route)) || PROTECTED_EMPLOYEE.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('bbd_session')?.value;
  const session = token ? await decodeSession(token) : null;

  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && !session.roles.includes('admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/employee') && !session.roles.includes('employee')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*'],
};
