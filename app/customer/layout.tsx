import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import { CustomerShell } from '@/components/customer/customer-shell';

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireRole(['customer', 'admin'], { currentPath: '/customer' });
  return <CustomerShell>{children}</CustomerShell>;
}
