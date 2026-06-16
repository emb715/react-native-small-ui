import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';
import { border } from 'react-native-small-ui/presets';

// Horizontal rule with platform-appropriate hairline weight.
// Color adapts automatically to OS light/dark mode.
export const Divider = createComponent(View, {
  ...border.hairline,
  alignSelf: 'stretch' as const,
  _light: { borderColor: '#e5e5e5' },
  _dark: { borderColor: '#2a2a2a' },
});
