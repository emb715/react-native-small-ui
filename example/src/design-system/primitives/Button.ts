import { TouchableOpacity } from 'react-native';
import { createComponent } from 'react-native-small-ui';

export const Button = createComponent(TouchableOpacity, {
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  variants: {
    size: {
      xs: { paddingVertical: 4, paddingHorizontal: 10, gap: 4 },
      sm: { paddingVertical: 6, paddingHorizontal: 14, gap: 6 },
      md: { paddingVertical: 10, paddingHorizontal: 20, gap: 8 },
      lg: { paddingVertical: 14, paddingHorizontal: 28, gap: 10 },
    },
    intent: {
      primary: {
        _light: { backgroundColor: '#8b59a0' },
        _dark: { backgroundColor: '#a070b8' },
      },
      secondary: {
        _light: { backgroundColor: '#79a964' },
        _dark: { backgroundColor: '#8fc477' },
      },
      ghost: {
        _light: { backgroundColor: 'transparent' },
        _dark: { backgroundColor: 'transparent' },
      },
      destructive: {
        _light: { backgroundColor: '#e00c2c' },
        _dark: { backgroundColor: '#be0a25' },
      },
      outline: {
        _light: { borderColor: '#c0a3cc', backgroundColor: 'transparent' },
        _dark: { borderColor: '#7a5a8a', backgroundColor: 'transparent' },
      },
    },
  },
  compoundVariants: [
    {
      variants: { size: 'xs', intent: 'destructive' },
      style: {
        borderWidth: 2,
        _light: { borderColor: '#e00c2c' },
        _dark: { borderColor: '#ff6b80' },
      },
    },
    {
      variants: { intent: 'ghost', size: 'sm' },
      style: { paddingHorizontal: 8 },
    },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});
