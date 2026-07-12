import { Text } from 'react-native';
import { createComponent } from 'react-native-small-ui';

export const ThemedText = createComponent(Text, {
  fontSize: 14,
  _light: { color: '#1a1a1a' },
  _dark: { color: '#f0f0f0' },
});
