import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import { getAllowedRolesForPrefix } from '@/lib/auth/route-allowlist';
import { CustomerShell } from '@/components/customer/customer-shell';

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/customer'), { currentPath: '/customer' });
  return <CustomerShell>{children}</CustomerShell>;
}
