import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import { getAllowedRolesForPrefix } from '@/lib/auth/route-allowlist';
import { EmployeeShell } from '@/components/employee/employee-shell';

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/employee'), { currentPath: '/employee' });

  return <EmployeeShell>{children}</EmployeeShell>;
}
