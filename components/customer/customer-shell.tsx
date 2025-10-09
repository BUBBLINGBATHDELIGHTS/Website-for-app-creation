'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/customer/dashboard', label: 'Overview' },
  { href: '/customer/rewards', label: 'Ritual rewards' },
  { href: '/customer/stories', label: 'Community stories' },
];

export function CustomerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg">
        <h1 className="font-display text-3xl text-purple-900">Customer sanctuary</h1>
        <p className="text-sm text-purple-700">
          Track your ritual momentum, loyalty tier, and community energy.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow">
          <nav className="space-y-2" aria-label="Customer sections">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  pathname?.startsWith(link.href)
                    ? 'bg-eucalyptus-200 text-purple-900 shadow-sm'
                    : 'text-purple-700 hover:bg-eucalyptus-100 hover:text-purple-900'
                }`}
                aria-current={pathname?.startsWith(link.href) ? 'page' : undefined}
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
