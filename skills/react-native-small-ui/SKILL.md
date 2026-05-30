---
name: react-native-small-ui
description: Use when writing React Native components with createComponent, using useMediaQuery, useColorMode, useBreakPointValue, useTheme, or building with react-native-small-ui. Also triggers when importing from 'react-native-small-ui', handling dark mode in React Native, or building responsive layouts.
---

# react-native-small-ui — Consumer Skill

## Identity

- **Utility toolkit, NOT a component library.** Zero pre-built components.
- `<Box>`, `<HStack>`, `<VStack>`, `<Text>`, `<Card>` — **do not exist as exports.**
- No setup required — library **auto-initializes on import.**
- No `<SmallUIProvider>`, no `initSmallUI()`, no setup hook.
- You build components with `createComponent`. The library provides the mechanics.

---

## Critical Rules

### Rule 1 — `createComponent` MUST be at module scope, never inside a component

```tsx
// ❌ WRONG — new component type every render → unmount/remount/state loss
function MyComponent() {
  const Card = createComponent(View, { padding: 16 }); // catastrophic
  return <Card />;
}

// ✅ CORRECT — created once at module level
const Card = createComponent(View, { padding: 16 });
function MyComponent() {
  return <Card />;
}

// ✅ CORRECT — use props for dynamic values, not component recreation
const Card = createComponent(View, { borderRadius: 8 });
function MyComponent() {
  const { colorMode } = useColorMode();
  return <Card padding={colorMode === 'dark' ? 20 : 16} />;
}
```

**Consequence:** Creates new component type on every render. React unmounts + remounts instead of updating. State, refs, and animations are destroyed.

---

### Rule 2 — `.extend()` MUST also be at module scope

```tsx
const Base = createComponent(View, { borderRadius: 8 });

// ❌ WRONG — same catastrophe as Rule 1
function MyComponent() {
  const Card = Base.extend({ padding: 16 });
  return <Card />;
}

// ✅ CORRECT
const Card = Base.extend({ padding: 16 });
function MyComponent() { return <Card />; }
```

---

### Rule 3 — Use modular import paths

| What you need | Import from |
|---|---|
| `createComponent`, `configure`, `cs`, `getStatusBarStyle` | `'react-native-small-ui'` |
| `useColorMode`, `useColorModeValue`, `setColorScheme`, `toggleColorScheme`, `setCustomColorMode`, `clearCustomColorMode`, `useCustomColorMode` | `'react-native-small-ui/colormode'` |
| `useBreakPointValue`, `useMediaQuery`, `useOrientation` | `'react-native-small-ui/utils'` |
| `useTheme`, `getTheme`, `registerTheme`, `setTheme`, `useThemeName`, `generateSpaceUnits`, `ColorUtils` | `'react-native-small-ui/theme'` |
| `elevation`, `shadow`, `inset`, `text`, `layout`, `border` | `'react-native-small-ui/presets'` |
| `renderWithSmallUI`, `assertStyles` | `'react-native-small-ui/testing'` (test env only) |

```tsx
// ❌ WRONG — useTheme lives at /theme, not core
import { useTheme } from 'react-native-small-ui';

// ✅ CORRECT
import { useTheme } from 'react-native-small-ui/theme';
```

---

### Rule 4 — `useTheme()` returns `unknown` — always cast

```tsx
// ❌ WRONG — theme is unknown, this will not compile
const theme = useTheme();
theme.colors.primary; // TS error: Object is of type 'unknown'

// ✅ CORRECT
type AppTheme = { light: { primary: string }; dark: { primary: string } };
const theme = useTheme() as AppTheme;
theme.light.primary; // ✅
```

---

### Rule 5 — Theme system is optional — zero default tokens

```tsx
// ❌ WRONG — no default theme exists; returns {} until registerTheme is called
const theme = useTheme() as AppTheme;
theme.light.primary; // undefined

// ✅ CORRECT — register before using
registerTheme({ light: { primary: '#007AFF' }, dark: { primary: '#0A84FF' } });
```

---

### Rule 6 — Variant config has an exact shape

```tsx
// ✅ The only correct variant config shape
const Button = createComponent(TouchableOpacity, {
  base: { borderRadius: 8, alignItems: 'center' as const },
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
    { variants: { size: 'lg', intent: 'danger' }, style: { borderWidth: 2 } },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});

// Usage
<Button size="sm" intent="danger" />
```

---

## Anti-Patterns

```tsx
// ❌ createComponent inside a render function — destroys state on every render
// ❌ Base.extend({...}) inside useMemo or inside a component — same as above
// ❌ createComponentGroup({...}) inside a component — must be at module level
// ❌ import { useTheme } from 'react-native-small-ui' — useTheme lives at /theme
// ❌ import { useColorMode, useTheme, useBreakPointValue } from 'react-native-small-ui' — use subpaths
// ❌ <Box />, <HStack />, <VStack />, <Center />, <Text /> — not exports
// ❌ <SmallUIProvider> — does not exist; no provider needed
// ❌ useSmallUI() — does not exist; library auto-inits on import
// ❌ initSmallUI() — does not exist
// ❌ setColorScheme('auto') — only 'light' | 'dark' are valid
// ❌ useTheme() without casting — returns unknown; always cast to your type
// ❌ theme.colors / theme.space / theme.palette — no default shape; define your own
// ❌ import { elevation } from 'react-native-small-ui' — elevation lives at /presets
```

---

## API Quick-Reference

### Style props on any created component

- `_light` / `_dark` — color mode conditionals
- `_ios` / `_android` / `_web` / `_native` — platform conditionals
- `_<customPlatform>` — registered via `configure({ platforms: { tablet: () => bool } })`
- `_<customColorMode>` — registered via `configure({ colorModes: { highContrast: true } })`
- All React Native style properties directly as props

### Breakpoint keys (largest wins first)

`'2xl'` (1536) → `'xl'` (1280) → `'lg'` (1024) → `'md'` (768) → `'sm'` (640) → `'xs'` (480) → `'default'` (0)

### `configure()` options

```ts
configure({
  breakPoints: { sm: 600, md: 900 },           // custom widths, or false to disable
  platforms: { tablet: () => width >= 768 },   // custom platform predicates
  colorModes: { highContrast: true },           // custom color mode keys → enables _highContrast prop
});
```

### `SmallUIComponent` methods

```ts
// MODULE LEVEL ONLY
const Extended  = Base.extend({ padding: 16 });
const Compound  = Base.withSlots({ Label: Text, Icon: View }); // <Compound.Label />
```

### `createComponentGroup`

```ts
// MODULE LEVEL ONLY
const FormGroup = createComponentGroup({
  Root:  { Component: View,      style: { gap: 8 } },
  Label: { Component: Text,      style: { fontSize: 14 } },
  Input: { Component: TextInput },
});
// <FormGroup.Root><FormGroup.Label /><FormGroup.Input /></FormGroup.Root>
```

### `ColorUtils`

```ts
import { ColorUtils } from 'react-native-small-ui/theme';
ColorUtils.getHexAlpha('#ff0000', 0.5)  // → '#ff000080'
ColorUtils.getContrastColor('#333333')  // → '#ffffff'
ColorUtils.getContrastMode('#ffffff')   // → 'light'
```

### Presets

```ts
import { elevation, shadow, inset, text, layout, border } from 'react-native-small-ui/presets';

// Spread into createComponent or StyleSheet — plain objects, zero runtime cost
const Card = createComponent(View, { ...elevation.md, borderRadius: 8 });
```

Keys: `elevation.{none,xs,sm,md,lg,xl}` · `shadow.{none,soft,default,pronounced,inset}` · `inset.{none,safe,safeHorizontal,modal}` · `text.{fixed,crisp,accessible}` · `layout.{fill,center,row,rowBetween,column,absoluteFill}` · `border.{hairline,thin,medium,thick,pill}`
