import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes: Record<string, Array<'admin' | 'employee' | 'customer'>> = {
  '/admin': ['admin'],
  '/employee': ['employee', 'admin'],
  '/customer': ['customer', 'admin'],
};

const ROLE_COOKIE_NAME = 'bbd-role';

export function middleware(request: NextRequest) {
  for (const [prefix, allowedRoles] of Object.entries(protectedPrefixes)) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      const cookieRole = request.cookies.get(ROLE_COOKIE_NAME)?.value?.toLowerCase();
      if (!cookieRole || !allowedRoles.includes(cookieRole as typeof allowedRoles[number])) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', request.nextUrl.pathname);
        loginUrl.searchParams.set('requiredRole', allowedRoles.join(','));
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
