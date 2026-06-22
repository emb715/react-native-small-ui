---
title: RTL Support
description: Right-to-left layout with custom platform predicates
sidebar:
  order: 7
---

React Native has first-class RTL support via `I18nManager` and the `start`/`end` layout properties. `react-native-small-ui` has no built-in `_rtl` prop, but you can register one in seconds via the platform predicate registry.

## Setup

```ts
import { configure } from 'react-native-small-ui';
import { I18nManager } from 'react-native';

configure({
  platforms: {
    rtl: () => I18nManager.isRTL,
  },
});
```

Call `configure()` once at app startup before any component renders.

## Usage

`_rtl` is now a valid style prop on every `createComponent` output:

```tsx
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

const Row = createComponent(View, {
  flexDirection: 'row',
  paddingHorizontal: 16,
  _rtl: {
    flexDirection: 'row-reverse',
  },
});

const Icon = createComponent(View, {
  marginRight: 8,
  _rtl: {
    marginRight: 0,
    marginLeft: 8,
  },
});
```

## Use `start`/`end` when possible

React Native's `start`/`end` logical properties flip automatically with RTL — no predicate needed:

```tsx
// ✅ Preferred — flips automatically
const Card = createComponent(View, {
  paddingStart: 16,
  paddingEnd: 16,
  marginStart: 8,
});

// Also works for absolute positioning
const Badge = createComponent(View, {
  position: 'absolute',
  end: 8,
  top: 8,
});
```

Use `_rtl` for cases that `start`/`end` can't express — `flexDirection`, `textAlign`, icon margins, custom transforms.

## Composing with color mode

`_rtl` composes with `_light`/`_dark` — all underscore props merge:

```tsx
const Sidebar = createComponent(View, {
  width: 240,
  _light: { backgroundColor: '#f5f5f5', borderRightWidth: 1, borderColor: '#e5e5e5' },
  _dark:  { backgroundColor: '#1a1a1a', borderRightWidth: 1, borderColor: '#2a2a2a' },
  _rtl: {
    borderRightWidth: 0,
    borderLeftWidth: 1,
  },
});
```

## Notes

- `I18nManager.isRTL` is set at app launch by the OS. It does not change at runtime without a restart.
- The predicate is evaluated synchronously at render time — calling `I18nManager.isRTL` is a cheap synchronous read.
- For dynamic RTL switching (rare, usually unnecessary), drive `I18nManager.forceRTL()` and restart the app.
