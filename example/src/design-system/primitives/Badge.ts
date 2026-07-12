import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';

export const Badge = createComponent(View, {
  base: {
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start' as const,
  },
  variants: {
    intent: {
      info: {
        _light: { backgroundColor: '#e8f4fd' },
        _dark: { backgroundColor: '#1a3a52' },
      },
      success: {
        _light: { backgroundColor: '#edf7ea' },
        _dark: { backgroundColor: '#1a3d1a' },
      },
      warning: {
        _light: { backgroundColor: '#fdf6e3' },
        _dark: { backgroundColor: '#3d2e00' },
      },
      destructive: {
        _light: { backgroundColor: '#fdecea' },
        _dark: { backgroundColor: '#3d0a0a' },
      },
    },
  },
  defaultVariants: { intent: 'info' },
});
