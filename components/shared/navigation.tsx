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
    <nav
      className="sticky top-0 z-40 border-b border-white/40 backdrop-blur"
      style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl text-[color:var(--bbd-text-primary)]">
          Bubbling Bath Delights
        </Link>
        <div className="hidden gap-1 rounded-full bg-white/20 p-1 shadow-inner md:flex">
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
        <CartFlyout />
      </div>
    </nav>
  );
}
