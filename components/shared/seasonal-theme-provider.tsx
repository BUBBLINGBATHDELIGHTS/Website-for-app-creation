'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { SeasonalTheme } from '@/lib/data/content';
import { SeasonKey } from '@/lib/utils/seasonal-theme';

const defaultPalette = {
  background: '#050A1A',
  gradientStart: '#B8A8EA',
  gradientEnd: '#7FB9A7',
  surface: 'rgba(255,255,255,0.12)',
  textPrimary: '#FDF5F2',
  textSecondary: '#D7CCE8',
};

type SeasonalThemeContextValue = {
  season: SeasonKey;
  theme?: SeasonalTheme | null;
};

const SeasonalThemeContext = createContext<SeasonalThemeContextValue>({ season: 'winter' });

export function SeasonalThemeProvider({ season, theme, children }: SeasonalThemeContextValue & { children: ReactNode }) {
  const palette = theme?.palette ?? defaultPalette;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bbd-background', palette.background);
    root.style.setProperty('--bbd-surface', palette.surface);
    root.style.setProperty('--bbd-gradient-start', palette.gradientStart);
    root.style.setProperty('--bbd-gradient-end', palette.gradientEnd);
    root.style.setProperty('--bbd-text-primary', palette.textPrimary);
    root.style.setProperty('--bbd-text-secondary', palette.textSecondary);
  }, [palette.background, palette.surface, palette.gradientStart, palette.gradientEnd, palette.textPrimary, palette.textSecondary]);

  const value = useMemo(() => ({ season, theme }), [season, theme]);

  return <SeasonalThemeContext.Provider value={value}>{children}</SeasonalThemeContext.Provider>;
}

export function useSeasonalTheme() {
  return useContext(SeasonalThemeContext);
}
