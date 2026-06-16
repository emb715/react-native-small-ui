# Theming

The theme system is a named-slot registry. You define the shape — the library stores and retrieves it. No default tokens are provided.

## Register and access

```tsx
import { registerTheme, useTheme } from 'react-native-small-ui/theme';

// Define your own theme shape
type AppTheme = {
  light: { primary: string; background: string; surface: string };
  dark:  { primary: string; background: string; surface: string };
};

// Register at app startup (module level)
registerTheme({
  light: { primary: '#007AFF', background: '#fff',    surface: '#f5f5f5' },
  dark:  { primary: '#0A84FF', background: '#000',    surface: '#1c1c1e' },
});

// In a component — useTheme() returns unknown, always cast
function ThemedCard() {
  const theme = useTheme() as AppTheme;
  return (
    <Card
      _light={{ backgroundColor: theme.light.surface }}
      _dark={{ backgroundColor: theme.dark.surface }}
    />
  );
}
```

## Named theme slots

```tsx
// Register without switching — 'ocean' becomes available but inactive
registerTheme('ocean', {
  light: { primary: '#0af', background: '#f0faff', surface: '#e0f4ff' },
  dark:  { primary: '#08c', background: '#001a2c', surface: '#002a44' },
});

// Switch at runtime
setTheme('ocean');    // → true
setTheme('unknown');  // → throws: [react-native-small-ui] setTheme: theme "unknown" not found
```

## Selector — partial subscription

```tsx
// Re-renders only when the selected value changes
const primary = useTheme((t) => (t as AppTheme).light.primary);
```

## Outside React

```tsx
import { getTheme } from 'react-native-small-ui/theme';

// Access active theme in non-component code (event handlers, utilities, etc.)
const theme = getTheme() as AppTheme;
```

## generateSpaceUnits

Generates a spacing scale from a base unit value.

```tsx
import { generateSpaceUnits } from 'react-native-small-ui/theme';

const space = generateSpaceUnits(4);
// { '.25': 1, '.50': 2, '.75': 3, '1': 4, '2': 8, '3': 12, ... '10': 40 }

const space = generateSpaceUnits(8, { maxAmount: 20, withNegatives: true });
// { '1': 8, '-1': -8, '2': 16, '-2': -16, ... }
```

## ColorUtils

```tsx
import { ColorUtils } from 'react-native-small-ui/theme';

ColorUtils.getHexAlpha('#ff0000', 0.5)  // '#ff000080' — hex + alpha channel
ColorUtils.getContrastColor('#333333')  // '#ffffff'   — black or white for max contrast
ColorUtils.getContrastMode('#ffffff')   // 'light'     — 'light' | 'dark'
```
