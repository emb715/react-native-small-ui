import { create } from 'zustand';

export const DEFAULT_THEME_NAME = 'default';

type ThemeStoreState = {
  themes: Record<string, unknown>;
  activeThemeName: string;
};

const initialState: ThemeStoreState = {
  themes: { [DEFAULT_THEME_NAME]: {} },
  activeThemeName: DEFAULT_THEME_NAME,
};

export const useThemeStore = create<ThemeStoreState>(() => initialState);
