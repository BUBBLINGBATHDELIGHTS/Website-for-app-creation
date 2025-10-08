import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireRole } from '@/lib/auth/roles';
import {
  getAllowedRolesForPrefix,
  type ProtectedRoutePrefix,
} from '@/lib/auth/role-constants';

const CURRENT_PATH: ProtectedRoutePrefix = '/admin';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/admin'), { currentPath: CURRENT_PATH });

  return <AdminShell>{children}</AdminShell>;
}
