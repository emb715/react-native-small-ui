import { View } from 'react-native';
import { createThemedComponent } from 'react-native-small-ui';
import type { AppTheme } from '../../theme/types';

// ThemedCard reads active theme tokens for background and border.
export const ThemedCard = createThemedComponent(View, (rawTheme: unknown) => {
  const theme = rawTheme as AppTheme;
  return {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    _light: {
      backgroundColor: theme?.light?.card ?? '#f5f5f5',
      borderColor: theme?.light?.border ?? '#e5e5e5',
    },
    _dark: {
      backgroundColor: theme?.dark?.card ?? '#1e1e1e',
      borderColor: theme?.dark?.border ?? '#2a2a2a',
    },
  };
});
