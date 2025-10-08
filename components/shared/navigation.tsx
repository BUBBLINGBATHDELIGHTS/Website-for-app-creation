'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const routes = [
  { href: '/shop/products', label: 'Shop' },
  { href: '/shop/customize', label: 'Customize' },
  { href: '/shop/cart', label: 'Cart' },
  { href: '/employee', label: 'Employee' },
  { href: '/admin', label: 'Admin' },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl text-purple-900">
          Bubbling Bath Delights
        </Link>
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/60 p-1 shadow-inner">
          {routes.map((route) => {
            const active = pathname?.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn('relative rounded-full px-4 py-2 text-sm font-semibold text-purple-700 transition', {
                  'text-white': active,
                })}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blush-300 to-eucalyptus-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{route.label}</span>
              </Link>
            );
          })}
        </div>
        <Link
          href="/shop/cart"
          className="rounded-full bg-gradient-to-r from-blush-300 to-eucalyptus-400 px-4 py-2 text-sm font-semibold text-white shadow"
        >
          Ritual Cart
        </Link>
      </div>
    </nav>
  );
}
