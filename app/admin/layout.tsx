import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { requireRole } from '@/lib/auth/roles';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole('admin', { currentPath: '/admin' });

  return <AdminShell>{children}</AdminShell>;
}
