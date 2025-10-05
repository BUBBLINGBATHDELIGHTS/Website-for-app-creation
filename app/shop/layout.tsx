import type { ReactNode } from 'react';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-10">{children}</div>;
}
