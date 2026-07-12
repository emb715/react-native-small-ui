---
title: Helpers
---

Utility functions exported from the core package — no heavy dependencies.

```js
import {
  getStatusBarStyle,
  cs,
  getResolvedStyles,
} from 'react-native-small-ui';
```

---

## `getStatusBarStyle`

Returns `'light-content'` or `'dark-content'` based on the background color's contrast. Pass any hex color and get the correct status bar style for legibility.

```ts
import { getStatusBarStyle } from 'react-native-small-ui';
import { StatusBar } from 'react-native';

const barStyle = getStatusBarStyle('#8b59a0'); // 'light-content'
const barStyle2 = getStatusBarStyle('#fdfbfd'); // 'dark-content'

<StatusBar barStyle={getStatusBarStyle(backgroundColor)} />
```

[React Native status bar style reference](https://reactnative.dev/docs/statusbar#statusbarstyle)

---

## `cs()`

Merges multiple style objects into one, filtering out falsy values. Last-write-wins on key conflicts. The React Native equivalent of `cn()` from the web ecosystem.

Works with any plain object — including `_light`, `_dark`, and custom platform props.

```ts
import { cs } from 'react-native-small-ui';

// Merge base + conditional styles
const style = cs(
  { padding: 8, borderRadius: 4 },
  isActive && { borderColor: '#007AFF', borderWidth: 2 },
  isDisabled && { opacity: 0.5 }
);

// Works with underscore props
const extendedStyle = cs(baseStyles, {
  _light: { color: '#000' },
  _dark: { color: '#fff' },
});

// Multiple arguments — last wins on conflict
const merged = cs(
  { padding: 8 },
  { padding: 16, margin: 4 } // padding: 16 wins
);
// => { padding: 16, margin: 4 }
```

**Falsy values filtered:** `false`, `null`, `undefined`, `0`, `''` — all safely ignored.

```ts
// All of these are valid — falsy args are skipped entirely
cs({ padding: 8 }, false, null, undefined, 0, '', { margin: 4 });
// => { padding: 8, margin: 4 }
```

---

## `getResolvedStyles()`

Pure-function style resolver — returns the fully resolved flat style object for a given style definition and context, **without rendering anything**.

Useful for:

- **Testing** — assert exact styles without a renderer
- **Design handoff** — export resolved styles per platform/mode
- **Tooling** — inspect what a component would produce under specific conditions

```ts
import { getResolvedStyles } from 'react-native-small-ui';
```

### Static style object

```ts
const result = getResolvedStyles({ padding: 16, borderRadius: 8 });
// => { padding: 16, borderRadius: 8 }
```

### Ctx factory function

```ts
const styleDef = (ctx) => ({
  padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
  backgroundColor: ctx.colorMode === 'dark' ? '#1a1a1a' : '#fff',
});

// Resolve at md breakpoint in dark mode
const result = getResolvedStyles(styleDef, {
  colorMode: 'dark',
  breakpointWidth: 800, // matches md (768px+)
});
// => { padding: 16, backgroundColor: '#1a1a1a' }

// Resolve at default breakpoint in light mode
const result2 = getResolvedStyles(styleDef);
// => { padding: 8, backgroundColor: '#fff' } (defaults: light, width 0)
```

### Options

| Option            | Type                     | Default          | Description                                      |
| ----------------- | ------------------------ | ---------------- | ------------------------------------------------ |
| `colorMode`       | `'light' \| 'dark'`      | `'light'`        | Color mode to resolve against                    |
| `breakpointWidth` | `number`                 | `0`              | Screen width in pixels for breakpoint resolution |
| `breakpoints`     | `Record<string, number>` | library defaults | Custom breakpoint map                            |

### Usage in tests

```ts
import { getResolvedStyles } from 'react-native-small-ui';

const cardStyle = (ctx) => ({
  padding: ctx.breakpoint({ default: 8, md: 16 }),
  backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
});

test('card uses md padding at 768px', () => {
  const styles = getResolvedStyles(cardStyle, { breakpointWidth: 768 });
  expect(styles.padding).toBe(16);
});

test('card has dark background in dark mode', () => {
  const styles = getResolvedStyles(cardStyle, { colorMode: 'dark' });
  expect(styles.backgroundColor).toBe('#000');
});
```
