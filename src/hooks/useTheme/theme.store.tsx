import { create } from 'zustand';
import { defaultTheme } from '../../theme/theme';

const initialState = {
  theme: defaultTheme,
};
export const useThemeStore = create(() => initialState);
