import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type WorkspaceRole = 'admin' | 'employee' | 'customer';

const ROLE_COOKIE_NAME = 'bbd-role';

function normalizeRole(candidate: string | undefined): WorkspaceRole | null {
  if (!candidate) {
    return null;
  }

  const value = candidate.toLowerCase();
  if (value === 'admin' || value === 'employee' || value === 'customer') {
    return value;
  }

  return null;
}

export function getCurrentRole(): WorkspaceRole | null {
  const roleCookie = cookies().get(ROLE_COOKIE_NAME)?.value;
  return normalizeRole(roleCookie);
}

type RequireRoleOptions = {
  redirectTo?: string;
  currentPath?: string;
};

export async function requireRole(
  allowed: WorkspaceRole | WorkspaceRole[],
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
