/**
 * Theme System
 *
 * Optional theming utilities with color generation and semantic tokens.
 * Import from 'react-native-small-ui/theme'
 *
 * Bundle Impact: Includes zod (~57KB) and @ctrl/tinycolor (~47KB)
 */

export type { ThemeConfig, ThemeSnapshot } from './theme/theme';
export {
  useTheme,
  getTheme,
  registerTheme,
  useThemeSchema,
} from './hooks/useTheme/useTheme';
export { ColorUtils } from './utils/colors.utils';

// Re-export theme types for convenience
export type { ThemeColors, Palette, Colors } from './theme/colors.schema';
export { defaultTheme, defaultThemeColors } from './theme/theme';
