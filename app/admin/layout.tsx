import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/ai-workbench', label: 'AI Workbench' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4 rounded-3xl border border-white/50 bg-white/70 p-6 shadow-lg">
        <h2 className="font-display text-xl text-[#2F1F52]">Admin control</h2>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-full px-4 py-2 text-sm font-semibold text-[#4F3C75] transition hover:bg-[#F2ECFB]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="space-y-6">{children}</section>
    </div>
  );
}
