import { z } from 'zod';

const colorPaletteSchema = z.record(z.string());
export const paletteSchema = z.record(colorPaletteSchema);
export type Palette = z.infer<typeof paletteSchema>;

export const colorsSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  muted: z.string(),
  muted_foreground: z.string(),
  primary: z.string(),
  primary_foreground: z.string(),
  secondary: z.string(),
  secondary_foreground: z.string(),
  destructive: z.string(),
  destructive_foreground: z.string(),
  accent: z.string(),
  accent_foreground: z.string(),
  border: z.string(),
  card: z.string(),
  card_foreground: z.string(),
  ring: z.string(),
  palette: z.optional(paletteSchema),
});
const colors = z.record(z.string()).and(colorsSchema);
export type Colors = z.infer<typeof colors>;

export const themeColorsSchema = z.object({
  light: colors,
  dark: colors,
});
export type ThemeColors = z.infer<typeof themeColorsSchema>;
