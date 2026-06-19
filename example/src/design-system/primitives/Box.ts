import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';

// Base container — no styles, just wraps View with the enhanced API.
// Use padding/margin/etc. as props at the call site.
export const Box = createComponent(View);

// Horizontal row — children vertically centered, 8px gap by default.
export const HStack = createComponent(View, {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
});

// Vertical column — 8px gap between children.
// No alignItems override so children size naturally.
export const VStack = createComponent(View, {
  flexDirection: 'column' as const,
  gap: 8,
});

// Both-axis centered content.
export const Center = createComponent(View, {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});
