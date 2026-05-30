# React Native Small UI

A utility-first toolkit for React Native that empowers developers to build styled components without the constraints of pre-built component libraries.

## TL;DR

This is a **utility toolkit**, NOT a component library. It gives you the tools to build React Native apps with platform-specific styling, dark mode, and responsive design - WITHOUT locking you into pre-built components or coupled theming systems.

## Project Philosophy

**react-native-small-ui** is NOT a traditional component library with opinionated, pre-styled UI components. Instead, it provides:

- **Utilities over Components**: Core utilities (hooks, helpers, theming) that YOU use to build YOUR components
- **Freedom from Constraints**: No locked-in component designs or tangled theming systems
- **Bring Your Own Components**: Use React Native's primitives or any library you prefer
- **Theming is Optional**: Theme system is completely decoupled - use it, customize it, or ignore it
- **Developer Control**: You decide how components look and behave

Inspired by NativeBase's API but fundamentally different: **utilities, not components**.

## Core Concept

Instead of importing pre-styled `<Button>` or `<Card>` components, you get the `createComponent` factory and utilities to build exactly what you need:

```typescript
// You control the design, not the library
const MyButton = createComponent(TouchableOpacity, {
  padding: 16,
  borderRadius: 8,
  _light: { backgroundColor: '#007AFF' },
  _dark: { backgroundColor: '#0A84FF' },
  _ios: { shadowOpacity: 0.2 },
  _android: { elevation: 4 },
});
```

The library provides the **mechanics** (theming, platform detection, color mode), you provide the **aesthetics**.

## Why This Approach?

Traditional React Native component libraries (NativeBase, React Native Paper, etc.) give you pre-built components with coupled theming:

- You're constrained by the library's design decisions
- Customization often requires fighting with the library's internals
- Theming is tightly coupled to components
- Hard to match your exact design requirements

**react-native-small-ui** takes a different approach:

- **You build** the components you need using `createComponent`
- **You control** every aspect of styling and behavior
- **You choose** whether to use theming, and how
- **You own** your design system, not the library

Think of it as **Tailwind CSS philosophy for React Native** - utilities over components.

## Core Architecture

### State Management

- **Zustand** for lightweight state management
- Separate stores for:
  - Theme configuration (`theme.store.tsx`)
  - Color mode state (`colorMode.store.tsx`)

### Type System

- Full TypeScript support with strict typing
- Pure TypeScript types — no runtime validation library
- Theme system is shape-agnostic: store any value, cast to your own type
- Autocomplete for style props including platform-specific variants

### Component System

The library provides **zero pre-built components** (except optional examples in `src/components/`). The main export is `createComponent`, a factory function that wraps ANY React Native component with enhanced styling capabilities:

**Platform-specific props:**

- `_ios`, `_android`, `_web`, `_native`

**Color mode props:**

- `_light`, `_dark`

**Direct style props:**

- All React Native style properties available as component props
- Full TypeScript autocompletion based on the wrapped component type

This means developers are NOT locked into using library components - they build their own design system using the utilities provided.

#### ⚠️ CRITICAL: createComponent Performance Pattern

**ALWAYS create components OUTSIDE the render cycle:**

```jsx
// ❌ WRONG - Creates new component type every render, breaks React reconciliation
function MyComponent() {
  const Button = createComponent(TouchableOpacity, { padding: 16 });
  return <Button />;
}

// ✅ CORRECT - Component created once, reused across renders
const Button = createComponent(TouchableOpacity, { padding: 16 });

function MyComponent() {
  return <Button />;
}

// ✅ CORRECT - Use props for dynamic styling
const Button = createComponent(TouchableOpacity, { borderRadius: 8 });

function MyComponent() {
  const theme = useTheme();
  return (
    <Button
      padding={theme.space?.[4]}
      backgroundColor={theme.colors.light.primary}
    />
  );
}
```

Creating components inside render functions causes:

- New component type on every render
- React cannot track component identity
- Forces unmount/remount instead of update
- Severe performance degradation
- Loss of state, refs, and animations

## Key Features

### 1. Theming System (Optional & Decoupled)

Location: `src/theme/`

The theming system is **completely optional**. You can use the library without it or integrate it as needed.

- **Shape-agnostic registry**: Store whatever your app needs — no enforced structure
- **Named theme slots**: `registerTheme('ocean', {...})` — register multiple themes
- **Runtime switching**: `setTheme(name)` — switch active theme programmatically
- **Theme access**: `useTheme()` (reactive hook) and `getTheme()` (outside React)
- **Active theme name**: `useThemeName()` — reactive hook for the current theme name

**Important**: No default theme colors are provided. The theme system is a typed registry — you define your tokens, the library stores and retrieves them.

### 2. Hooks

**Color Management:**

- `useColorMode()`: Access/control current color scheme
- `useColorModeValue(light, dark)`: Conditional values based on theme
- `setColorScheme()`: Programmatic theme switching
- `toggleColorScheme()`: Toggle between light/dark

**Responsive Design:**

- `useOrientation()`: Detect landscape/portrait
- `useMediaQuery(query)`: CSS-like media queries
- `useBreakPointValue(values)`: Responsive values across breakpoints (xs, sm, md, lg, xl, 2xl)

### 3. Utilities

**Color Utilities** (`ColorUtils`):

- `getHexAlpha(color, alpha)`: Add transparency to hex colors
- `getContrastColor(color)`: Get black or white contrast
- `getContrastMode(color)`: Determine if color is light/dark

**Helpers:**

- `getStatusBarStyle(bgColor)`: Returns `'light-content'` or `'dark-content'` based on background color contrast

### 4. Platform Support

- iOS (via React Native)
- Android (via React Native)
- Web (via React Native Web)
- Platform-specific style overrides built into component system

## Project Structure

```
src/
├── components/           # UI components (Button, Typography, etc.)
├── hooks/               # React hooks
│   ├── useColorMode/    # Color scheme management
│   ├── useTheme/        # Theme access and storage
│   ├── useOrientation/  # Device orientation
│   ├── useMediaQuery/   # Media query matching
│   └── useBreakPointValue/ # Responsive breakpoints
├── theme/               # Theme configuration and colors
│   └── colors/          # Color generation and presets
├── utils/               # Helper functions and utilities
├── smallUI.tsx          # Core component factory
└── index.tsx            # Public API exports
```

## Build System

- **Builder**: react-native-builder-bob
- **Outputs**: CommonJS, ES Modules, TypeScript definitions
- **Testing**: Jest with React Native preset
- **Linting**: ESLint with React Native config
- **Type Checking**: TypeScript 5.2+

## Modular Architecture & Bundle Optimization

The library uses a **modular import system** to ensure you only bundle what you use:

### Import Paths

```js
// Core utilities (~15KB) - ALWAYS needed
import { createComponent, configure } from 'react-native-small-ui';

// Color mode utilities (~18KB total)
import {
  useColorMode,
  setColorScheme,
  toggleColorScheme,
} from 'react-native-small-ui/colormode';

// Responsive utilities (~22KB total)
import {
  useBreakPointValue,
  useMediaQuery,
  useOrientation,
} from 'react-native-small-ui/utils';

// Theme system (~65KB total) - OPTIONAL
import {
  useTheme,
  registerTheme,
  ColorUtils,
} from 'react-native-small-ui/theme';

// Style presets — plain objects, spread into createComponent or StyleSheet
import { elevation, shadow, inset, text, layout, border } from 'react-native-small-ui/presets';

// Testing utilities — test-env only
import { renderWithSmallUI, assertStyles } from 'react-native-small-ui/testing';
```

### Bundle Size Breakdown

| Import Pattern   | Size (minified + gzipped) | What's Included                        |
| ---------------- | ------------------------- | -------------------------------------- |
| Core only        | ~15KB                     | createComponent, configure, zustand    |
| Core + ColorMode | ~18KB                     | + color mode hooks                     |
| Core + Utils     | ~22KB                     | + responsive utilities, css-mediaquery |
| Core + Theme     | ~65KB                      | + theme system, tinycolor              |
| Everything       | ~68KB                      | All features                           |
| /presets         | +0KB                      | Plain objects — zero runtime           |
| /testing         | dev only                  | Test utilities, peer dep on RNTL       |

**Key principle**: Start with core-only, add features as needed. Most apps don't need the full theme system.

### Tree-Shaking Best Practices

```js
// ✅ GOOD - Tree-shakeable, specific imports
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { useBreakPointValue } from 'react-native-small-ui/utils';

// ❌ LESS OPTIMAL - Imports everything
import {
  createComponent,
  useColorMode,
  useBreakPointValue,
} from 'react-native-small-ui';
```

## Dependencies

**Runtime (Core):**

- `zustand`: State management (~3KB)

**Runtime (Theme Package - Optional):**

- `@ctrl/tinycolor`: Color manipulation (~47KB)

**Runtime (Utils Package):**

- `css-mediaquery`: Media query parsing (~7KB)

**Peer Dependencies:**

- `react`
- `react-native`

## Development Workflow

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Type checking
yarn typecheck

# Linting
yarn lint

# Build library
yarn prepare

# Run example app
yarn example
```

## What This Library Is NOT

- **NOT a component library**: Does not ship pre-styled Button, Card, Input, etc.
- **NOT opinionated about design**: No enforced design system or visual style
- **NOT a constraint**: Theme system is optional, not required
- **NOT NativeBase**: Inspired by its API, but fundamentally different in purpose

## What This Library IS

- **A component factory**: `createComponent()` to enhance any React Native component
- **Styling utilities**: Platform-specific and color mode conditional styling
- **Theming utilities**: Optional theme system for color management
- **Responsive utilities**: Breakpoints, media queries, orientation detection
- **Type-safe**: Full TypeScript support with autocomplete for style props

## Public API (What Gets Exported)

### Core Utilities

- `createComponent(Component, styles)` - Factory for enhanced components
- `configure(config)` - Optional: set custom breakpoints (library auto-initializes on import)

### Theming

- `registerTheme(config)` - Register unnamed default theme
- `registerTheme(name, config)` - Register named theme slot (silent, does not switch)
- `setTheme(name)` - Switch active theme by name
- `useTheme()` - Reactive hook: access active theme value (returns `unknown`, cast to your type)
- `useTheme(selector)` - Reactive hook with selector for partial subscription
- `getTheme()` - Get active theme outside React
- `useThemeName()` - Reactive hook: returns active theme name
- `generateSpaceUnits(base, options?)` - Standalone spacing scale utility

### Color Mode

- `useColorMode()` - Get current color scheme
- `useColorModeValue(light, dark)` - Conditional values by theme
- `setColorScheme(mode)` - Set color scheme programmatically
- `toggleColorScheme()` - Toggle between light/dark

### Responsive Design

- `useOrientation()` - Detect device orientation
- `useMediaQuery(query)` - CSS-like media queries
- `useBreakPointValue(values)` - Responsive breakpoint values

### Utilities

- `ColorUtils.getHexAlpha(color, alpha)` - Add transparency
- `ColorUtils.getContrastColor(color)` - Get contrast color
- `ColorUtils.getContrastMode(color)` - Determine light/dark mode
- `getStatusBarStyle(bgColor)` - Returns `'light-content'` or `'dark-content'` based on background color contrast

### Optional Components (Examples, NOT Main Exports)

Located in `src/components/` but commented out in main exports:

- `Box`, `HStack`, `VStack`, `Center`, `Text` - Example primitives
- `Button`, `Typography` - Example components
- These serve as **reference implementations**, not library components

## Usage Pattern

```typescript
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { View, TouchableOpacity, Text } from 'react-native';

// 1. Library auto-initializes on import — no setup hook required.
//    Use configure() only if you need custom breakpoints:
//    configure({ breakPoints: { sm: 600, md: 900, lg: 1200 } });

// 2. Build YOUR components with YOUR design
// ⚠️ CRITICAL: Create components OUTSIDE render cycle
const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  _dark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  _ios: {
    shadowOpacity: 0.1,
  },
  _android: {
    elevation: 2,
  },
});

// 3. Optional: Use theme values via props (NOT in createComponent)
const Button = createComponent(TouchableOpacity, {
  padding: 12,
  borderRadius: 8,
});

type AppTheme = {
  light: { primary: string };
  dark: { primary: string };
};

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

// 4. Use props for dynamic styling (all styles available as props)
function MyScreen() {
  return (
    <Card marginTop={20} borderWidth={1}>
      <Text>Your content</Text>
    </Card>
  );
}
```

## Testing

- Jest configuration for React Native
- Test utilities from @testing-library/react-native
- Mocked zustand stores for isolated testing
- Coverage reporting (JSON + HTML)

## Publishing

- NPM registry: `react-native-small-ui`
- Release automation via release-it
- Conventional commits with commitlint
- Automatic changelog generation

## Documentation Standards

### Critical Patterns to Follow

When writing documentation or examples, ALWAYS adhere to these patterns:

1. **createComponent Outside Render Cycle**
   - ✅ Create components at module level or outside function components
   - ❌ NEVER create components inside function components
   - Use props for dynamic styling, not component recreation

2. **Modular Import Paths**
   - ✅ Use specific import paths: `/theme`, `/utils`, `/colormode`
   - ❌ Avoid importing everything from core package
   - Document bundle size impact for each import

3. **Theme System Optional**
   - Always indicate theme features are optional
   - Show both themed and non-themed alternatives
   - Don't make theme usage seem required

### Documentation Validation

Use the automated tools to ensure consistency:

```bash
# Validate documentation matches exports
node scripts/validate-docs.js

# Update docs after API changes
/update-docs (Claude Code slash command)
```

**CI Validation**: GitHub Actions runs `validate-docs.js` on every PR touching `src/` or `docs/` to ensure documentation stays in sync with code.

## Known Limitations

- Expo users need to configure `userInterfaceStyle: "automatic"` in app.json
- iOS apps need `UIUserInterfaceStyle` set to `Automatic` in Info.plist for color mode detection

## License

MIT - Ezequiel Benitez

## Repository

https://github.com/emb715/react-native-small-ui
