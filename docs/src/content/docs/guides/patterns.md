---
title: Canonical Patterns
description: Four patterns for building components with react-native-small-ui
---

Four patterns cover every real-world use case. Pick the one that matches what you're building.

---

## Pattern 1 — Static component with color mode

Component styles never change at runtime. Color mode is the only reactive dimension.

```tsx
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

const Card = createComponent(View, {
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  _light: { backgroundColor: '#fff', borderColor: '#e5e5e5' },
  _dark:  { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' },
});
```

**When to use:** Structural components (Card, Box, Divider) whose colors adapt to light/dark but whose shape is fixed.

---

## Pattern 2 — Variant component

Component has discrete style modes that map to typed props. All variant combinations are statically declared.

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity } from 'react-native';

const Button = createComponent(TouchableOpacity, {
  base: {
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  variants: {
    intent: {
      primary: {
        _light: { backgroundColor: '#007AFF' },
        _dark:  { backgroundColor: '#0A84FF' },
      },
      ghost: {
        backgroundColor: 'transparent',
        _light: { borderWidth: 1, borderColor: '#007AFF' },
      },
    },
    size: {
      sm: { padding: 8 },
      md: { padding: 12 },
      lg: { padding: 16 },
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

// TypeScript autocompletes intent and size
<Button intent="ghost" size="sm" />
```

**When to use:** Interactive components (Button, Badge, Alert) with discrete states. TypeScript infers prop types automatically from the config — no manual type declarations needed.

**Naming note:** Never name a variant `variant` — it collides with the library concept. Use descriptive names: `intent`, `size`, `status`, `weight`.

---

## Pattern 3 — Compound component with variant propagation

A compound component whose slots need to reflect the parent's active variant automatically.

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

// Slots are created at module scope — never inside a render function.
const ButtonText = createComponent(Text, {
  variants: {
    intent: {
      primary: { color: '#fff' },
      ghost:   { color: '#007AFF' },
    },
  },
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
  .withSlots({ Text: ButtonText })
  .withVariantContext('intent');

// Button.Text picks up intent automatically — no prop needed on the slot.
<Button intent="ghost">
  <Button.Text>Cancel</Button.Text>
</Button>

// Explicit slot prop always wins over context.
<Button intent="ghost">
  <Button.Text intent="primary">Confirm</Button.Text>
</Button>
```

**When to use:** Compound components (Button+Text, Select+Option, Accordion+Panel) where the slot's appearance depends on the parent's active variant. `.withVariantContext()` removes the need to manually drill variant props to every slot.

**Chain order:** `.withSlots()` must run before `.withVariantContext()`. The context wrapper only propagates to slots already attached.

---

## Pattern 4 — Theme-driven component (runtime tokens as props)

Component shape is static. Colors come from runtime theme tokens that change when `setTheme()` is called.

```tsx
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { View } from 'react-native';
import type { AppTheme } from './theme/types';

// Module scope — created once, stable identity.
const Card = createComponent(View, { borderRadius: 12, padding: 16 });

// Render scope — theme values injected as props.
function ThemedCard({ children }: { children: React.ReactNode }) {
  const theme = useTheme() as AppTheme;
  return (
    <Card
      _light={{ backgroundColor: theme.light.card, borderColor: theme.light.border }}
      _dark={{ backgroundColor: theme.dark.card, borderColor: theme.dark.border }}
    >
      {children}
    </Card>
  );
}
```

**When to use:** Components whose colors must respond to `setTheme()` runtime switches — not just OS light/dark. The component definition stays static; the wrapper function reads the theme and forwards tokens as props.

---

## Module-scope invariant

`createComponent` (and `.extend()`, `.withSlots()`, `.withVariantContext()`) **must always be called at module scope — never inside a function component or hook.**

```tsx
// ❌ WRONG — new component type every render, React unmounts/remounts instead
//            of updating. State, refs, and animations are destroyed.
function Screen() {
  const Button = createComponent(TouchableOpacity, { padding: 12 });
  return <Button />;
}

// ✅ CORRECT — module scope, created once
const Button = createComponent(TouchableOpacity, { padding: 12 });
function Screen() {
  return <Button />;
}

// ✅ CORRECT — dynamic values go through props, not component recreation
const Button = createComponent(TouchableOpacity, { borderRadius: 8 });
function Screen({ disabled }: { disabled: boolean }) {
  return <Button opacity={disabled ? 0.5 : 1} />;
}
```

React tracks component identity by reference. A new function reference every render forces a full unmount+remount cycle, breaking every React feature that depends on component continuity.

---

## Typography — thin wrapper pattern

`createComponent` cannot express behavioral props (like `accessibilityRole`) as variants. Use a thin function wrapper:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { createComponent } from 'react-native-small-ui';

// Internal — not exported. Typography handles styling.
const Typography = createComponent(Text, {
  variants: {
    preset: {
      h1: { fontSize: 34, lineHeight: 41 },
      h2: { fontSize: 28, lineHeight: 34 },
      body: { fontSize: 16, lineHeight: 24 },
      caption: { fontSize: 12, lineHeight: 18 },
    },
    weight: {
      normal:   { fontWeight: '400' as const },
      semibold: { fontWeight: '600' as const },
      bold:     { fontWeight: '700' as const },
    },
  },
  defaultVariants: { preset: 'body', weight: 'normal' },
  _light: { color: '#1a1a1a' },
  _dark:  { color: '#f0f0f0' },
});

// Public — consumers import AppText.
// Three lines, fully transparent: all library features reach through via ...props.
const HEADING_PRESETS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

type TypographyProps = React.ComponentProps<typeof Typography>;

export function AppText({ preset = 'body', weight = 'normal', ...props }: TypographyProps) {
  return (
    <Typography
      preset={preset}
      weight={weight}
      accessibilityRole={HEADING_PRESETS.has(preset) ? 'header' : undefined}
      {...props}
    />
  );
}
```

**Notes:**
- `weight` is a variant name — it selects `fontWeight`. Don't also name it `fontWeight`; that would shadow the RN style prop.
- `fontFamily` belongs in a project-level typography file, not in shared primitives. Different projects use different fonts.
- The wrapper is three lines of logic, fully transparent: all `_light/_dark`, style props, and breakpoint features work on `AppText` identically to any direct `SmallUIComponent`.
