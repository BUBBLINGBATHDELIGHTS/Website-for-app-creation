import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import {
  getAllowedRolesForPrefix,
  type ProtectedRoutePrefix,
} from '@/lib/auth/role-constants';
import { CustomerShell } from '@/components/customer/customer-shell';

const CURRENT_PATH: ProtectedRoutePrefix = '/customer';

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/customer'), { currentPath: CURRENT_PATH });
  return <CustomerShell>{children}</CustomerShell>;
}
