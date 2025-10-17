'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { SeasonalThemeProvider } from '@/components/shared/seasonal-theme-provider';
import { SeasonalTheme } from '@/lib/data/content';
import { SeasonKey } from '@/lib/utils/seasonal-theme';

type ProvidersProps = {
  children: ReactNode;
  season: SeasonKey;
  theme?: SeasonalTheme | null;
};

export function Providers({ children, season, theme }: ProvidersProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <SeasonalThemeProvider season={season} theme={theme}>
          {children}
        </SeasonalThemeProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
