import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  ROLE_COOKIE_NAME,
  ROUTE_ROLE_ALLOWLIST,
  normalizeRole,
  type WorkspaceRole,
} from './lib/auth/role-constants';

type ProtectedRoute = {
  prefix: string;
  allowedRoles: Set<WorkspaceRole>;
  roleList: readonly WorkspaceRole[];
};

const protectedPrefixes: ProtectedRoute[] = Object.entries(ROUTE_ROLE_ALLOWLIST).map(
  ([prefix, roleList]) => ({
    prefix,
    allowedRoles: new Set<WorkspaceRole>(roleList),
    roleList,
  }),
);

export function middleware(request: NextRequest) {
  for (const { prefix, allowedRoles, roleList } of protectedPrefixes) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      const cookieRole = normalizeRole(request.cookies.get(ROLE_COOKIE_NAME)?.value);
      if (!cookieRole || !allowedRoles.has(cookieRole)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', request.nextUrl.pathname);
        loginUrl.searchParams.set('requiredRole', roleList.join(','));
        return NextResponse.redirect(loginUrl);
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: Object.keys(ROUTE_ROLE_ALLOWLIST).map((prefix) => `${prefix}/:path*`),
};
