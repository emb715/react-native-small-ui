import { createTheme, type ThemeConfig } from '../../theme/theme';
import { useColorModeValue } from '../useColorMode/useColorMode';
import { useThemeStore } from './theme.store';

export function registerTheme(themeConfig: ThemeConfig) {
  try {
    // create and validate theme
    const theme = createTheme(themeConfig);
    useThemeStore.setState({ theme: theme });
  } catch (error) {
    throw 'registerTheme: invalid theme config.';
  }
}

export function getTheme() {
  return useThemeStore.getState().theme;
}

export const useTheme = () => {
  const theme = useThemeStore().theme;
  return theme;
};

/**
 * Will return the theme colors for the current schema. Light or Dark
 * @returns
 */
export const useThemeSchema = () => {
  const theme = useTheme();
  return useColorModeValue(theme.colors.light, theme.colors.dark);
};
