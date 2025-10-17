import { cache } from 'react';
import { getContent, SeasonalTheme } from '@/lib/data/content';

export type SeasonKey = 'spring' | 'summer' | 'fall' | 'winter' | 'holiday';

export function getSeasonForDate(date = new Date()): SeasonKey {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month === 12 && day >= 1) {
    return 'holiday';
  }

  if (month >= 3 && month <= 5) {
    return 'spring';
  }

  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  if (month >= 9 && month <= 11) {
    return 'fall';
  }

  return 'winter';
}

export const getActiveSeasonalTheme = cache(async (date = new Date()): Promise<{ season: SeasonKey; theme: SeasonalTheme | null }> => {
  const season = getSeasonForDate(date);
  const content = await getContent();
  const theme = content.seasonalThemes[season] ?? null;
  return { season, theme };
});
