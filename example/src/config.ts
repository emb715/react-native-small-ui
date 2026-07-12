import { Dimensions } from 'react-native';
import { configure } from 'react-native-small-ui';
import { registerTheme } from 'react-native-small-ui/theme';

import { defaultTheme } from './theme/default';
import { oceanTheme } from './theme/ocean';
import { sunsetTheme } from './theme/sunset';

// Custom platform predicates — each key becomes a valid `_<key>` style prop
// on any createComponent output. Demonstrated in the configure showcase screen.
configure({
  platforms: {
    tablet: () => Dimensions.get('window').width >= 768,
    compact: () => Dimensions.get('window').width < 375,
  },
  // Custom color modes — each key becomes a valid `_<key>` style prop.
  // Activated via setCustomColorMode(key) from react-native-small-ui/colormode.
  // Demonstrated in the custom-colormode showcase screen.
  colorModes: {
    sepia: true,
    highContrast: true,
  },
});

// Register theme slots.
// registerTheme(theme)        — registers as 'default', activates immediately.
// registerTheme(name, theme)  — registers as named slot, does NOT switch active theme.
registerTheme(defaultTheme);
registerTheme('ocean', oceanTheme);
registerTheme('sunset', sunsetTheme);
