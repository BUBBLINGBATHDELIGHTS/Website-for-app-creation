import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/roles';
import {
  getAllowedRolesForPrefix,
  type ProtectedRoutePrefix,
} from '@/lib/auth/role-constants';
import { EmployeeShell } from '@/components/employee/employee-shell';

const CURRENT_PATH: ProtectedRoutePrefix = '/employee';

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  await requireRole(getAllowedRolesForPrefix('/employee'), { currentPath: CURRENT_PATH });

  return <EmployeeShell>{children}</EmployeeShell>;
}
