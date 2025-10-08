import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  ROLE_COOKIE_NAME,
  normalizeRole,
  type WorkspaceRole,
} from './role-constants';

export type { WorkspaceRole } from './role-constants';
export { ROLE_COOKIE_NAME, normalizeRole } from './role-constants';

export function getCurrentRole(): WorkspaceRole | null {
  const roleCookie = cookies().get(ROLE_COOKIE_NAME)?.value;
  return normalizeRole(roleCookie);
}

type RequireRoleOptions = {
  redirectTo?: string;
  currentPath?: string;
};

export async function requireRole(
  allowed: WorkspaceRole | readonly WorkspaceRole[],
  options: RequireRoleOptions = {},
): Promise<WorkspaceRole> {
  const allowList = Array.isArray(allowed) ? allowed : [allowed];
  const currentRole = getCurrentRole();

  if (currentRole && allowList.includes(currentRole)) {
    return currentRole;
  }

  const destination = options.redirectTo ?? '/login';
  const path = options.currentPath ?? headers().get('x-invoke-path') ?? '/';
  redirect(`${destination}?next=${encodeURIComponent(path)}`);
}
