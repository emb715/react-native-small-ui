import { Text } from 'react-native';
import { createComponent } from 'react-native-small-ui';

// Base text component with sensible cross-platform defaults.
// Named AppText to avoid shadowing React Native's Text import.
// _light/_dark react automatically to OS color scheme.
// No lineHeight override — RN's default scales with fontSize automatically.
export const AppText = createComponent(Text, {
  fontSize: 14,
  _light: { color: '#1a1a1a' },
  _dark: { color: '#f0f0f0' },
});
