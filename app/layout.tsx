import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';
import { NavigationBar } from '@/components/shared/navigation';
import { getActiveSeasonalTheme } from '@/lib/utils/seasonal-theme';
import { ChatbotWidget } from '@/components/shared/chatbot-widget';
import { AuroraBackground } from '@/components/shared/aurora-background';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Bubbling Bath Delights',
  description:
    'An emotionally intelligent ritual boutique weaving adaptive experiences, AI insights, and self-sovereign wellness.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { season, theme } = await getActiveSeasonalTheme();
  const palette = theme?.palette;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden" style={{ backgroundColor: palette?.background, color: palette?.textPrimary }}>
        <Providers season={season} theme={theme}>
          <div className="relative flex min-h-screen flex-col">
            <AuroraBackground />
            <NavigationBar />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-12 text-[color:var(--bbd-text-primary)]">
              {children}
            </main>
            <ChatbotWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}
