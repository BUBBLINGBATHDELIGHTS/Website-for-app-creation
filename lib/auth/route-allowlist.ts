import type { WorkspaceRole } from './roles';

export const ROUTE_ROLE_ALLOWLIST = {
  '/admin': ['admin'],
  '/employee': ['employee', 'admin'],
  '/customer': ['customer', 'admin'],
} as const satisfies Record<string, readonly WorkspaceRole[]>;

export type ProtectedPrefix = keyof typeof ROUTE_ROLE_ALLOWLIST;

const PROTECTED_ENTRIES = Object.entries(ROUTE_ROLE_ALLOWLIST) as Array<
  [ProtectedPrefix, readonly WorkspaceRole[]]
>;

export function getAllowedRolesForPath(pathname: string): WorkspaceRole[] | null {
  for (const [prefix, roles] of PROTECTED_ENTRIES) {
    if (pathname.startsWith(prefix)) {
      return [...roles];
    }
  }

  return null;
}

export function getAllowedRolesForPrefix(prefix: ProtectedPrefix): WorkspaceRole[] {
  return [...ROUTE_ROLE_ALLOWLIST[prefix]];
}
