import { registerTheme, type ThemeConfig } from 'react-native-small-ui';

export const customThemeConfig = {
  colors: {
    light: {
      background: '#fdfbfd',
      foreground: '#1c1c1e',
      muted: '#f4f4f5',
      muted_foreground: '#71717a',
      primary: '#8b59a0',
      primary_foreground: '#f4eff6',
      secondary: '#79a964',
      secondary_foreground: '#fff',
      destructive: '#e00c2c',
      destructive_foreground: '#f4eff6',
      accent: '#19d5bc',
      accent_foreground: '#303835',
      border: '#c0a3cc',
      card: '#e2d6e8',
      card_foreground: '#1c1c1e',
      ring: '#c0b3cc',
    },
    dark: {
      background: '#09090b',
      foreground: '#fafafa',
      muted: '#1a1a38',
      muted_foreground: '#a1a1aa',
      primary: '#756896',
      primary_foreground: '#f4eff6',
      secondary: '#899668',
      secondary_foreground: '#e2e5dc',
      destructive: '#be0a25',
      destructive_foreground: '#f4eff6',
      accent: '#16bea7',
      accent_foreground: '#303835',
      border: '#2d283a',
      card: '#3f3851',
      card_foreground: '#fafafa',
      ring: '#2d183a',
    },
  },
} satisfies ThemeConfig;

export const myTheme = registerTheme(customThemeConfig);
