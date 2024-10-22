import { View, Text as RNText } from 'react-native';
import { createComponent, getTheme } from 'react-native-tinybase';

const theme = getTheme();
console.log('LOG: primitives > theme:', theme);

export const HStack = createComponent(View, {
  flexDirection: 'row',
  flexWrap: 'wrap',
});
export const VStack = createComponent(View, {
  flexDirection: 'column',
});
export const Center = createComponent(View, {
  alignItems: 'center',
  justifyContent: 'center',
});

export const Box = createComponent(View);

export const Text = createComponent(RNText, {
  _light: {
    color: theme.colors.light.foreground,
  },
  _dark: {
    color: theme.colors.dark.foreground,
  },
});
