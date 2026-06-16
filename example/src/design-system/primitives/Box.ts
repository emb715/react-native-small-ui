import { View } from 'react-native';
import { createComponent } from 'react-native-small-ui';
import { layout } from 'react-native-small-ui/presets';

// Base container — no styles, just wraps View with the enhanced API.
// Use padding/margin/etc. as props at the call site.
export const Box = createComponent(View);

// Horizontal row, children vertically centered, 8px gap
export const HStack = Box.extend({
  ...layout.row,
  gap: 8,
});

// Vertical column, 8px gap between children.
// Note: flexDirection: 'column' only — no alignItems override so children
// size naturally. layout.column includes alignItems:'stretch' which collapses
// text children in certain RN layouts.
export const VStack = Box.extend({
  flexDirection: 'column' as const,
  gap: 8,
});

// Centered content in both axes, flex: 1
export const Center = Box.extend({
  ...layout.center,
});
