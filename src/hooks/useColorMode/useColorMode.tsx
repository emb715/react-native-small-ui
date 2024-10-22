import { useMemo } from 'react';
import {
  Appearance,
  type ColorSchemeName as RNColorSchemeName,
} from 'react-native';
import { useColorModeStore, type ColorSchemeName } from './colorMode.store';

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
