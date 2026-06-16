import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';
import { elevation } from 'react-native-small-ui/presets';

const CardRoot = createComponent(View, {
  borderRadius: 12,
  overflow: 'hidden' as const,
  _light: { backgroundColor: '#ffffff', ...elevation.sm },
  _dark: { backgroundColor: '#1e1e1e', ...elevation.sm },
});

const CardHeader = createComponent(View, {
  padding: 16,
  borderBottomWidth: 0.5,
  _light: { borderColor: '#e5e5e5' },
  _dark: { borderColor: '#2a2a2a' },
});

const CardBody = createComponent(View, {
  padding: 16,
});

const CardFooter = createComponent(View, {
  padding: 12,
  flexDirection: 'row' as const,
  justifyContent: 'flex-end' as const,
  gap: 8,
  borderTopWidth: 0.5,
  _light: { borderColor: '#e5e5e5' },
  _dark: { borderColor: '#2a2a2a' },
});

export const Card = CardRoot.withSlots({
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
