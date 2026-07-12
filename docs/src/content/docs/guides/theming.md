---
title: Theming Guide
description: Complete guide to the theme system
---

The theme system is a shape-agnostic named-slot registry. You store whatever your app needs — no enforced structure, no default colors, no palette generation. You own the shape entirely.

:::note[Optional Feature]
The theme system is optional. Import from `react-native-small-ui/theme` only when you need it. See [Bundle Optimization](/guides/bundle-optimization) for details.
:::

## Installation

```js
import { registerTheme, useTheme, setTheme, getTheme, useThemeName, generateSpaceUnits } from 'react-native-small-ui/theme';
```

---

## Registering a Theme

### Default slot (unnamed)

Registers and activates immediately as `'default'`:

```ts
import { registerTheme } from 'react-native-small-ui/theme';

registerTheme({
  light: { primary: '#007AFF', background: '#fff', text: '#000' },
  dark:  { primary: '#0A84FF', background: '#000', text: '#fff' },
});
```

Do this once at app initialization — before any component renders.

### Named slot

Registers without switching the active theme:

```ts
registerTheme('ocean', {
  light: { primary: '#0af', background: '#f0faff' },
  dark:  { primary: '#08c', background: '#001a33' },
});

registerTheme('warm', {
  light: { primary: '#f80', background: '#fffaf0' },
  dark:  { primary: '#c60', background: '#1a0d00' },
});
```

---

## Switching Themes

```ts
import { setTheme } from 'react-native-small-ui/theme';

setTheme('ocean'); // returns true
setTheme('missing'); // throws: theme "missing" not found. Available: default, ocean, warm
```

`setTheme` always throws on unknown names — catches configuration mistakes at runtime regardless of environment.

---

## Accessing the Theme

### In React — `useTheme`

Returns `unknown`. Cast to your own type:

```tsx
import { useTheme } from 'react-native-small-ui/theme';

type AppTheme = {
  light: { primary: string; background: string; text: string };
  dark:  { primary: string; background: string; text: string };
};

function ThemedButton() {
  const theme = useTheme() as AppTheme;

  return (
    <Button
      _light={{ backgroundColor: theme.light.primary }}
      _dark={{ backgroundColor: theme.dark.primary }}
    />
  );
}
```

### With a selector

```tsx
// Typed slice — avoids the full cast at call site
const primary = useTheme((t) => (t as AppTheme).light.primary);
```

The selector re-renders only when the selected value changes.

### Outside React — `getTheme`

```ts
import { getTheme } from 'react-native-small-ui/theme';

const theme = getTheme() as AppTheme;
```

### Active theme name — `useThemeName`

```ts
import { useThemeName } from 'react-native-small-ui/theme';

const name = useThemeName(); // 'default' | 'ocean' | ...
```

---

## TypeScript Pattern

Define your theme type once and reuse it:

```ts
// theme.ts
export type AppTheme = {
  light: {
    primary: string;
    background: string;
    text: string;
    border: string;
  };
  dark: {
    primary: string;
    background: string;
    text: string;
    border: string;
  };
};

// Register at app init
import { registerTheme } from 'react-native-small-ui/theme';
import type { AppTheme } from './theme';

const myTheme: AppTheme = {
  light: { primary: '#007AFF', background: '#fff', text: '#000', border: '#ddd' },
  dark:  { primary: '#0A84FF', background: '#000', text: '#fff', border: '#333' },
};

registerTheme(myTheme);
```

```tsx
// In components — one import, full inference
import { useTheme } from 'react-native-small-ui/theme';
import type { AppTheme } from './theme';

const primary = useTheme((t) => (t as AppTheme).light.primary);
```

---

## Runtime Theme Switching

```tsx
import { registerTheme, setTheme, useThemeName } from 'react-native-small-ui/theme';

// Register all themes at startup
registerTheme('blue', {
  light: { primary: '#007AFF' },
  dark:  { primary: '#0A84FF' },
});
registerTheme('green', {
  light: { primary: '#34C759' },
  dark:  { primary: '#30D158' },
});

function ThemeSwitcher() {
  const name = useThemeName();

  return (
    <View>
      <Text>Active: {name}</Text>
      <TouchableOpacity onPress={() => setTheme('blue')}>
        <Text>Blue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setTheme('green')}>
        <Text>Green</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Spacing Units

The theme system is shape-agnostic — your spacing scale is just a plain object like any other token. Define it however fits your design system.

### Plain object (recommended starting point)

No utility function required. A plain object is the simplest and most readable approach:

```ts
// tokens.ts
export const space = {
  xs:  4,
  sm:  8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm:  4,
  md:  8,
  lg: 16,
  full: 9999,
};
```

Use it directly in `createComponent` or as props:

```ts
import { space, radius } from './tokens';

const Card = createComponent(View, {
  padding: space.md,
  borderRadius: radius.md,
  gap: space.sm,
});

// Or as props at the call site
<Card padding={space.lg} />
```

Store it inside your theme object to keep everything in one place:

```ts
registerTheme({
  colors: { primary: '#8b59a0', background: '#fff' },
  space:  { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16, full: 9999 },
});

// Access via useTheme
const theme = useTheme() as AppTheme;
<Card padding={theme.space.md} borderRadius={theme.radius.md} />
```

### `generateSpaceUnits` — for systematic scales

When you want a proportional scale generated from a base unit (e.g. 4px grid), `generateSpaceUnits` saves repetitive arithmetic:

```ts
import { generateSpaceUnits } from 'react-native-small-ui/theme';

const space = generateSpaceUnits(4);
// { '.25': 1, '.50': 2, '.75': 3, '1': 4, '2': 8, '3': 12, ..., '10': 40 }

const space8 = generateSpaceUnits(8, { maxAmount: 20, withNegatives: true });
// { '1': 8, '-1': -8, '2': 16, '-2': -16, ... }
```

Use the plain object approach when your scale is small and stable. Use `generateSpaceUnits` when you need a larger, mathematically consistent scale and want to avoid typing it by hand.

---

## Using with `createComponent`

```tsx
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { TouchableOpacity, Text } from 'react-native';
import type { AppTheme } from './theme';

// Create outside render
const Button = createComponent(TouchableOpacity, {
  borderRadius: 8,
  alignItems: 'center',
});

function ThemedButton({ children }: { children: React.ReactNode }) {
  const theme = useTheme() as AppTheme;

  return (
    <Button
      padding={16}
      _light={{ backgroundColor: theme.light.primary }}
      _dark={{ backgroundColor: theme.dark.primary }}
    >
      <Text>{children}</Text>
    </Button>
  );
}
```

---

## FAQ

### Do I need the theme system?

No. Hard-coded colors work fine with core-only:

```js
import { createComponent } from 'react-native-small-ui';

const Button = createComponent(TouchableOpacity, {
  backgroundColor: '#007AFF',
  _dark: { backgroundColor: '#0A84FF' },
});
```

### Can I use my own design token structure?

Yes — the store accepts any shape. Define whatever structure fits your design system:

```ts
registerTheme({
  colors: { brand: '#007AFF', danger: '#FF3B30' },
  radii: { sm: 4, md: 8, lg: 16 },
  fontSizes: { body: 16, heading: 24 },
});
```

### Does the theme enforce light/dark keys?

No. The shape is `unknown`. The `light`/`dark` convention shown in examples is just that — a convention. Store what works for your app.

---

## Next Steps

- [Color Utilities](/utilities/colors) - Color manipulation tools
- [Bundle Optimization](/guides/bundle-optimization) - Minimize bundle size
- [Hooks Reference](/utilities/hooks) - Full hooks reference
