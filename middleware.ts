import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Role = 'admin' | 'employee' | 'customer';

const protectedPrefixes: Record<string, Role[]> = {
  '/admin': ['admin'],
  '/employee': ['employee', 'admin'],
  '/customer': ['customer', 'admin'],
};

const ROLE_COOKIE_NAME = 'bbd-role';

export function middleware(request: NextRequest) {
  for (const [prefix, allowedRoles] of Object.entries(protectedPrefixes)) {
    if (request.nextUrl.pathname.startsWith(prefix)) {
      const cookieRoles = parseRoles(request.cookies.get(ROLE_COOKIE_NAME)?.value);
      const hasRequiredRole = allowedRoles.some((role) => cookieRoles.has(role));

      if (!hasRequiredRole) {
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

function parseRoles(rawRole: string | undefined): Set<Role> {
  if (!rawRole) {
    return new Set();
  }

  const normalized = rawRole.trim();

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return new Set<Role>(
        parsed
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.toLowerCase())
          .filter(isRole),
      );
    }
  } catch (error) {
    // Ignore JSON parse errors and fall back to comma separated parsing.
  }

  return new Set<Role>(
    normalized
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(isRole),
  );
}

function isRole(value: string): value is Role {
  return value === 'admin' || value === 'employee' || value === 'customer';
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/customer/:path*'],
};
