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
import { tokens } from './tokens'; // your design system tokens — a plain object

const Button = createComponent(TouchableOpacity, {
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Base styles can consume design system tokens directly.
    // These apply to every instance regardless of which variant is active.
    _light: { backgroundColor: tokens.light.primary },
    _dark:  { backgroundColor: tokens.dark.primary },
  },
  variants: {
    size: {
      sm: { paddingVertical: 6,  paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 20 },
      lg: { paddingVertical: 14, paddingHorizontal: 28 },
    },
    intent: {
      primary: {
        // Variant overrides the base color for this intent
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

Variant styles support all underscore props — including `_light` and `_dark`. Design system tokens belong in every variant — brand colors, semantic states, surfaces, and borders alike. `createComponent` doesn't care where the values come from; what matters is that the values live in one place.

```tsx
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';
import { tokens } from './tokens'; // your design system — a plain object, no hook needed

// tokens shape (example):
// {
//   light: { info, success, warning, error, card, primary, border },
//   dark:  { info, success, warning, error, card, primary, border },
// }

const Badge = createComponent(View, {
  base: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  variants: {
    status: {
      // All variants consume tokens — semantic states included.
      // Change tokens.light.success once and every success badge updates.
      info: {
        _light: { backgroundColor: tokens.light.card,    borderWidth: 1, borderColor: tokens.light.primary },
        _dark:  { backgroundColor: tokens.dark.card,     borderWidth: 1, borderColor: tokens.dark.primary },
      },
      success: {
        _light: { backgroundColor: tokens.light.success },
        _dark:  { backgroundColor: tokens.dark.success },
      },
      warning: {
        _light: { backgroundColor: tokens.light.warning },
        _dark:  { backgroundColor: tokens.dark.warning },
      },
      error: {
        _light: { backgroundColor: tokens.light.error },
        _dark:  { backgroundColor: tokens.dark.error },
      },
    },
  },
});

<Badge status="info" />
<Badge status="success" />
<Badge status="error" />
```

The `tokens` object is a plain JS import — no provider, no hook, no React context. `createComponent` resolves it at module load time, which means tokens are baked in at definition. To drive components from a runtime-switchable theme, pass token values as **props** at the call site instead. See the [Theme-Driven Components](/utilities/create-component#theme-driven-components) pattern.

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

A real design system defines tokens for everything — colors, spacing, radius. This example uses tokens at every layer: `base` surface fallback, spacing in the `size` variant, all intent colors including semantic ones. No direct hex values anywhere — one change to `tokens` propagates through the entire component.

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { tokens } from './tokens'; // your design system — a plain object, no hook needed

// tokens shape (example):
// {
//   light: { primary, secondary, destructive, background, foreground, border },
//   dark:  { primary, secondary, destructive, background, foreground, border },
//   space: { xs: 4, sm: 6, md: 10, lg: 14 },
//   radius: { xs: 4, sm: 6, md: 8, lg: 10 },
// }

const ButtonRoot = createComponent(TouchableOpacity, {
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.sm,
    // Surface fallback — overridden by every intent variant,
    // but provides a safe default if no intent is supplied.
    _light: { backgroundColor: tokens.light.background },
    _dark:  { backgroundColor: tokens.dark.background },
  },
  variants: {
    size: {
      // Spacing and radius from token scale — change once, all sizes update.
      xs: { paddingVertical: tokens.space.xs, paddingHorizontal: tokens.space.sm,  borderRadius: tokens.radius.xs },
      sm: { paddingVertical: tokens.space.sm, paddingHorizontal: tokens.space.md,  borderRadius: tokens.radius.sm },
      md: { paddingVertical: tokens.space.md, paddingHorizontal: tokens.space.lg,  borderRadius: tokens.radius.md },
      lg: { paddingVertical: tokens.space.lg, paddingHorizontal: tokens.space.xl,  borderRadius: tokens.radius.lg },
    },
    intent: {
      // All intents consume tokens — brand and semantic alike.
      // The design system owns every color; no intent uses a hardcoded value.
      primary: {
        _light: { backgroundColor: tokens.light.primary },
        _dark:  { backgroundColor: tokens.dark.primary },
      },
      secondary: {
        _light: { backgroundColor: tokens.light.secondary },
        _dark:  { backgroundColor: tokens.dark.secondary },
      },
      destructive: {
        _light: { backgroundColor: tokens.light.destructive },
        _dark:  { backgroundColor: tokens.dark.destructive },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        _light: { borderColor: tokens.light.primary },
        _dark:  { borderColor: tokens.dark.primary },
      },
    },
  },
  compoundVariants: [
    {
      // outline + lg gets a heavier border to match the larger tap target
      variants: { intent: 'outline', size: 'lg' },
      style: { borderWidth: 2 },
    },
  ],
  defaultVariants: { size: 'md', intent: 'primary' },
});

// Text color is also token-driven. outline shows the primary color;
// all filled intents use the foreground-on-color token.
const TEXT_COLOR: Record<string, { light: string; dark: string }> = {
  primary:     { light: tokens.light.foreground, dark: tokens.dark.foreground },
  secondary:   { light: tokens.light.foreground, dark: tokens.dark.foreground },
  destructive: { light: tokens.light.foreground, dark: tokens.dark.foreground },
  outline:     { light: tokens.light.primary,    dark: tokens.dark.primary    },
};

function Button({
  size,
  intent = 'primary',
  loading,
  children,
  ...props
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  intent?: 'primary' | 'secondary' | 'destructive' | 'outline';
  loading?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<typeof ButtonRoot>) {
  const textColor = TEXT_COLOR[intent];
  return (
    <ButtonRoot size={size} intent={intent} {...props}>
      {loading && <ActivityIndicator size="small" color={textColor.light} />}
      <Text style={{ color: textColor.light, fontWeight: '600' }}>
        {children}
      </Text>
    </ButtonRoot>
  );
}

// Usage
<Button>Default</Button>
<Button size="lg" intent="destructive">Delete Account</Button>
<Button size="sm" intent="outline">Cancel</Button>
<Button loading>Saving...</Button>
```

**What tokens buy you here:**

- **Single source of truth** — change `tokens.light.primary` once and every `primary` and `outline` instance updates across the entire app
- **Consistent spacing** — the `size` variant reads from `tokens.space` and `tokens.radius`; adjust the scale once and all button sizes reflow
- **No exceptions** — `destructive` and `secondary` use tokens just like `primary` does; the design system owns all colors, not just brand ones
- **Portable** — swap the `tokens` import for a different theme object and the component inherits the new palette with zero edits to the component definition
