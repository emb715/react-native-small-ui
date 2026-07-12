# Variants

`createComponent` accepts a config object with `base`, `variants`, `compoundVariants`, and `defaultVariants` instead of a plain style object.

## `base:` rule

When `variants` is present, **all flat style props must be inside `base:`**. Props at the config root are silently dropped when the library detects a `variants` key.

```tsx
// ✗ — padding and _light/_dark at root alongside variants — silently dropped
createComponent(View, { padding: 16, _light: { backgroundColor: '#fff' }, variants: { ... } });

// ✓ — flat props in base:
createComponent(View, {
  base: { padding: 16, _light: { backgroundColor: '#fff' }, _dark: { backgroundColor: '#111' } },
  variants: { intent: { primary: { ... }, ghost: { ... } } },
  defaultVariants: { intent: 'primary' },
});
```

## Basic variants

```tsx
import { createComponent } from 'react-native-small-ui';
import { tokens } from './tokens'; // design system tokens — plain object

const Button = createComponent(TouchableOpacity, {
  base: {
    borderRadius: 8,
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // Base colors from tokens — overridden by each intent variant
    _light: { backgroundColor: tokens.light.background },
    _dark:  { backgroundColor: tokens.dark.background },
  },
  variants: {
    intent: {
      // Token-driven: brand colors — change token, all instances update
      primary: {
        _light: { backgroundColor: tokens.light.primary },
        _dark:  { backgroundColor: tokens.dark.primary },
      },
      // Direct hex: semantic states are also token-driven in a real design system
      danger: {
        _light: { backgroundColor: tokens.light.destructive },
        _dark:  { backgroundColor: tokens.dark.destructive },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        _light: { borderColor: tokens.light.primary },
        _dark:  { borderColor: tokens.dark.primary },
      },
    },
    size: {
      sm: { paddingVertical: 6,  paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 20 },
      lg: { paddingVertical: 14, paddingHorizontal: 28 },
    },
  },
  compoundVariants: [
    // Applied only when both size=lg AND intent=danger
    { variants: { size: 'lg', intent: 'danger' }, style: { borderWidth: 2 } },
  ],
  defaultVariants: { intent: 'primary', size: 'md' },
});

// Variant props are typed and auto-completed
<Button intent="danger" size="sm" />
<Button intent="ghost" />   // size defaults to 'md'
```

## `.extend()` — deriving variants

```tsx
const IconButton = Button.extend({
  base: { width: 44, height: 44, padding: 0 },
});
// Inherits all Button variants. Add or override freely.
// ✗ — Button.extend() inside a component — same module-scope rule
```

## `createComponentGroup` — shared context

Groups components that belong together semantically and share a reactive context. The `base:` rule applies here too — flat props alongside `variants` must be inside `base:`.

```tsx
import { createComponentGroup } from 'react-native-small-ui';
import { View, Text, TextInput } from 'react-native';

// At module scope
const Field = createComponentGroup({
  Root:  { Component: View,      style: { gap: 4 } },
  Label: { Component: Text,      style: { fontSize: 14, _light: { color: '#333' }, _dark: { color: '#ccc' } } },
  Input: {
    Component: TextInput,
    style: {
      // base: required because variants is present
      base: { borderWidth: 1, borderRadius: 6, padding: 8 },
      variants: {
        status: {
          idle:    { _light: { borderColor: '#ccc' },    _dark: { borderColor: '#444' } },
          error:   { _light: { borderColor: '#e00c2c' }, _dark: { borderColor: '#ff6b80' } },
          success: { _light: { borderColor: '#79a964' }, _dark: { borderColor: '#8fc477' } },
        },
      },
      defaultVariants: { status: 'idle' },
    },
  },
});

// Usage
<Field.Root>
  <Field.Label>Email</Field.Label>
  <Field.Input status="error" placeholder="you@example.com" />
</Field.Root>
```
