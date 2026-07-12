---
title: Platform & Color Mode Registry
description: Extend createComponent with custom platforms and app-managed color modes
---

The library's built-in `_ios`, `_android`, `_web`, `_native` props cover OS-level platforms, and `_light`/`_dark` cover OS-level color modes. The registry system lets you **extend both** with your own runtime conditions — without modifying the library.

---

## Pluggable Platform Registry

Register custom platform predicates via `configure()`. Each key becomes a valid `_<key>` style prop on **all** `createComponent` outputs.

### Setup

```ts
import { configure } from 'react-native-small-ui';
import { Dimensions, Platform } from 'react-native';

configure({
  platforms: {
    // Evaluates at render time — true means apply _tablet styles
    tablet: () => Dimensions.get('window').width >= 768,
    tv: () => Platform.isTV,
    largeScreen: () => Dimensions.get('window').width >= 1024,
  },
});
```

Call `configure()` once at app startup, before any component renders.

### Usage

```tsx
import { createComponent } from 'react-native-small-ui';
import { View, Text } from 'react-native';

const Layout = createComponent(View, {
  padding: 12,
  _tablet: { padding: 24, maxWidth: 800, alignSelf: 'center' },
  _tv: { padding: 48 },
  _largeScreen: { flexDirection: 'row' },
});

const Card = createComponent(View, {
  borderRadius: 8,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
  // Custom platforms compose with built-in ones
  _tablet: { borderRadius: 12, margin: 8 },
});
```

Custom platform styles are merged **after** built-in platform styles, so they can override `_ios`, `_android`, etc. when needed.

### Predicate behavior

Predicates are evaluated **synchronously at render time**. Keep them cheap — avoid async operations or heavy computation:

```ts
// ✅ Good — cheap synchronous reads
configure({
  platforms: {
    tablet: () => Dimensions.get('window').width >= 768,
    rtl: () => I18nManager.isRTL,
    tv: () => Platform.isTV,
  },
});

// ❌ Avoid — async or expensive operations
configure({
  platforms: {
    premium: async () => await checkSubscription(), // won't work — must be sync
  },
});
```

For values that change at runtime (like screen width on resize), use a Zustand store or React state to derive the predicate's return value, and update it via an event listener:

```ts
import { Dimensions } from 'react-native';
import { create } from 'zustand';

const useWindowStore = create(() => ({
  width: Dimensions.get('window').width,
}));

Dimensions.addEventListener('change', ({ window }) => {
  useWindowStore.setState({ width: window.width });
});

configure({
  platforms: {
    // Reading from Zustand store — reactive to dimension changes
    tablet: () => useWindowStore.getState().width >= 768,
  },
});
```

---

## Extended Color Mode Registry

Custom color modes let you add **app-managed** visual modes (high contrast, sepia, dim, etc.) that layer on top of the OS light/dark system. Unlike platforms, custom color modes are toggled programmatically — only one can be active at a time.

### Setup

```ts
import { configure } from 'react-native-small-ui';

configure({
  colorModes: {
    highContrast: true,
    sepia: true,
    dim: true,
  },
});
```

The value `true` simply registers the key — the actual activation is controlled separately.

### Activating a mode

```ts
import {
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';

setCustomColorMode('highContrast'); // activate
setCustomColorMode('sepia'); // switch to sepia (replaces highContrast)
clearCustomColorMode(); // return to OS-driven light/dark only
```

### Usage in components

```tsx
import { createComponent } from 'react-native-small-ui';
import { View, Text } from 'react-native';

const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  // Built-in OS color modes
  _light: { backgroundColor: '#fff', borderColor: '#e5e5e5' },
  _dark: { backgroundColor: '#1a1a1a', borderColor: '#333' },
  // Custom app-managed modes — layer on top
  _highContrast: {
    backgroundColor: '#000',
    borderColor: '#fff',
    borderWidth: 2,
  },
  _sepia: { backgroundColor: '#f4e4c1', borderColor: '#c9a96e' },
  _dim: { opacity: 0.7 },
});

const BodyText = createComponent(Text, {
  fontSize: 16,
  _light: { color: '#1c1c1e' },
  _dark: { color: '#fafafa' },
  _highContrast: { color: '#fff', fontWeight: '700' },
  _sepia: { color: '#5c4033' },
});
```

Custom mode styles are merged **after** all other styles (base, platform, light/dark), so they can override anything.

### Reactive hook

```tsx
import {
  useCustomColorMode,
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text, View } from 'react-native';

function AccessibilitySettings() {
  const { activeMode } = useCustomColorMode();

  return (
    <View>
      <Text>Current mode: {activeMode ?? 'default'}</Text>

      <TouchableOpacity onPress={() => setCustomColorMode('highContrast')}>
        <Text>High Contrast {activeMode === 'highContrast' ? '✓' : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCustomColorMode('sepia')}>
        <Text>Sepia {activeMode === 'sepia' ? '✓' : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearCustomColorMode}>
        <Text>Default</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Unregistered keys are silently ignored

If `setCustomColorMode('unknown')` is called for a key not in `colorModes`, no style is applied. This prevents accidental typos from producing incorrect styles.

---

## Combining Both

Platform registry and color mode registry compose cleanly:

```tsx
configure({
  platforms: { tablet: () => Dimensions.get('window').width >= 768 },
  colorModes: { highContrast: true },
});

const Card = createComponent(View, {
  padding: 12,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
  _tablet: { padding: 24 }, // platform
  _highContrast: { borderWidth: 2, borderColor: '#fff' }, // custom color mode
  // All four can be active simultaneously — all styles merge
});
```

Style merge order (later wins):

1. Base styles
2. Variant styles
3. Built-in light/dark color mode
4. Built-in platform (`_ios`, `_android`, `_web`, `_native`)
5. Custom platform registry (`_tablet`, `_tv`, …)
6. Custom color mode registry (`_highContrast`, `_sepia`, …)

---

## API Summary

### `configure({ platforms })`

```ts
import { configure } from 'react-native-small-ui';
import type { PlatformRegistry } from 'react-native-small-ui';

configure({
  platforms: {
    [key: string]: () => boolean  // predicate evaluated at render time
  }
});
```

### `configure({ colorModes })`

```ts
configure({
  colorModes: {
    [key: string]: true  // registration only — activate via setCustomColorMode()
  }
});
```

### Color mode functions

| Function                  | Import                            | Description                                              |
| ------------------------- | --------------------------------- | -------------------------------------------------------- |
| `setCustomColorMode(key)` | `react-native-small-ui/colormode` | Activate a registered custom mode                        |
| `clearCustomColorMode()`  | `react-native-small-ui/colormode` | Clear active custom mode                                 |
| `useCustomColorMode()`    | `react-native-small-ui/colormode` | Reactive hook returning `{ activeMode: string \| null }` |
