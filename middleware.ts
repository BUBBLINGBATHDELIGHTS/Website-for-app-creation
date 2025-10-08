import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes: Record<string, 'admin' | 'employee' | 'customer'> = {
  '/admin': 'admin',
  '/employee': 'employee',
  '/customer': 'customer',
};

const ROLE_COOKIE_NAME = 'bbd-role';

export function middleware(request: NextRequest) {
  for (const [prefix, role] of Object.entries(protectedPrefixes)) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      const cookieRole = request.cookies.get(ROLE_COOKIE_NAME)?.value?.toLowerCase();
      if (cookieRole !== role) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', request.nextUrl.pathname);
        loginUrl.searchParams.set('requiredRole', role);
        return NextResponse.redirect(loginUrl);
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/customer/:path*'],
};
