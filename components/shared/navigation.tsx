'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { CartFlyout } from '@/components/product/cart-flyout';
import { useSeasonalTheme } from '@/components/shared/seasonal-theme-provider';

const routes = [
  { href: '/shop/products', label: 'Shop' },
  { href: '/shop/customize', label: 'Customize' },
  { href: '/shop/wishlist', label: 'Wishlist' },
  { href: '/shop/cart', label: 'Cart' },
  { href: '/employee', label: 'Employee' },
  { href: '/admin', label: 'Admin' },
];

export function NavigationBar() {
  const pathname = usePathname();
  const { theme } = useSeasonalTheme();

  return (
    <nav className="sticky top-0 z-50 px-4 pt-6">
      <div
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-white/20 bg-white/10 px-6 py-3 shadow-[0_18px_50px_rgba(10,4,32,0.45)] backdrop-blur-xl"
        style={{
          backgroundImage: `linear-gradient(120deg, ${theme?.palette.gradientStart ?? '#B8A8EA'}33, ${theme?.palette.gradientEnd ?? '#7FB9A7'}40)` ,
        }}
      >
        <Link
          href="/"
          className="font-display text-xl font-semibold uppercase tracking-[0.3em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
        >
          Bubbling Bath Delights
        </Link>
        <div className="hidden gap-1 rounded-full bg-white/10 p-1 shadow-inner backdrop-blur md:flex">
          {routes.map((route) => {
            const active = pathname?.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn('relative rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--bbd-text-secondary)] transition', {
                  'text-white': active,
                })}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${theme?.palette.gradientStart ?? '#B8A8EA'}, ${theme?.palette.gradientEnd ?? '#7FB9A7'})`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{route.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/90 shadow-inner md:flex">
            Seasonal Drop
          </div>
          <CartFlyout />
        </div>
      </div>
    </nav>
  );
}
