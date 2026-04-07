# react-native-small-ui

A utility-first toolkit for React Native. Gives you the tools to build styled components with platform-specific styling, dark mode, and responsive design — without locking you into pre-built components or coupled theming systems.

**Philosophy: utilities, not opinions.** This is a component factory and hook toolkit, not a design system. You control every styling decision.

## Table of Contents

- [Installation](#installation)
- [Modular Imports](#modular-imports)
- [Quick Start](#quick-start)
- [createComponent](#createcomponent)
- [Hooks](#hooks)
  - [useColorModeValue](#usecolormodevalue)
  - [useColorMode](#usecolormode)
  - [useOrientation](#useorientation)
  - [useMediaQuery](#usemediaquery)
  - [useBreakPointValue](#usebreakpointvalue)
- [Theme System (Optional)](#theme-system-optional)
  - [registerTheme](#registertheme)
  - [setTheme](#settheme)
  - [getTheme](#gettheme)
  - [useTheme](#usetheme)
  - [useThemeName](#usethemename)
  - [generateSpaceUnits](#generatespaceunits)
- [Color Utilities](#color-utilities)
- [Helpers](#helpers)
- [Migration Guide](#migration-guide)
- [Known Issues](#known-issues)

## Installation

```sh
npm install react-native-small-ui
# or
yarn add react-native-small-ui
```

#### Web Support

- [React Native Web](https://necolas.github.io/react-native-web/docs/installation/)

## Modular Imports

Import only what you need to keep bundle size minimal:

```js
// Core (~15KB) — always needed
import { createComponent, configure } from 'react-native-small-ui';

// Color mode (~18KB total)
import {
  useColorMode,
  useColorModeValue,
  setColorScheme,
  toggleColorScheme,
} from 'react-native-small-ui/colormode';

// Responsive utilities (~22KB total)
import {
  useBreakPointValue,
  useMediaQuery,
  useOrientation,
} from 'react-native-small-ui/utils';

// Theme system (~122KB total) — optional
import {
  useTheme,
  registerTheme,
  setTheme,
  getTheme,
  useThemeName,
  generateSpaceUnits,
  ColorUtils,
} from 'react-native-small-ui/theme';
```

## Quick Start

The library auto-initializes on import. No setup hook required.

```tsx
import { createComponent } from 'react-native-small-ui';
import { View, Text, TouchableOpacity } from 'react-native';

// Create components OUTSIDE render — once, at module level
const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
  _ios: { shadowOpacity: 0.1 },
  _android: { elevation: 2 },
});

const Button = createComponent(TouchableOpacity, {
  padding: 12,
  borderRadius: 6,
  backgroundColor: '#007AFF',
  alignItems: 'center',
});

export default function App() {
  return (
    <Card marginTop={20}>
      <Text>Hello!</Text>
      <Button>
        <Text style={{ color: '#fff' }}>Press me</Text>
      </Button>
    </Card>
  );
}
```

> **Critical**: Always create components **outside** render functions. Creating inside a render causes remounts on every render, losing state and animations.

## createComponent

Wraps any React Native component with enhanced styling capabilities.

**Style props available:**

- All React Native style properties as direct props
- `_light` / `_dark` — color mode conditional styles
- `_ios` / `_android` / `_web` / `_native` — platform-specific styles

```tsx
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

const Box = createComponent(View, {
  padding: 16,
  _light: { backgroundColor: '#f5f5f5' },
  _dark: { backgroundColor: '#111' },
  _ios: { shadowOpacity: 0.1 },
  _android: { elevation: 2 },
});

// Props override base styles at render time
<Box padding={24} marginTop={8} />;
```

## Hooks

### useColorModeValue

Returns one of two values based on the current color scheme.

```jsx
import { useColorModeValue } from 'react-native-small-ui/colormode';

// With strings
const bgColor = useColorModeValue('#fff', '#000');

// With style objects
const cardStyle = useColorModeValue(
  { backgroundColor: '#eee', color: '#000' },
  { backgroundColor: '#333', color: '#fff' }
);
```

### useColorMode

Access the current color scheme.

```jsx
import {
  useColorMode,
  setColorScheme,
  toggleColorScheme,
} from 'react-native-small-ui/colormode';

function ThemeToggle() {
  const { colorMode } = useColorMode(); // 'light' | 'dark' | 'auto'

  return (
    <TouchableOpacity onPress={toggleColorScheme}>
      <Text>Current: {colorMode}</Text>
    </TouchableOpacity>
  );
}

// Programmatic control
setColorScheme('dark');
setColorScheme('light');
setColorScheme('auto'); // follow system
```

### useOrientation

Returns `'portrait'` or `'landscape'`.

```jsx
import { useOrientation } from 'react-native-small-ui/utils';

const orientation = useOrientation();
const isLandscape = orientation === 'landscape';
```

### useMediaQuery

CSS-like media query matching. Returns a boolean.

```jsx
import { useMediaQuery } from 'react-native-small-ui/utils';

const isLargeScreen = useMediaQuery('(min-width: 768px)');
```

### useBreakPointValue

Returns different values based on screen width breakpoint.

**Breakpoints:** `default`, `xs` (480px+), `sm` (640px+), `md` (768px+), `lg` (1024px+), `xl` (1280px+), `2xl` (1536px+)

```jsx
import { useBreakPointValue } from 'react-native-small-ui/utils';

const padding = useBreakPointValue({
  default: 8,
  sm: 12,
  md: 16,
  lg: 24,
});
```

## Theme System (Optional)

A shape-agnostic named-slot registry. No enforced structure — store whatever your app needs.

### registerTheme

```ts
import { registerTheme } from 'react-native-small-ui/theme';

// Unnamed — registers and activates as 'default'
registerTheme({
  light: { primary: '#007AFF', background: '#fff', text: '#000' },
  dark: { primary: '#0A84FF', background: '#000', text: '#fff' },
});

// Named — silent registration, does not switch active theme
registerTheme('ocean', {
  light: { primary: '#0af', background: '#f0faff' },
  dark: { primary: '#08c', background: '#001a33' },
});
```

### setTheme

Switch the active theme by name. Throws if the name is not registered.

```ts
import { setTheme } from 'react-native-small-ui/theme';

setTheme('ocean'); // returns true on success, throws otherwise
```

### getTheme

Get the active theme value outside of React.

```ts
import { getTheme } from 'react-native-small-ui/theme';

const theme = getTheme(); // returns unknown — cast to your type
```

### useTheme

Reactive hook. Returns the registered theme object. The default slot is initialized as an empty object `{}` — cast to your own type for full inference.

```tsx
import { useTheme } from 'react-native-small-ui/theme';

type AppTheme = {
  light: { primary: string; background: string };
  dark: { primary: string; background: string };
};

// Full theme — cast to your type
const theme = useTheme() as AppTheme;
theme.light.primary; // '#007AFF'

// Selector — typed slice, re-renders only when selected value changes
const primary = useTheme((t) => (t as AppTheme).light.primary);
```

### useThemeName

Returns the active theme name.

```ts
import { useThemeName } from 'react-native-small-ui/theme';

const name = useThemeName(); // 'default' | 'ocean' | ...
```

### generateSpaceUnits

Standalone spacing scale utility. No theme coupling.

```ts
import { generateSpaceUnits } from 'react-native-small-ui/theme';

const space = generateSpaceUnits(4);
// { '.25': 1, '.50': 2, '.75': 3, '1': 4, '2': 8, ..., '10': 40 }

const space8 = generateSpaceUnits(8, { maxAmount: 20, withNegatives: true });
// { '1': 8, '-1': -8, '2': 16, '-2': -16, ... }
```

## Color Utilities

```ts
import { ColorUtils } from 'react-native-small-ui/theme';

ColorUtils.getHexAlpha('#f00', 0.5); // '#ff000080'
ColorUtils.getContrastColor('#333'); // '#fff'
ColorUtils.getContrastMode('#fff'); // 'light'
```

## Helpers

### getStatusBarStyle

Returns `'light-content'` or `'dark-content'` based on the background color contrast.

```ts
import { getStatusBarStyle } from 'react-native-small-ui';

const barStyle = getStatusBarStyle('#8b59a0'); // 'light-content'
```

## Migration Guide

### Upgrading from monolithic imports (pre-modular)

Imports that previously came from `'react-native-small-ui'` directly are now split across subpaths. Update as follows:

```ts
// Before
import {
  createComponent,
  useColorMode,
  useColorModeValue,
  setColorScheme,
  toggleColorScheme,
  useTheme,
  registerTheme,
  getTheme,
  setTheme,
  useThemeName,
  generateSpaceUnits,
  ColorUtils,
  useBreakPointValue,
  useMediaQuery,
  useOrientation,
  getStatusBarColor,
} from 'react-native-small-ui';

// After
import { createComponent, configure } from 'react-native-small-ui';
import {
  useColorMode,
  useColorModeValue,
  setColorScheme,
  toggleColorScheme,
} from 'react-native-small-ui/colormode';
import {
  useTheme,
  registerTheme,
  getTheme,
  setTheme,
  useThemeName,
  generateSpaceUnits,
  ColorUtils,
} from 'react-native-small-ui/theme';
import {
  useBreakPointValue,
  useMediaQuery,
  useOrientation,
} from 'react-native-small-ui/utils';
```

### Renamed APIs

| Old                   | New                   | Notes                                                                         |
| --------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `useSmallUI()`        | _(removed)_           | Library auto-initializes on import. Use `configure()` for custom breakpoints. |
| `getStatusBarColor()` | `getStatusBarStyle()` | Same behavior, corrected name.                                                |

### Renamed theme token keys

Snake_case foreground tokens are now camelCase:

| Old                      | New                     |
| ------------------------ | ----------------------- |
| `primary_foreground`     | `primaryForeground`     |
| `secondary_foreground`   | `secondaryForeground`   |
| `destructive_foreground` | `destructiveForeground` |
| `accent_foreground`      | `accentForeground`      |
| `muted_foreground`       | `mutedForeground`       |
| `card_foreground`        | `cardForeground`        |

## Known Issues

### Expo — Color Mode Detection

If changing appearance settings on device has no effect:

`ios/Info.plist`:

```xml
<key>UIUserInterfaceStyle</key>
<string>Automatic</string>
```

Or `app.json`:

```json
{ "expo": { "userInterfaceStyle": "automatic" } }
```

---

## Built With

- [React Native](https://reactnative.dev/)
- [zustand](https://zustand-demo.pmnd.rs/)
- [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob)

## License

MIT
