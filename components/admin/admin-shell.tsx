'use client';

import type { ReactNode } from 'react';
import { AdminNav } from './admin-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const items = [
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/ai-workbench', label: 'AI Workbench' },
];

function buildBreadcrumb(pathname: string | null) {
  if (!pathname) return [] as { href: string; label: string }[];
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let acc = '';
  for (const segment of segments) {
    acc += `/${segment}`;
    crumbs.push({ href: acc, label: segment.replace(/-/g, ' ') });
  }
  return crumbs;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumb(pathname);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6 rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg">
        <div className="space-y-2">
          <h2 className="font-display text-xl text-purple-900">Admin control</h2>
          <p className="text-sm text-purple-700">Guide executive rituals with clear workspace hierarchies.</p>
        </div>
        <AdminNav items={items} />
        <nav aria-label="Breadcrumb" className="rounded-2xl bg-purple-50/80 p-3 text-xs font-medium text-purple-700">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/admin" className="text-purple-900 hover:underline">
                Admin
              </Link>
            </li>
            {breadcrumbs.slice(1).map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <Link href={crumb.href} className="capitalize text-purple-700 hover:text-purple-900 hover:underline">
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <section className="space-y-6">{children}</section>
    </div>
  );
}
