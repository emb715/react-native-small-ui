import { Appearance } from 'react-native';
import { create } from 'zustand';

export function getColorSchemeDefault() {
  const colorScheme = Appearance.getColorScheme();
  if (!colorScheme) {
    return 'light' as ColorSchemeName;
  }
  return Appearance.getColorScheme() as ColorSchemeName;
}

export type ColorSchemeName = 'light' | 'dark';
type ColorMode = {
  colorMode: ColorSchemeName;
};

const initialState = {
  colorMode: getColorSchemeDefault(),
};

export const useColorModeStore = create<ColorMode>(() => initialState);
