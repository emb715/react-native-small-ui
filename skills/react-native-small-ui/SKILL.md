---
name: react-native-small-ui
description: Wraps React Native primitives with createComponent to add platform conditionals, color mode, and responsive breakpoints. Activates when using createComponent, createPressable, useColorMode, useBreakpointValue, useTheme, useMediaQuery, or building with react-native-small-ui.
sources:
  - CLAUDE.md
  - src/index.tsx
  - src/colormode.tsx
  - src/utils-exports.tsx
  - src/theme-exports.tsx
  - src/hooks/useBreakPointValue/useBreakPointValue.tsx
---

# react-native-small-ui

## Import paths

```ts
import { createComponent, createComponentGroup,
         createPressable, configure,
         cs, getResolvedStyles } from 'react-native-small-ui';
import { useColorMode, useColorModeValue,
         setColorScheme, toggleColorScheme,
         setCustomColorMode, clearCustomColorMode,
         useCustomColorMode }                       from 'react-native-small-ui/colormode';
import { useBreakpointValue, useMediaQuery,
         useOrientation }                           from 'react-native-small-ui/utils';
import { useTheme, getTheme, registerTheme,
         setTheme, useThemeName,
         generateSpaceUnits, ColorUtils,
         getStatusBarStyle }                        from 'react-native-small-ui/theme';
import { elevation, shadow, inset,
         text, layout, border }                    from 'react-native-small-ui/presets';
```

See [refs/imports.md](refs/imports.md) for full export table including types.

## createComponent

```tsx
// Static — module scope always
const Card = createComponent(View, {
  padding: 16, borderRadius: 8,
  _light: { backgroundColor: '#fff' },
  _dark:  { backgroundColor: '#1a1a1a' },
  _ios:   { shadowOpacity: 0.1 },
  _android: { elevation: 2 },
});
```

```tsx
// ✗ — new component type every render, state/refs/animations destroyed
function Screen() { const B = createComponent(TouchableOpacity, { p: 12 }); return <B />; }
// ✓ — module scope; use props for runtime values
const Button = createComponent(TouchableOpacity, { padding: 12 });
function Screen() { return <Button opacity={isDisabled ? 0.5 : 1} />; }
```

### Style props

| Prop | When applied |
|---|---|
| `_light` / `_dark` | Current OS/app color scheme |
| `_ios` / `_android` / `_web` / `_native` | Platform |
| `_pressed` / `_hovered` | Interactive state — **createPressable only** |
| `_<key>` (custom) | Registered platform predicate or custom color mode |
| Any RN style prop | Always |

### ctx factory function

Pass a function instead of a style object to access `ctx.colorMode` and `ctx.breakpoint()` inline:

```tsx
const Card = createComponent(View, (ctx) => ({
  padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }) ?? 8,
  backgroundColor: ctx.colorMode === 'dark' ? '#1a1a1a' : '#fff',
}));
```

`ctx.breakpoint()` subscribes only to the breakpoints the function actually reads — zero cost for unused ones.

### `base:` rule — variants alongside flat props

When `variants` is present in the config, **all flat style props must go inside `base:`**. Flat props at the config root are silently dropped when the library detects a `variants` key.

```tsx
// ✗ — fontSize and _light/_dark at root alongside variants — silently dropped
createComponent(TextInput, { fontSize: 16, _light: { color: '#000' }, variants: { ... } });

// ✓ — flat props in base:
createComponent(TextInput, {
  base: { fontSize: 16, _light: { color: '#000' }, _dark: { color: '#fff' } },
  variants: { status: { default: { ... }, error: { ... } } },
  defaultVariants: { status: 'default' },
});
```

This rule applies to `createComponent`, `createComponentGroup` members, and `createPressable`.

### Extending

```tsx
const Base  = createComponent(View, { borderRadius: 8 });
const Card  = Base.extend({ padding: 16, _dark: { backgroundColor: '#111' } });
// ✗ — Base.extend() inside a component — same rule as createComponent
```

### Variants

See [refs/variants.md](refs/variants.md) for full variant + compound variant examples.

## createPressable

Wraps `Pressable` with the full `createComponent` feature set plus `_pressed` and `_hovered` interactive state styles. Use instead of `createComponent(Pressable, ...)` — `Pressable.style` accepts a function that `createComponent` cannot intercept.

```tsx
import { createPressable } from 'react-native-small-ui';

// Module scope — same rule as createComponent
const Button = createPressable({
  base: {
    padding: 12, borderRadius: 8, alignItems: 'center',
    _light: { backgroundColor: '#8b59a0' },
    _dark:  { backgroundColor: '#a070b8' },
  },
  _pressed: { opacity: 0.8 },
  _hovered: {
    // _hovered fires on web via onHoverIn/onHoverOut — no-op on iOS/Android
    _web: { opacity: 0.92, cursor: 'pointer' } as any,
  },
});
```

Style resolution order: `base → variants → compoundVariants → direct props → _pressed → _hovered`

All `createComponent` features work: variants, `.extend()`, `.withSlots()`, `.withVariantContext()`, ctx factory. All `Pressable` props (`onPress`, `disabled`, `hitSlop`, `android_ripple`) pass through unchanged.

## Compound components with variant propagation

**Route here when:** slot styling depends on the parent's active variant.

`.withSlots()` attaches sub-components as dot-notation properties.
`.withVariantContext(...keys)` propagates parent variant values to slots via React context — explicit slot props always win.
**Both are methods on the SmallUIComponent output, not imports.**

```tsx
const ButtonText = createComponent(Text, {
  variants: { intent: { primary: { color: '#fff' }, ghost: { color: '#007AFF' } } },
  defaultVariants: { intent: 'primary' },
});

const Button = createComponent(TouchableOpacity, {
  base: { borderRadius: 8, alignItems: 'center' as const },
  variants: {
    intent: {
      primary: { _light: { backgroundColor: '#007AFF' }, _dark: { backgroundColor: '#0A84FF' } },
      ghost:   { backgroundColor: 'transparent' },
    },
  },
  defaultVariants: { intent: 'primary' },
})
  .withSlots({ Text: ButtonText })  // attach slots first
  .withVariantContext('intent');    // then propagate — order matters

<Button intent="ghost"><Button.Text>Cancel</Button.Text></Button>
```

## Color mode

```tsx
import { useColorMode, useColorModeValue, setColorScheme,
         setCustomColorMode, clearCustomColorMode } from 'react-native-small-ui/colormode';

const { colorMode, isDark } = useColorMode();
const bg = useColorModeValue('#fff', '#000');
setColorScheme('dark'); toggleColorScheme();

// Custom app-managed modes (register first via configure({ colorModes: { sepia: true } }))
setCustomColorMode('sepia');   // activates _sepia style props
clearCustomColorMode();        // returns to OS light/dark
```

## Responsive

```tsx
import { useBreakpointValue, useMediaQuery, useOrientation } from 'react-native-small-ui/utils';

const padding = useBreakpointValue({ default: 8, sm: 12, md: 16, lg: 24 });
const isWide = useMediaQuery('(min-width: 768px)');
const orientation = useOrientation();
```

Breakpoints (largest match wins): `2xl` 1536 · `xl` 1280 · `lg` 1024 · `md` 768 · `sm` 640 · `xs` 480 · `default` 0

See [refs/responsive.md](refs/responsive.md) for breakpoint customisation and media query syntax.

## Theming (optional)

```tsx
import { registerTheme, useTheme } from 'react-native-small-ui/theme';

type AppTheme = { light: { primary: string }; dark: { primary: string } };
registerTheme({ light: { primary: '#007AFF' }, dark: { primary: '#0A84FF' } });

function ThemedButton() {
  const theme = useTheme() as AppTheme; // returns unknown — always cast
  return <Button _light={{ backgroundColor: theme.light.primary }}
                 _dark={{ backgroundColor: theme.dark.primary }} />;
}
```

See [refs/theming.md](refs/theming.md) for named themes, selectors, `getTheme()`, and `ColorUtils`.

## Presets

```tsx
import { elevation, shadow, inset, layout, border } from 'react-native-small-ui/presets';

const Card = createComponent(View, { ...elevation.md, borderRadius: 8 });
const Row  = createComponent(View, { ...layout.row });
```

See [refs/presets.md](refs/presets.md) for all available keys.

## Utilities

```tsx
import { cs, getResolvedStyles } from 'react-native-small-ui';
import { getStatusBarStyle } from 'react-native-small-ui/theme';

// cs — merge style objects, falsy-safe, last-write-wins
const style = cs(base, isActive && { backgroundColor: '#007AFF' }, disabled && { opacity: 0.5 });

// getStatusBarStyle — 'light-content' or 'dark-content' from background color
const barStyle = getStatusBarStyle('#8b59a0');

// getResolvedStyles — pure style resolver, no render needed (testing/tooling)
const resolved = getResolvedStyles(styleDef, { colorMode: 'dark', breakpointWidth: 800 });
```
