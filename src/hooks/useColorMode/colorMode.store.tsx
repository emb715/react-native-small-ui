import { Appearance } from 'react-native';
import { create } from 'zustand';

export type ColorSchemeName = 'light' | 'dark';

type ColorMode = {
  colorMode: ColorSchemeName;
};

/**
 * Reads the system color scheme safely.
 * Returns 'light' when Appearance is unavailable (SSR, test environments)
 * or when the system preference is not set.
 *
 * NOT called at module eval time — called lazily by the store initializer.
 */
export function getColorSchemeDefault(): ColorSchemeName {
  /* istanbul ignore next */
  if (typeof Appearance === 'undefined' || Appearance === null) {
    return 'light';
  }
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Zustand store for the active color mode.
 *
 * The initializer `() => ({...})` is called by Zustand on first store access,
 * NOT at module import time — making this SSR-safe. No native API is executed
 * during import.
 */
export const useColorModeStore = create<ColorMode>(() => ({
  colorMode: getColorSchemeDefault(),
}));
