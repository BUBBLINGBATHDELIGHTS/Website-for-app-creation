'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

type AdminNavItem = {
  href: string;
  label: string;
};

type AdminNavProps = {
  items: AdminNavItem[];
};

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2" aria-label="Admin sections">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'block rounded-2xl px-4 py-2 text-sm font-semibold transition',
              active
                ? 'bg-eucalyptus-400 text-purple-950 shadow-sm'
                : 'text-purple-700 hover:bg-purple-100 hover:text-purple-900',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
