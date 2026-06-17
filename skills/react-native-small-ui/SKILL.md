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
import { createComponent } from 'react-native-small-ui';
import { View, TouchableOpacity } from 'react-native';

// Static styles
const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: { backgroundColor: '#fff' },
  _dark:  { backgroundColor: '#1a1a1a' },
  _ios:   { shadowOpacity: 0.1 },
  _android: { elevation: 2 },
});

<Card marginTop={20} />
```

```tsx
// ✗ — inside a render function, React unmounts and remounts every render, destroying state, refs, and animations
function Screen() {
  const Button = createComponent(TouchableOpacity, { padding: 12 });
  return <Button />;
}
// ✓ — module scope; use props for values that change at runtime
const Button = createComponent(TouchableOpacity, { padding: 12 });
function Screen() {
  return <Button opacity={isDisabled ? 0.5 : 1} />;
}
```

### Style props

| Prop | When applied |
|---|---|
| `_light` / `_dark` | Current OS/app color scheme |
| `_ios` / `_android` / `_web` / `_native` | Platform |
| `_<key>` (custom platform) | When `configure({ platforms: { key: () => bool } })` predicate returns true |
| `_<key>` (custom color mode) | When `setCustomColorMode('key')` is active |
| Any RN style prop | Always |

### Extending and composing

```tsx
const Base  = createComponent(View, { borderRadius: 8 });
const Card  = Base.extend({ padding: 16, _dark: { backgroundColor: '#111' } });
const Modal = Base.extend({ padding: 24, shadowOpacity: 0.2 });
```

```tsx
// ✗ — Base.extend() inside a component has the same consequence as createComponent inside render
function Bad() { const Card = Base.extend({ padding: 16 }); return <Card />; }
// ✓ — module scope only
const Card = Base.extend({ padding: 16 });
```

### Variants

See [refs/variants.md](refs/variants.md) for full variant + compound variant examples.

## Color mode

```tsx
import { useColorMode, useColorModeValue, setColorScheme } from 'react-native-small-ui/colormode';

const { colorMode, isDark } = useColorMode(); // colorMode: 'light' | 'dark'
const bg = useColorModeValue('#fff', '#000'); // picks by current mode
setColorScheme('dark');                       // programmatic override
toggleColorScheme();                          // flip current
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
  const theme = useTheme() as AppTheme;
  return <Button _light={{ backgroundColor: theme.light.primary }}
                 _dark={{ backgroundColor: theme.dark.primary }} />;
}
```

`useTheme()` returns `unknown` — always cast to your type. No default tokens are provided.

See [refs/theming.md](refs/theming.md) for named themes, selectors, and `getTheme()`.

## Presets

Plain style objects — spread into `createComponent` or `StyleSheet.create`. Zero runtime cost.

```tsx
import { elevation, shadow, inset, layout, border } from 'react-native-small-ui/presets';

const Card = createComponent(View, { ...elevation.md, borderRadius: 8 });
const Row  = createComponent(View, { ...layout.row });
```

See [refs/presets.md](refs/presets.md) for all available keys.

## Utilities

```tsx
import { cs, getStatusBarStyle } from 'react-native-small-ui';

// Style merge — last-write-wins, falsy values skipped (RN equivalent of cn())
const style = cs(base, isActive && { backgroundColor: '#007AFF' }, disabled && { opacity: 0.5 });

// Returns 'light-content' or 'dark-content' based on background contrast
const barStyle = getStatusBarStyle('#8b59a0'); // → 'light-content'
```

## Skill output example

```tsx
// ✗ — prose that doesn't change what the model writes
// "useTheme() is a hook that gives you access to the active theme object.
//  The theme system is optional. The return type is unknown so cast it."

// ✓ — code that shows the same thing in fewer tokens
const theme = useTheme() as AppTheme; // returns unknown — always cast
```
