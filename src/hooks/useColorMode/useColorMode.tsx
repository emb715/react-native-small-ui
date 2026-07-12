import { useMemo } from 'react';
import {
  Appearance,
  type ColorSchemeName as RNColorSchemeName,
} from 'react-native';
import { useColorModeStore, type ColorSchemeName } from './colorMode.store';
import { useCustomColorModeStore } from './customColorMode.store';

export function setColorMode(newColorMode: RNColorSchemeName) {
  if (newColorMode) {
    useColorModeStore.setState({ colorMode: newColorMode as ColorSchemeName });
  }
}

export function setColorScheme(newColorMode: ColorSchemeName) {
  setColorMode(newColorMode);
  if ('setColorScheme' in Appearance) {
    Appearance.setColorScheme(newColorMode as RNColorSchemeName);
  }
}

export function colorSchemeListener() {
  const listener = Appearance.addChangeListener((colorMode) => {
    setColorMode(colorMode.colorScheme);
  });
  return listener;
}

export function toggleColorScheme() {
  const { colorMode } = useColorModeStore.getState();
  setColorScheme(colorMode === 'dark' ? 'light' : 'dark');
}

export function useColorMode() {
  const { colorMode } = useColorModeStore();
  return { colorMode, isDark: colorMode === 'dark' };
}

// ---------------------------------------------------------------------------
// Custom Color Mode Registry
// ---------------------------------------------------------------------------

/**
 * Activates a custom color mode by name.
 * The name must be registered via configure({ colorModes: { ... } }).
 * Pass null to clear any active custom mode.
 *
 * @example
 * configure({ colorModes: { highContrast: () => true } });
 * setCustomColorMode('highContrast');
 *
 * // Then in createComponent:
 * const Text = createComponent(RNText, {
 *   color: '#000',
 *   _highContrast: { color: '#fff', fontWeight: 'bold' },
 * });
 */
export function setCustomColorMode(mode: string | null) {
  useCustomColorModeStore.setState({ activeMode: mode });
}

/**
 * Clears the active custom color mode, returning to OS-driven light/dark only.
 */
export function clearCustomColorMode() {
  useCustomColorModeStore.setState({ activeMode: null });
}

/**
 * Returns the currently active custom color mode name, or null.
 * Reactive — triggers re-renders when the active mode changes.
 */
export function useCustomColorMode() {
  const { activeMode } = useCustomColorModeStore();
  return { activeMode };
}

/** Re-export the store for internal use in createComponent */
export { useCustomColorModeStore };

function getColorModeValue<
  TLight extends ColorSchemeValue,
  TDark extends ColorSchemeValue,
>(light: TLight, dark: TDark, colorMode: ColorSchemeName) {
  return colorMode === 'dark' ? (dark as TDark) : (light as TLight);
}

type ColorSchemeValue = string | Record<string, unknown>;

export function useColorModeValue<
  TLight extends ColorSchemeValue,
  TDark extends ColorSchemeValue,
>(light: TLight, dark: TDark) {
  const { colorMode } = useColorMode();

  return useMemo(
    () => getColorModeValue(light, dark, colorMode),
    [colorMode, light, dark]
  );
}
