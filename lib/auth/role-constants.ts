export type WorkspaceRole = 'admin' | 'employee' | 'customer';

export const ROLE_COOKIE_NAME = 'bbd-role';

export const ROUTE_ROLE_ALLOWLIST = {
  '/admin': ['admin'],
  '/employee': ['employee', 'admin'],
  '/customer': ['customer', 'admin'],
} as const satisfies Record<string, readonly WorkspaceRole[]>;

export type ProtectedRoutePrefix = keyof typeof ROUTE_ROLE_ALLOWLIST;

const KNOWN_ROLES = ['admin', 'employee', 'customer'] as const satisfies readonly WorkspaceRole[];

export function normalizeRole(candidate: string | undefined): WorkspaceRole | null {
  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();
  return KNOWN_ROLES.find((role) => role === normalized) ?? null;
}

export function getAllowedRolesForPrefix(prefix: ProtectedRoutePrefix): readonly WorkspaceRole[] {
  return ROUTE_ROLE_ALLOWLIST[prefix];
}
