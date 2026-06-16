---
title: Hooks
---

## Responsive Hooks

Import from `'react-native-small-ui/utils'` for responsive utilities.

### useOrientation

Detects device orientation and returns either `'landscape'` or `'portrait'`.

```js
import { useOrientation } from 'react-native-small-ui/utils';
```

**Usage:**

```jsx
import { useOrientation } from 'react-native-small-ui/utils';

function MyComponent() {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  return (
    <View style={{ flexDirection: isLandscape ? 'row' : 'column' }}>
      <Text>Orientation: {orientation}</Text>
    </View>
  );
}
```

---

### useMediaQuery

CSS-like media query matching. Returns a boolean indicating if the query matches.

```js
import { useMediaQuery } from 'react-native-small-ui/utils';
```

On **web**, `useMediaQuery` delegates entirely to `window.matchMedia` — the browser evaluates the full spec. The native matcher below only runs on **iOS and Android**.

#### Supported features (native)

| Category | Features | Notes |
|---|---|---|
| **Viewport dimensions** | `width`, `min-width`, `max-width`, `height`, `min-height`, `max-height` | Units: `px`, `rem`, `em` (1rem = 16px) |
| **Device dimensions** | `device-width`, `min-device-width`, `max-device-width`, `device-height`, `min-device-height`, `max-device-height` | Deprecated in MQ4, but supported |
| **Aspect ratio** | `aspect-ratio`, `min-aspect-ratio`, `max-aspect-ratio`, `device-aspect-ratio`, `min-device-aspect-ratio`, `max-device-aspect-ratio` | Values: `16/9`, `4/3`, or a decimal |
| **Resolution** | `resolution`, `min-resolution`, `max-resolution` | Units: `dppx`, `x`, `dpi`, `dpcm` — maps to `PixelRatio` |
| **Orientation** | `orientation` | `landscape` \| `portrait` |
| **Color** | `color`, `min-color`, `max-color`, bare `(color)` | Native reports 8 bits per component; `color: 0` → false |
| **User preference** | `prefers-color-scheme` | `light` \| `dark` — reads OS color scheme via `Appearance` |
| **Interaction** | `hover`, `any-hover`, `pointer`, `any-pointer` | Touch devices: `hover: none`, `pointer: coarse` — always |

#### Always false on native

`prefers-reduced-motion`, `prefers-contrast`, `prefers-reduced-transparency`, `forced-colors`, `inverted-colors`, `color-gamut`, `dynamic-range`, `color-index`, `monochrome`, `display-mode`, `scripting`, `scan`, `grid`, `update` — no synchronous React Native API exists for these. On web the browser handles them natively.

#### Examples

**Basic width query:**

```jsx
import { useMediaQuery } from 'react-native-small-ui/utils';

function ResponsiveComponent() {
  const isLargeScreen = useMediaQuery('(min-width: 30rem)');
  const isMedium = useMediaQuery('(min-width: 30rem) and (max-width: 60rem)');

  return (
    <View>
      <Text>Large screen: {isLargeScreen ? 'Yes' : 'No'}</Text>
      <Text>Medium screen: {isMedium ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

**Color scheme query:**

```jsx
import { useMediaQuery } from 'react-native-small-ui/utils';

function AdaptiveBackground() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <View style={{ backgroundColor: prefersDark ? '#1a1a1a' : '#ffffff' }}>
      <Text>Follows OS color scheme</Text>
    </View>
  );
}
```

**Resolution and aspect-ratio compound query:**

```jsx
import { useMediaQuery } from 'react-native-small-ui/utils';

function HighDensityLandscape() {
  // True on high-DPI devices in landscape orientation
  const isHighDpiLandscape = useMediaQuery(
    '(min-resolution: 2dppx) and (orientation: landscape)'
  );

  // True on wide-ratio screens (wider than 16:9)
  const isUltrawide = useMediaQuery('(min-aspect-ratio: 16/9)');

  // Comma = OR: matches retina OR very high-density screens
  const isRetina = useMediaQuery('(min-resolution: 2dppx), (min-resolution: 192dpi)');

  return (
    <View>
      <Text>High-DPI landscape: {isHighDpiLandscape ? 'Yes' : 'No'}</Text>
      <Text>Ultrawide: {isUltrawide ? 'Yes' : 'No'}</Text>
      <Text>Retina: {isRetina ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

---

### useBreakPointValue

Returns different values based on the current screen width breakpoint.

```js
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

**Breakpoints:**

- `default` - Base value (0px+)
- `xs` - 480px+
- `sm` - 640px+
- `md` - 768px+
- `lg` - 1024px+
- `xl` - 1280px+
- `2xl` - 1536px+

**Usage:**

```jsx
import { useBreakPointValue } from 'react-native-small-ui/utils';

function ResponsiveCard() {
  const padding = useBreakPointValue({
    'default': 8,
    'sm': 12,
    'md': 16,
    'lg': 20,
    'xl': 24,
    '2xl': 32,
  });

  const fontSize = useBreakPointValue({
    default: 14,
    md: 16,
    lg: 18,
  });

  return (
    <View style={{ padding }}>
      <Text style={{ fontSize }}>Responsive content</Text>
    </View>
  );
}
```

---

## Color Mode Hooks

Import from `'react-native-small-ui/colormode'` for color mode utilities.

### useColorModeValue

Returns one of two values based on the current color scheme (light/dark).

```js
import { useColorModeValue } from 'react-native-small-ui/colormode';
```

**Usage with strings:**

```jsx
import { useColorModeValue } from 'react-native-small-ui/colormode';

function ThemedText() {
  const textColor = useColorModeValue('#000000', '#ffffff');
  const backgroundColor = useColorModeValue('#ffffff', '#000000');

  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Themed Text</Text>
    </View>
  );
}
```

**Usage with style objects:**

```jsx
import { useColorModeValue } from 'react-native-small-ui/colormode';

function ThemedCard() {
  const cardStyle = useColorModeValue(
    {
      color: '#f90',
      backgroundColor: '#eee',
      borderColor: '#999',
    },
    {
      color: '#f60',
      backgroundColor: '#333',
      borderColor: '#777',
    }
  );

  return (
    <View style={cardStyle}>
      <Text>Themed Card</Text>
    </View>
  );
}
```

---

### useColorMode

Access and control the current color scheme programmatically.

```js
import { useColorMode } from 'react-native-small-ui/colormode';
```

**Returns:**

- `colorMode` - Current mode: `'light'`, `'dark'`, or `'auto'`

**Usage:**

```jsx
import { useColorMode } from 'react-native-small-ui/colormode';

function ColorModeDisplay() {
  const { colorMode } = useColorMode();

  return (
    <View>
      <Text>Current color mode: {colorMode}</Text>
    </View>
  );
}
```

---

### setColorScheme

Set the color scheme programmatically.

```js
import { setColorScheme } from 'react-native-small-ui/colormode';
```

**Usage:**

```jsx
import { setColorScheme } from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text } from 'react-native';

function ThemeSelector() {
  return (
    <View>
      <TouchableOpacity onPress={() => setColorScheme('light')}>
        <Text>Light Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('dark')}>
        <Text>Dark Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('auto')}>
        <Text>Auto (System)</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### toggleColorScheme

Toggle between light and dark modes (ignores 'auto').

```js
import { toggleColorScheme } from 'react-native-small-ui/colormode';
```

**Usage:**

```jsx
import { toggleColorScheme } from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text } from 'react-native';

function ThemeToggle() {
  return (
    <TouchableOpacity onPress={toggleColorScheme}>
      <Text>Toggle Theme</Text>
    </TouchableOpacity>
  );
}
```

---

### setCustomColorMode

Activates a custom app-managed color mode by name. The name must be registered via `configure({ colorModes: { ... } })`. Pass `null` to clear any active custom mode.

Custom modes layer **on top of** the built-in light/dark system — they don't replace it.

```js
import {
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';
```

**Setup:**

```ts
import { configure } from 'react-native-small-ui';

// Register custom modes once at startup
configure({
  colorModes: {
    highContrast: true,
    sepia: true,
    dim: true,
  },
});
```

**Usage:**

```tsx
import {
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

// Components use _<modeName> props for custom mode styles
const Card = createComponent(View, {
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
  _highContrast: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  _sepia: { backgroundColor: '#f4e4c1' },
});

// Activate a custom mode
setCustomColorMode('highContrast');

// Clear — returns to OS-driven light/dark only
clearCustomColorMode();
```

---

### clearCustomColorMode

Clears the active custom color mode, returning to OS-driven light/dark only.

```js
import { clearCustomColorMode } from 'react-native-small-ui/colormode';

clearCustomColorMode();
```

---

### useCustomColorMode

Reactive hook. Returns the currently active custom color mode name, or `null` when none is active.

```js
import { useCustomColorMode } from 'react-native-small-ui/colormode';
```

**Usage:**

```tsx
import {
  useCustomColorMode,
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text, View } from 'react-native';

function AccessibilityPanel() {
  const { activeMode } = useCustomColorMode();

  return (
    <View>
      <Text>Active mode: {activeMode ?? 'default'}</Text>
      <TouchableOpacity onPress={() => setCustomColorMode('highContrast')}>
        <Text>High Contrast</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCustomColorMode('sepia')}>
        <Text>Sepia</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearCustomColorMode}>
        <Text>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}
```

See the [Platform & Color Mode Registry Guide](/guides/platform-registry) for full setup and usage patterns.

---

## Theme Hooks

Import from `'react-native-small-ui/theme'` for the full theming system.

### useTheme

Reactive hook to access the active theme. Returns `unknown` — cast to your own type.

```js
import { useTheme } from 'react-native-small-ui/theme';
```

**Usage — full theme:**

```tsx
import { useTheme } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

type AppTheme = {
  light: { primary: string; background: string };
  dark: { primary: string; background: string };
};

// Create component outside render
const Button = createComponent(TouchableOpacity, { borderRadius: 8 });

function ThemedButton() {
  const theme = useTheme() as AppTheme;

  return (
    <Button
      _light={{ backgroundColor: theme.light.primary }}
      _dark={{ backgroundColor: theme.dark.primary }}
    >
      <Text>Themed Button</Text>
    </Button>
  );
}
```

**Usage — selector (typed slice):**

```tsx
const primary = useTheme((t) => (t as AppTheme).light.primary);
```

The selector re-renders only when the selected value changes.

---

### useThemeName

Returns the active theme name as a string.

```js
import { useThemeName } from 'react-native-small-ui/theme';

const name = useThemeName(); // 'default' | 'ocean' | ...
```

See the [Theming Guide](/guides/theming) for the full theme system including `registerTheme`, `setTheme`, and `generateSpaceUnits`.
