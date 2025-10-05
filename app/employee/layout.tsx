import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/employee/orders', label: 'Orders' },
  { href: '/employee/customers', label: 'Customers' },
  { href: '/employee/inquiries', label: 'Inquiries' },
];

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg">
        <h1 className="font-display text-3xl text-[#2F1F52]">Employee console</h1>
        <p className="text-sm text-[#4F3C75]">Secure, zero-trust tools for fulfilment specialists.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn('block rounded-full px-4 py-2 text-sm font-semibold text-[#4F3C75] hover:bg-[#F2ECFB]')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
}
