---
name: react-native-small-ui
description: Wraps React Native primitives with createComponent to add platform conditionals, color mode, and responsive breakpoints. Activates when using createComponent, useColorMode, useBreakPointValue, useTheme, useMediaQuery, or building with react-native-small-ui.
---

# react-native-small-ui

## Import paths

```ts
import { createComponent, createComponentGroup,
         configure, cs, getStatusBarStyle }   from 'react-native-small-ui';
import { useColorMode, useColorModeValue,
         setColorScheme, toggleColorScheme }  from 'react-native-small-ui/colormode';
import { useBreakPointValue, useMediaQuery,
         useOrientation }                     from 'react-native-small-ui/utils';
import { useTheme, getTheme, registerTheme,
         setTheme, useThemeName, ColorUtils } from 'react-native-small-ui/theme';
import { elevation, shadow, inset,
         text, layout, border }               from 'react-native-small-ui/presets';
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
| `_<key>` (custom) | Registered platform predicate or custom color mode |
| Any RN style prop | Always |

### Extending

```tsx
const Base  = createComponent(View, { borderRadius: 8 });
const Card  = Base.extend({ padding: 16, _dark: { backgroundColor: '#111' } });
// ✗ — Base.extend() inside a component — same rule as createComponent
```

### Variants

See [refs/variants.md](refs/variants.md) for full variant + compound variant examples.

### `createComponentGroup` with variants — `base:` required

When a group member uses `variants`, flat style props **must** go inside `base:`.
The library detects `'variants' in style` and treats the whole object as `ComponentConfig` —
any flat props at the root are silently dropped.

```tsx
// ✗ — flat props + variants at the same level; base styles lost silently
FormInput: {
  Component: TextInput,
  style: { borderWidth: 1, fontSize: 14, variants: { status: { ... } } },
}

// ✓ — flat props in base:, variants alongside
FormInput: {
  Component: TextInput,
  style: {
    base: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, fontSize: 14 },
    variants: { status: { idle: { ... }, error: { ... }, success: { ... } } },
    defaultVariants: { status: 'idle' },
  },
}
```

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
import { useColorMode, useColorModeValue, setColorScheme } from 'react-native-small-ui/colormode';

const { colorMode, isDark } = useColorMode();
const bg = useColorModeValue('#fff', '#000');
setColorScheme('dark'); toggleColorScheme();
```

## Responsive

```tsx
import { useBreakPointValue, useMediaQuery, useOrientation } from 'react-native-small-ui/utils';

const padding = useBreakPointValue({ default: 8, sm: 12, md: 16, lg: 24 });
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

See [refs/theming.md](refs/theming.md) for named themes, selectors, and `getTheme()`.

## Presets

```tsx
import { elevation, shadow, inset, layout, border } from 'react-native-small-ui/presets';

const Card = createComponent(View, { ...elevation.md, borderRadius: 8 });
const Row  = createComponent(View, { ...layout.row });
```

See [refs/presets.md](refs/presets.md) for all available keys.

## Utilities

```tsx
import { cs, getStatusBarStyle } from 'react-native-small-ui';

const style = cs(base, isActive && { backgroundColor: '#007AFF' }, disabled && { opacity: 0.5 });
const barStyle = getStatusBarStyle('#8b59a0'); // → 'light-content' or 'dark-content'
```
