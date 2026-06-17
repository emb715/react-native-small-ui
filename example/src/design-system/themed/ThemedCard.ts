import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';

export const ThemedCard = createComponent(View, {
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  _light: { backgroundColor: '#f5f5f5', borderColor: '#e5e5e5' },
  _dark: { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' },
});
