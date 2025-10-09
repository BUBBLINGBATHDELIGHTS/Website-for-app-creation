import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import { EmployeeShell } from '@/components/employee/employee-shell';

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  await requireRole(['employee', 'admin'], { currentPath: '/employee' });

  return <EmployeeShell>{children}</EmployeeShell>;
}
