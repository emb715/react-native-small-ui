---
title: Variant System
description: Type-safe, composable component variants with createComponent
---

The variant system brings the full `cva` (class-variance-authority) pattern to React Native — without external dependencies. All variant props are **fully type-inferred** from your config object: no manual type declarations, no casting.

## Overview

Instead of passing a plain style object, pass a `ComponentConfig`:

```ts
createComponent(Component, {
  base: { ... },           // styles on every instance
  variants: { ... },       // named variant groups
  compoundVariants: [...], // styles for specific combinations
  defaultVariants: { ... } // fallback values
})
```

---

## Basic Variants

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

const Button = createComponent(TouchableOpacity, {
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    size: {
      sm: { paddingVertical: 6,  paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 20 },
      lg: { paddingVertical: 14, paddingHorizontal: 28 },
    },
    intent: {
      primary: {
        _light: { backgroundColor: '#007AFF' },
        _dark:  { backgroundColor: '#0A84FF' },
      },
      danger: {
        _light: { backgroundColor: '#e00c2c' },
        _dark:  { backgroundColor: '#be0a25' },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        _light: { borderColor: '#007AFF' },
        _dark:  { borderColor: '#0A84FF' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    intent: 'primary',
  },
});

// TypeScript autocompletes size and intent props
<Button size="sm" intent="danger" onPress={handleDelete}>
  <Text style={{ color: '#fff' }}>Delete</Text>
</Button>

// Defaults apply — no props needed
<Button onPress={handleSubmit}>
  <Text style={{ color: '#fff' }}>Submit</Text>
</Button>
```

---

## Color Mode in Variants

Variant styles support all underscore props — including `_light` and `_dark`:

```tsx
const Badge = createComponent(View, {
  base: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  variants: {
    status: {
      success: {
        _light: { backgroundColor: '#dcfce7', },
        _dark:  { backgroundColor: '#14532d' },
      },
      warning: {
        _light: { backgroundColor: '#fef9c3' },
        _dark:  { backgroundColor: '#713f12' },
      },
      error: {
        _light: { backgroundColor: '#fee2e2' },
        _dark:  { backgroundColor: '#7f1d1d' },
      },
    },
  },
});

<Badge status="success" />
<Badge status="error" />
```

---

## Compound Variants

Apply styles only when a **specific combination** of variants is active. Compound styles are resolved after individual variants and always win on conflict.

```tsx
const Button = createComponent(TouchableOpacity, {
  variants: {
    size: {
      sm: { padding: 6 },
      lg: { padding: 14 },
    },
    intent: {
      primary: {
        _light: { backgroundColor: '#007AFF' },
        _dark: { backgroundColor: '#0A84FF' },
      },
      danger: {
        _light: { backgroundColor: '#e00c2c' },
        _dark: { backgroundColor: '#be0a25' },
      },
    },
  },
  compoundVariants: [
    {
      // Only when size=sm AND intent=danger
      variants: { size: 'sm', intent: 'danger' },
      style: { borderWidth: 2, borderColor: '#ff6b6b' },
    },
    {
      // Only when size=lg AND intent=primary
      variants: { size: 'lg', intent: 'primary' },
      style: { borderRadius: 12 },
    },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});
```

Multiple compound variants can match simultaneously — all are applied in declaration order.

---

## Default Variants

`defaultVariants` sets fallback values used when no explicit prop is passed. They're overridden by any explicitly supplied prop:

```tsx
const Card = createComponent(View, {
  variants: {
    shadow: {
      none:   {},
      sm:     { _ios: { shadowOpacity: 0.08 }, _android: { elevation: 1 } },
      md:     { _ios: { shadowOpacity: 0.15 }, _android: { elevation: 3 } },
      lg:     { _ios: { shadowOpacity: 0.25 }, _android: { elevation: 6 } },
    },
    rounded: {
      none: { borderRadius: 0 },
      sm:   { borderRadius: 4 },
      md:   { borderRadius: 8 },
      lg:   { borderRadius: 16 },
      full: { borderRadius: 999 },
    },
  },
  defaultVariants: {
    shadow: 'sm',
    rounded: 'md',
  },
});

<Card />                            // shadow=sm, rounded=md
<Card shadow="lg" />                // shadow=lg, rounded=md
<Card shadow="none" rounded="lg" /> // explicit overrides
```

---

## Resolution Order

Styles are merged in this fixed order — later wins on key conflict:

```
base → defaultVariants → prop variants → compoundVariants → direct props
```

Direct props (e.g. `padding={32}`) always win over everything, including compound variants.

---

## `.extend()` with Variants

Extend a component and add or override variants:

```tsx
const BaseButton = createComponent(TouchableOpacity, {
  base: { borderRadius: 8, alignItems: 'center' },
  variants: {
    size: {
      sm: { padding: 6 },
      md: { padding: 10 },
    },
  },
  defaultVariants: { size: 'md' },
});

// Extend — add new variants, override defaults
const IconButton = BaseButton.extend({
  base: { width: 40, height: 40, justifyContent: 'center' },
  variants: {
    shape: {
      square: { borderRadius: 4 },
      circle: { borderRadius: 999 },
    },
  },
  defaultVariants: { size: 'sm', shape: 'circle' },
});
```

Extension rules:

- `base` styles: merged (extension wins on conflict)
- `variants`: shallowly merged by group name (extension groups override base groups of same name)
- `compoundVariants`: concatenated (base entries first, extension entries after)
- `defaultVariants`: merged (extension wins on conflict)

---

## Type-Safe Variant Props

TypeScript infers variant prop types directly from the config object:

```tsx
// Given:
const Button = createComponent(TouchableOpacity, {
  variants: {
    size: { sm: {}, md: {}, lg: {} },
    intent: { primary: {}, danger: {}, ghost: {} },
  },
});

// TypeScript knows:
// size?: 'sm' | 'md' | 'lg'
// intent?: 'primary' | 'danger' | 'ghost'

<Button size="xl" />     // TS error: 'xl' is not assignable to 'sm' | 'md' | 'lg'
<Button intent="info" /> // TS error: 'info' is not assignable to ...
```

No interface declarations, no `cva()` wrapper, no external library.

---

## Complete Example — Design System Button

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const ButtonRoot = createComponent(TouchableOpacity, {
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  variants: {
    size: {
      xs: { paddingVertical: 4,  paddingHorizontal: 10, borderRadius: 4 },
      sm: { paddingVertical: 6,  paddingHorizontal: 14, borderRadius: 6 },
      md: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
      lg: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
    },
    intent: {
      primary: {
        _light: { backgroundColor: '#8b59a0' },
        _dark:  { backgroundColor: '#756896' },
      },
      secondary: {
        _light: { backgroundColor: '#79a964' },
        _dark:  { backgroundColor: '#899668' },
      },
      destructive: {
        _light: { backgroundColor: '#e00c2c' },
        _dark:  { backgroundColor: '#be0a25' },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        _light: { borderColor: '#8b59a0' },
        _dark:  { borderColor: '#756896' },
      },
    },
  },
  compoundVariants: [
    {
      variants: { intent: 'outline', size: 'lg' },
      style: { borderWidth: 2 },
    },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});

function Button({
  size,
  intent,
  loading,
  children,
  ...props
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  intent?: 'primary' | 'secondary' | 'destructive' | 'outline';
  loading?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof ButtonRoot>) {
  return (
    <ButtonRoot size={size} intent={intent} {...props}>
      {loading && <ActivityIndicator size="small" color="#fff" />}
      <Text style={{ color: '#fff', fontWeight: '600' }}>{children}</Text>
    </ButtonRoot>
  );
}

// Usage
<Button>Default</Button>
<Button size="lg" intent="destructive">Delete Account</Button>
<Button size="sm" intent="outline">Cancel</Button>
<Button loading>Saving...</Button>
```
