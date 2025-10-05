import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';
import { NavigationBar } from '@/components/shared/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Bubbling Bath Delights',
  description:
    'An emotionally intelligent ritual boutique weaving adaptive experiences, AI insights, and self-sovereign wellness.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#FAF7F2]">
        <Providers>
          <NavigationBar />
          <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
