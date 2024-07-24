import { useMemo } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { create } from 'zustand';

type ColorMode = {
  colorMode: ColorSchemeName;
};

const initialState = {
  colorMode: Appearance.getColorScheme(),
};

const useColorModeStore = create<ColorMode>(() => initialState);

export const setColorMode = (newColorMode: ColorSchemeName) =>
  useColorModeStore.setState({ colorMode: newColorMode });

export const useColorMode = () => {
  const { colorMode } = useColorModeStore();
  return { colorMode, isDark: colorMode === 'dark' };
};

function getColorModeValue<
  TLight extends ColorSchemeValue,
  TDark extends ColorSchemeValue,
>(light: TLight, dark: TDark, colorMode: ColorSchemeName) {
  return colorMode === 'dark' ? (dark as TDark) : (light as TLight);
}

type ColorSchemeValue = string | Record<string, unknown>;

export const useColorModeValue = <
  TLight extends ColorSchemeValue,
  TDark extends ColorSchemeValue,
>(
  light: TLight,
  dark: TDark
) => {
  const { colorMode } = useColorMode();

  return useMemo(
    () => getColorModeValue(light, dark, colorMode),
    [colorMode, light, dark]
  );
};
