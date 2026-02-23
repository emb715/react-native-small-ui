/**
 * React Native Small UI - Core
 *
 * Minimal core utilities for component creation without heavy dependencies.
 *
 * For additional features, import from:
 * - 'react-native-small-ui/colormode' - Color mode utilities
 * - 'react-native-small-ui/theme' - Optional theming system
 * - 'react-native-small-ui/utils' - Responsive utilities
 */

// Core component creation
export { createComponent, useSmallUI } from './smallUI';
export type { ComponentStyle } from './smallUI.types';

// Lightweight helper utilities
export * from './utils/helpers';

// ============================================================
// LEGACY EXPORTS (Deprecated - for backward compatibility)
// ============================================================
// Import from specific paths for better tree-shaking:

/**
 * @deprecated Import from 'react-native-small-ui/theme' instead
 */
export type { ThemeConfig } from './theme/theme';

/**
 * @deprecated Import from 'react-native-small-ui/theme' instead
 */
export { useTheme, getTheme, registerTheme } from './hooks/useTheme/useTheme';

/**
 * @deprecated Import from 'react-native-small-ui/theme' instead
 */
export { ColorUtils } from './utils/colors.utils';

/**
 * @deprecated Import from 'react-native-small-ui/colormode' instead
 */
export {
  useColorMode,
  useColorModeValue,
  setColorScheme,
  toggleColorScheme,
} from './hooks/useColorMode/useColorMode';

/**
 * @deprecated Import from 'react-native-small-ui/utils' instead
 */
export { useOrientation } from './hooks/useOrientation';

/**
 * @deprecated Import from 'react-native-small-ui/utils' instead
 */
export { useMediaQuery } from './hooks/useMediaQuery/useMediaQuery';

/**
 * @deprecated Import from 'react-native-small-ui/utils' instead
 */
export { useBreakPointValue } from './hooks/useBreakPointValue/useBreakPointValue';

// Components
// export * from './components/primitives';
// export * from './components/Typography';
