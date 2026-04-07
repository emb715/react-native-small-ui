import { View, Text as RNText } from 'react-native';
import { createComponent } from 'react-native-small-ui';

export const HStack = createComponent(View, {
  flexDirection: 'row',
  flexWrap: 'wrap',
});
export const VStack = createComponent(View, {
  flexDirection: 'column',
  flexWrap: 'wrap',
});
export const Center = createComponent(View, {
  alignItems: 'center',
  justifyContent: 'center',
});

// TODO: add default styles for flex
export const Box = createComponent(View);

// export const WebWrapper = createComponent(View, {
//   _web: {
//     alignSelf: 'center',
//     minHeight: 'auto',
//     width: '100%',
//     maxWidth: '100%', // 1024
//     // marginLeft: 'auto',
//     // marginRight: 'auto',
//   },
// });

export const Text = createComponent(RNText, {
  _light: {
    color: '#000',
  },
  _dark: {
    color: '#fff',
  },
});
// TODO: create other primitives

// TODO: add example for creating custom hooks ???? this is an example to work with
// export function useMaxWidth() {
//   const isWeb = Platform.OS === 'web'
//   const theme = useTheme()
//   return useBreakpointValue({
//     base: isWeb ? 'inherit' : '100%',
//     md: theme.breakpoints.md,
//     lg: theme.breakpoints.md
//   })
// }
