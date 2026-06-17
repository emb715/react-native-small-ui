---
title: Bundle Optimization
description: Learn how to minimize your bundle size with modular imports
---

React Native Small UI uses a modular architecture that allows you to import only what you need, keeping your app lean and performant.

## Modular Import System

Instead of bundling everything together, the library is split into focused modules:

- **Core** (`react-native-small-ui`) - Essential utilities
- **Theme** (`react-native-small-ui/theme`) - Theming system
- **Utils** (`react-native-small-ui/utils`) - Responsive utilities
- **ColorMode** (`react-native-small-ui/colormode`) - Color mode management

## Bundle Size Breakdown

| Import Pattern | Size (minified + gzipped) | What's Included |
|---------------|---------------------------|-----------------|
| Core only | ~5.7 KB | createComponent, zustand |
| Core + ColorMode | ~5.8 KB | + color mode hooks |
| Core + Utils | ~6.0 KB | + responsive utilities |
| Core + Theme | ~6.2 KB | + theme registry, ColorUtils |
| Everything | ~6.6 KB | All features |

:::tip
Start with core-only and add features as needed. Most apps don't need the full theme system.
:::

## Import Strategies

### Strategy 1: Core Only (Minimal)

Best for: Apps with custom design systems or minimal styling needs.

```js
import { createComponent } from 'react-native-small-ui';
```

**Bundle impact:** ~5.7 KB

**What you get:**
- Component factory (`createComponent`)
- Platform-specific styling (`_ios`, `_android`, `_web`)
- Color mode styling (`_light`, `_dark`)
- Inline style props
- TypeScript autocomplete

**What you don't need:**
- Programmatic theme switching
- Responsive breakpoints
- Semantic color tokens
- Theme generation

```jsx
// Example: Core-only usage
import { createComponent } from 'react-native-small-ui';
import { View, TouchableOpacity } from 'react-native';

const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
});

const Button = createComponent(TouchableOpacity, {
  padding: 12,
  backgroundColor: '#007AFF',
  _ios: { shadowOpacity: 0.2 },
  _android: { elevation: 4 },
});
```

---

### Strategy 2: Core + ColorMode

Best for: Apps that need theme switching without a full theme system.

```js
import { createComponent } from 'react-native-small-ui';
import { useColorMode, toggleColorScheme } from 'react-native-small-ui/colormode';
```

**Bundle impact:** ~5.8 KB (+ ~0.1 KB)

**Added features:**
- `useColorMode()` - Get current color scheme
- `setColorScheme()` - Set theme programmatically
- `toggleColorScheme()` - Toggle light/dark
- `useColorModeValue()` - Conditional values by theme

```jsx
// Example: With color mode control
import { createComponent } from 'react-native-small-ui';
import { useColorMode, toggleColorScheme } from 'react-native-small-ui/colormode';

function ThemeToggle() {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={toggleColorScheme}>
      <Text>Mode: {colorMode}</Text>
    </TouchableOpacity>
  );
}
```

---

### Strategy 3: Core + Utils

Best for: Responsive apps that need breakpoints and media queries.

```js
import { createComponent } from 'react-native-small-ui';
import { useBreakPointValue, useMediaQuery, useOrientation } from 'react-native-small-ui/utils';
```

**Bundle impact:** ~6.0 KB

**Added features:**
- `useBreakPointValue()` - Responsive values
- `useMediaQuery()` - CSS media queries
- `useOrientation()` - Device orientation

```jsx
// Example: Responsive layouts
import { createComponent } from 'react-native-small-ui';
import { useBreakPointValue } from 'react-native-small-ui/utils';
import { View } from 'react-native';

// Create component outside render
const Container = createComponent(View, {});

function ResponsiveContainer() {
  const padding = useBreakPointValue({
    default: 8,
    md: 16,
    lg: 24,
  });

  return <Container padding={padding}>{/* content */}</Container>;
}
```

---

### Strategy 4: Core + Theme (Full Features)

Best for: Apps using design systems with semantic colors and tokens.

```js
import { createComponent } from 'react-native-small-ui';
import { useTheme, registerTheme, ColorUtils } from 'react-native-small-ui/theme';
```

**Bundle impact:** ~6.2 KB (+ color utilities, no external deps)

**Added features:**
- `useTheme()` - Access theme values
- `registerTheme()` - Custom theme registration
- `ColorUtils` - Color manipulation utilities
- Semantic color tokens (primary, secondary, etc.)
- Color palette generation
- Spacing units

```jsx
// Example: Full theme system
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { TouchableOpacity } from 'react-native';

// Create component outside render
const Button = createComponent(TouchableOpacity, {});

function ThemedButton() {
  const theme = useTheme();

  return (
    <Button
      padding={theme.space?.[4]}
      _light={{ backgroundColor: theme.colors.light.primary }}
      _dark={{ backgroundColor: theme.colors.dark.primary }}
    >
      {/* content */}
    </Button>
  );
}
```

---

## Combining Modules

You can mix and match modules based on your needs:

### Core + ColorMode + Utils (No Theme)

Perfect for responsive apps with theme switching but custom colors.

```js
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

**Bundle impact:** ~6.1 KB

---

### Everything (Design System Apps)

For apps that need all features.

```js
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { useBreakPointValue } from 'react-native-small-ui/utils';
import { useTheme } from 'react-native-small-ui/theme';
```

**Bundle impact:** ~6.6 KB

---

## Tree-Shaking

The modular import structure enables tree-shaking to work effectively:

### ✅ Good (Tree-shakeable)

```js
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
```

Only bundles core + theme. Utils and unused theme features are excluded.

### ❌ Less Optimal (Still works)

```js
// Pulling hooks from the core package bypasses tree-shaking.
// Use the dedicated subpath imports shown above instead.
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

The first import is correct. The issue is importing hooks that belong to subpath packages (`/theme`, `/utils`, `/colormode`) via the core package — bundlers cannot tree-shake across the package boundary.

---

## Measuring Your Bundle

### Metro Bundler (React Native)

Check bundle size in your app:

```bash
# Build production bundle
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output bundle.js

# Check size
ls -lh bundle.js
```

### Analyzing Dependencies

Use `source-map-explorer` to analyze what's in your bundle:

```bash
npm install -g source-map-explorer

# Generate source map
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output bundle.js \
  --sourcemap-output bundle.map

# Analyze
source-map-explorer bundle.js bundle.map
```

---

## Best Practices

### 1. Start Minimal

Begin with core-only and add features as needed:

```js
// Week 1: Core only
import { createComponent } from 'react-native-small-ui';

// Week 2: Add theme switching
import { useColorMode } from 'react-native-small-ui/colormode';

// Week 3: Add responsive features
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

### 2. Use Specific Imports

Always import from the specific path:

```js
// ✅ Good — use the dedicated subpath
import { useColorMode } from 'react-native-small-ui/colormode';

// ❌ Less optimal — core package re-exports everything, bypasses subpath tree-shaking
// import { useColorMode } from 'react-native-small-ui';
```

### 3. Lazy Load Heavy Features

If you only need the theme system in certain screens:

```js
// Only load theme when needed
const ThemeSettings = lazy(() => import('./screens/ThemeSettings'));
```

### 4. ColorUtils has no external dependencies

`ColorUtils` is implemented with pure math — no external color library. There is nothing to swap out. The entire library including the theme package is ~6.6 KB gzipped.

---

## Comparison with Other Libraries

| Library | Minimal Size | With Theme |
|---------|-------------|------------|
| **react-native-small-ui** | ~5.7 KB | ~6.2 KB |
| NativeBase | ~180KB | ~180KB |
| React Native Paper | ~150KB | ~150KB |
| React Native Elements | ~90KB | ~90KB |

:::tip[Key Advantage]
The entire library — every feature included — is ~6.6 KB gzipped. Other libraries bundle everything regardless of usage and start at 90 KB+.
:::

---

## FAQ

### Why is the theme package only slightly larger than core?

The theme package adds a shape-agnostic registry (`registerTheme`, `setTheme`, `useTheme`) and `ColorUtils` — all implemented with pure math and no external dependencies. The incremental cost over core is ~0.5 KB gzipped.

The theme system has no enforced schema or default tokens. You define your token shape; the library stores and retrieves it.

### Can I use my own theme system?

Absolutely! The core package is designed to work independently:

```js
import { createComponent } from 'react-native-small-ui';
import { myCustomTheme } from './theme';

const Button = createComponent(TouchableOpacity, {
  backgroundColor: myCustomTheme.colors.primary,
});
```

### Does this affect performance?

No. Bundle size only impacts initial load time. Runtime performance is identical regardless of which modules you import.

### Should I use the theme package?

**Use theme if:**
- You need semantic color tokens
- You want automatic palette generation
- You're building a design system
- You need color manipulation utilities

**Skip theme if:**
- You have fixed color values
- Bundle size is critical (< 50KB target)
- You're using an external design system

---

## Next Steps

- [Getting Started](/getting-started) - Quick start guide
- [Theming Guide](/guides/theming) - Learn about the theme system
- [Hooks Reference](/utilities/hooks) - All available hooks
