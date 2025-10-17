import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ROLE_COOKIE_NAME } from '@/lib/auth/constants';
import {
  type ProtectedPrefix,
  getAllowedRolesForPath,
  ROUTE_ROLE_ALLOWLIST,
} from '@/lib/auth/route-allowlist';

export function middleware(request: NextRequest) {
  const allowedRoles = getAllowedRolesForPath(request.nextUrl.pathname);

  if (!allowedRoles) {
    return NextResponse.next();
  }

  const cookieRole = request.cookies.get(ROLE_COOKIE_NAME)?.value?.toLowerCase();

  if (!cookieRole || !allowedRoles.includes(cookieRole as (typeof allowedRoles)[number])) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    loginUrl.searchParams.set('requiredRole', allowedRoles.join(','));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: (Object.keys(ROUTE_ROLE_ALLOWLIST) as ProtectedPrefix[]).map(
    (prefix) => `${prefix}/:path*`,
  ),
};
