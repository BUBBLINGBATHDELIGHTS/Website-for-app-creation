import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireRole } from '@/lib/auth/roles';
import { getAllowedRolesForPrefix } from '@/lib/auth/route-allowlist';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/admin'), { currentPath: '/admin' });

  return <AdminShell>{children}</AdminShell>;
}
