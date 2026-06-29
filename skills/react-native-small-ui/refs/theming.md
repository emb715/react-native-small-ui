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

## Custom color modes

Register app-managed visual modes that layer on top of OS light/dark. Only one can be active at a time.

```tsx
import { configure } from 'react-native-small-ui';
import { setCustomColorMode, clearCustomColorMode, useCustomColorMode } from 'react-native-small-ui/colormode';

// 1. Register at startup — keys become valid _<key> style props
configure({ colorModes: { sepia: true, highContrast: true } });

// 2. Define per-mode styles in components
const Card = createComponent(View, {
  _light: { backgroundColor: '#fff' },
  _dark:  { backgroundColor: '#1a1a1a' },
  _sepia: { backgroundColor: '#f4e4c1' },
  _highContrast: { backgroundColor: '#000', borderWidth: 2, borderColor: '#fff' },
});

// 3. Activate from user interaction
setCustomColorMode('sepia');   // activates _sepia styles
clearCustomColorMode();        // returns to OS light/dark

// 4. Reactive hook
const { activeMode } = useCustomColorMode(); // string | null
```

## Spacing scale

The theme system accepts any shape — store spacing tokens alongside color tokens:

```tsx
// Plain object — recommended for most apps
export const tokens = {
  light: { primary: '#8b59a0', background: '#fff' },
  dark:  { primary: '#a070b8', background: '#0f0f0f' },
  space:  { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16, full: 9999 },
};

// generateSpaceUnits — for large proportional scales
import { generateSpaceUnits } from 'react-native-small-ui/theme';

const space = generateSpaceUnits(4);
// { '.25': 1, '.50': 2, '.75': 3, '1': 4, '2': 8, '3': 12, ... '10': 40 }

const space = generateSpaceUnits(8, { maxAmount: 20, withNegatives: true });
// { '1': 8, '-1': -8, '2': 16, '-2': -16, ... }
```

## ColorUtils

```tsx
import { ColorUtils } from 'react-native-small-ui/theme';

// Alpha / format
ColorUtils.getHexAlpha('#ff0000', 0.5)       // '#ff000080' — 8-digit hex with alpha
ColorUtils.toRgba('#8b59a0', 0.5)            // 'rgba(139, 89, 160, 0.5)'

// Contrast
ColorUtils.getContrastColor('#333333')        // '#ffffff' — black or white for max contrast
ColorUtils.getContrastMode('#ffffff')         // 'dark' — color is light, needs dark text
ColorUtils.getContrastRatio('#8b59a0', '#fff') // 4.73 — WCAG ratio (≥4.5 = AA pass)

// HSL manipulation — preserves hue and saturation
ColorUtils.darken('#8b59a0', 0.1)            // darker purple (pressed state)
ColorUtils.lighten('#8b59a0', 0.4)           // lighter purple (badge surface)
ColorUtils.mix('#8b59a0', '#ffffff', 0.85)   // very light tint
```
