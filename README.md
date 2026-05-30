# react-native-small-ui

A utility-first toolkit for React Native. Gives you the tools to build styled components with platform-specific styling, dark mode, and responsive design — without locking you into pre-built components or coupled theming systems.

**Philosophy: utilities, not opinions.** This is a component factory and hook toolkit, not a design system. You control every styling decision.

## Table of Contents

- [Installation](#installation)
- [Modular Imports](#modular-imports)
- [Quick Start](#quick-start)
- [createComponent](#createcomponent)
  - [Reactive Style Factory](#reactive-style-factory-ctx)
  - [Variant System](#variant-system)
  - [.extend()](#extend)
  - [.withSlots()](#withslots)
- [createComponentGroup](#createcomponentgroup)
- [Hooks](#hooks)
  - [useColorModeValue](#usecolormodevalue)
  - [useColorMode](#usecolormode)
  - [useCustomColorMode](#usecustomcolormode)
  - [useOrientation](#useorientation)
  - [useMediaQuery](#usemediaquery)
  - [useBreakPointValue](#usebreakpointvalue)
- [Platform Registry](#platform-registry)
- [Custom Color Mode Registry](#custom-color-mode-registry)
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
import { createComponent, createThemedComponent, configure } from 'react-native-small-ui';

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

// Theme system (~65KB total) — optional
import {
  useTheme,
  registerTheme,
  setTheme,
  getTheme,
  useThemeName,
  generateSpaceUnits,
  ColorUtils,
} from 'react-native-small-ui/theme';

// Style presets (~0KB overhead — plain objects)
import { elevation, shadow, inset, text, layout, border } from 'react-native-small-ui/presets';

// Testing utilities (dev/test only)
import { renderWithSmallUI, assertStyles } from 'react-native-small-ui/testing';
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

Wraps any React Native component with enhanced styling capabilities. Accepts either a plain style object or a full `ComponentConfig` with variants.

**Style props available:**

- All React Native style properties as direct props
- `_light` / `_dark` — color mode conditional styles
- `_ios` / `_android` / `_web` / `_native` — platform-specific styles
- `_<key>` — custom registered platform or color mode keys

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

### Reactive Style Factory (ctx)

Pass a function to access the reactive context — `colorMode` and `breakpoint()`:

```tsx
const Card = createComponent(View, (ctx) => ({
  padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
  backgroundColor: ctx.colorMode === 'dark' ? '#1a1a1a' : '#fff',
}));
```

### Variant System

Full cva-style variants with full TypeScript inference — no manual type declarations:

```tsx
const Button = createComponent(TouchableOpacity, {
  base: { borderRadius: 8, alignItems: 'center' },
  variants: {
    size: {
      sm: { paddingVertical: 6,  paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 20 },
      lg: { paddingVertical: 14, paddingHorizontal: 28 },
    },
    intent: {
      primary: { _light: { backgroundColor: '#007AFF' }, _dark: { backgroundColor: '#0A84FF' } },
      danger:  { _light: { backgroundColor: '#e00c2c' }, _dark: { backgroundColor: '#be0a25' } },
    },
  },
  compoundVariants: [
    { variants: { size: 'sm', intent: 'danger' }, style: { borderWidth: 2 } },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});

// size and intent props are fully typed and autocompleted
<Button size="lg" intent="danger" />
<Button /> // uses defaultVariants
```

**Resolution order:** base → defaultVariants → prop variants → compoundVariants → direct props (direct always wins).

### .extend()

Compose components without re-calling `createComponent`. The original is unchanged:

```tsx
const Base = createComponent(View, { padding: 8, borderRadius: 4 });

const Card = Base.extend({
  padding: 16, // overrides base
  _light: { backgroundColor: '#fff' }, // added
});

const VariantCard = Base.extend({
  variants: { elevated: { yes: { _android: { elevation: 4 } }, no: {} } },
  defaultVariants: { elevated: 'yes' },
});
```

### .withSlots()

Attach named sub-components as dot-notation properties. Slots share reactive context automatically:

```tsx
const Card = createComponent(View, { borderRadius: 8 }).withSlots({
  Header: createComponent(View, { padding: 16, borderBottomWidth: 1 }),
  Body: createComponent(View, { padding: 16 }),
  Footer: createComponent(View, { padding: 12 }),
});

<Card>
  <Card.Header>
    <Text>Title</Text>
  </Card.Header>
  <Card.Body>
    <Text>Content</Text>
  </Card.Body>
  <Card.Footer>
    <Text>Actions</Text>
  </Card.Footer>
</Card>;
```

### Component Metadata

Pass an optional metadata object as the third argument to name a component for tooling and DevTools:

```tsx
const Button = createComponent(
  TouchableOpacity,
  {
    base: { borderRadius: 8 },
    variants: { size: { sm: { padding: 6 }, md: { padding: 10 } } },
    defaultVariants: { size: 'md' },
  },
  { name: 'Button', description: 'Primary action trigger', tags: ['action'] }
);

// Static introspection — no render needed
Button.__meta;        // { name: 'Button', description: '...', tags: [...] }
Button.__variants;    // { size: ['sm', 'md'] }
Button.__resolveStyles({ colorMode: 'dark', breakpointWidth: 768 });
// => resolved style object for that context
```

## createComponentGroup

Creates sibling components that share reactive context — no parent-child hierarchy required:

```tsx
import { createComponentGroup } from 'react-native-small-ui';

const { FormLabel, FormInput, FormError } = createComponentGroup({
  FormLabel: { Component: Text, style: { fontSize: 14, fontWeight: '600' } },
  FormInput: {
    Component: View,
    style: { borderWidth: 1, borderRadius: 6, padding: 10 },
  },
  FormError: {
    Component: Text,
    style: {
      fontSize: 12,
      _light: { color: '#e00c2c' },
      _dark: { color: '#be0a25' },
    },
  },
});

// All three respond to colorMode changes — no wrapper needed
function EmailField() {
  return (
    <View>
      <FormLabel>Email</FormLabel>
      <FormInput />
      <FormError>Required</FormError>
    </View>
  );
}
```

## createThemedComponent

Like `createComponent` but receives the active theme as the second argument — a function that takes the theme and returns styles. The theme is typed as `unknown`; cast to your own type.

```tsx
import { createThemedComponent } from 'react-native-small-ui';
import { registerTheme } from 'react-native-small-ui/theme';

type AppTheme = { primary: string; background: string };

registerTheme({ primary: '#007AFF', background: '#fff' });

const ThemedButton = createThemedComponent(
  TouchableOpacity,
  (theme) => {
    const t = theme as AppTheme;
    return {
      backgroundColor: t.primary,
      padding: 12,
      borderRadius: 8,
    };
  }
);
```

> **Note:** `createThemedComponent` re-runs the style function on every render because the theme is a runtime value. For static or variant-based styles, prefer `createComponent` with `useTheme()` via props.

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

### useCustomColorMode

Reactive hook returning the active custom color mode name, or `null` when none is active.

```tsx
import {
  useCustomColorMode,
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';

const { activeMode } = useCustomColorMode(); // string | null

setCustomColorMode('highContrast'); // activate
clearCustomColorMode(); // clear
```

See [Custom Color Mode Registry](#custom-color-mode-registry) for full setup.

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

## Platform Registry

Register custom platform predicates via `configure()`. Each key becomes a valid `_<key>` style prop on all `createComponent` outputs.

```ts
import { configure } from 'react-native-small-ui';
import { Dimensions, Platform } from 'react-native';

configure({
  platforms: {
    tablet: () => Dimensions.get('window').width >= 768,
    tv: () => Platform.isTV,
  },
});
```

```tsx
const Card = createComponent(View, {
  padding: 12,
  _tablet: { padding: 24, maxWidth: 800, alignSelf: 'center' },
  _tv: { padding: 48 },
});
```

Predicates are evaluated synchronously at render time. Custom platform styles merge after built-in `_ios`/`_android` styles.

## Custom Color Mode Registry

Register app-managed color modes (high contrast, sepia, dim, etc.) that layer on top of OS light/dark without replacing it. Only one custom mode can be active at a time.

```ts
import { configure } from 'react-native-small-ui';
import {
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';

// Register at startup
configure({ colorModes: { highContrast: true, sepia: true } });

// Activate / clear programmatically
setCustomColorMode('highContrast');
clearCustomColorMode();
```

```tsx
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
```

Unregistered keys are silently ignored — typos don't produce unexpected styles.

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

```ts
import {
  getStatusBarStyle,
  cs,
  getResolvedStyles,
} from 'react-native-small-ui';
```

### getStatusBarStyle

Returns `'light-content'` or `'dark-content'` based on the background color contrast.

```ts
const barStyle = getStatusBarStyle('#8b59a0'); // 'light-content'
const barStyle2 = getStatusBarStyle('#fdfbfd'); // 'dark-content'
```

### cs()

Merges style objects, filtering falsy values. Last-write-wins on conflict. The React Native equivalent of `cn()`.

```ts
const style = cs(
  { padding: 8, borderRadius: 4 },
  isActive && { borderColor: '#007AFF', borderWidth: 2 },
  isDisabled && { opacity: 0.5 }
);

// Works with _light/_dark and custom platform props
const themed = cs(baseStyles, {
  _light: { color: '#000' },
  _dark: { color: '#fff' },
});
```

### getResolvedStyles()

Pure-function style resolver — no rendering required. Useful for testing and tooling.

```ts
const styleDef = (ctx) => ({
  padding: ctx.breakpoint({ default: 8, md: 16 }),
  backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
});

// Inspect at specific conditions
const styles = getResolvedStyles(styleDef, {
  colorMode: 'dark',
  breakpointWidth: 800,
});
// => { padding: 16, backgroundColor: '#000' }
```

## Style Presets

Import named style objects for common cross-platform patterns. Plain objects — spread into any `createComponent` call or `StyleSheet`.

```ts
import { elevation, shadow, inset, text, layout, border } from 'react-native-small-ui/presets';
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

const Card = createComponent(View, {
  borderRadius: 12,
  ...elevation.sm,
});
```

**Available presets:**
- `elevation` — `none`, `xs`, `sm`, `md`, `lg`, `xl` — cross-platform (iOS shadow + Android elevation)
- `shadow` — `none`, `soft`, `default`, `pronounced`, `inset` — iOS-only shadow props
- `inset` — `none`, `safe`, `safeHorizontal`, `modal` — safe area padding
- `text` — `fixed`, `crisp`, `accessible` — cross-platform text rendering
- `layout` — `fill`, `center`, `row`, `rowBetween`, `column`, `absoluteFill` — flex patterns
- `border` — `hairline`, `thin`, `medium`, `thick`, `pill` — border widths and shapes

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

| Old            | New          | Notes                                                                         |
| -------------- | ------------ | ----------------------------------------------------------------------------- |
| `useSmallUI()` | _(removed)_  | Library auto-initializes on import. Use `configure()` for custom breakpoints. |

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
