import { Text } from 'react-native';
import { createThemedComponent } from 'react-native-small-ui';
import type { AppTheme } from '../../theme/types';

// ThemedText reads active theme tokens for color.
// The style factory runs at render time — theme is always current.
// createThemedComponent call is at module level per library invariant.
export const ThemedText = createThemedComponent(Text, (rawTheme: unknown) => {
  const theme = rawTheme as AppTheme;
  return {
    fontSize: 14,
    _light: { color: theme?.light?.foreground ?? '#1a1a1a' },
    _dark: { color: theme?.dark?.foreground ?? '#f0f0f0' },
  };
});
