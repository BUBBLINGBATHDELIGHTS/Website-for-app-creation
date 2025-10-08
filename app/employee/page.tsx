import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Employee Console' };

export default function EmployeeIndexPage() {
  redirect('/employee/orders');
}
