import { NextRequest, NextResponse } from 'next/server';
import { decodeSession } from '@/lib/utils/auth';

const PROTECTED_ADMIN = ['/admin'];
const PROTECTED_EMPLOYEE = ['/employee'];

function requiresAuth(pathname: string) {
  return PROTECTED_ADMIN.some((route) => pathname.startsWith(route)) || PROTECTED_EMPLOYEE.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('bbd_session')?.value;
  const session = token ? decodeSession(token) : null;

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
