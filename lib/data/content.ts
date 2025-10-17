import { z } from 'zod';
import { readJsonFile } from './fs-store';

const CONTENT_FILE = 'content.json';

const paletteSchema = z.object({
  background: z.string(),
  gradientStart: z.string(),
  gradientEnd: z.string(),
  surface: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
});

const heroSchema = z.object({
  headline: z.string(),
  subheading: z.string(),
  cta: z.string(),
  image: z.string(),
});

const promotionSchema = z.object({
  title: z.string(),
  description: z.string(),
  countdown: z.string(),
});

const themeSchema = z.object({
  name: z.string(),
  palette: paletteSchema,
  hero: heroSchema,
  promotion: promotionSchema,
});

export const contentSchema = z.object({
  seasonalThemes: z.record(z.string(), themeSchema),
});

export type Content = z.infer<typeof contentSchema>;
export type SeasonalTheme = z.infer<typeof themeSchema>;

export async function getContent() {
  return readJsonFile<Content>('content.json', { seasonalThemes: {} });
}
