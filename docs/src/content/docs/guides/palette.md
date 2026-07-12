---
title: Palette Generation
description: Building a full color scale from a single brand token using ColorUtils
sidebar:
  order: 9
---

A design system built from a single brand color — all surface, state, and contrast values derived programmatically. `ColorUtils` provides the math; you control the structure.

## Full palette from one token

```ts
import { ColorUtils } from 'react-native-small-ui/theme';

const brand = '#8b59a0';

export const tokens = {
  light: {
    // Brand scale
    primary:          brand,
    primaryPressed:   ColorUtils.darken(brand, 0.1),
    primaryDisabled:  ColorUtils.lighten(brand, 0.35),
    primarySurface:   ColorUtils.lighten(brand, 0.45),
    primaryOverlay:   ColorUtils.toRgba(brand, 0.12),
    onPrimary:        ColorUtils.getContrastColor(brand), // '#fff' or '#000'

    // Semantic states — derived from brand tint + semantic hue
    successBg:        ColorUtils.mix(brand, '#dcfce7', 0.6),
    warningBg:        ColorUtils.mix(brand, '#fef9c3', 0.6),
    errorBg:          ColorUtils.mix(brand, '#fee2e2', 0.6),

    // Surfaces
    background:       '#ffffff',
    card:             '#f8f5fb',
    border:           ColorUtils.lighten(brand, 0.55),
    foreground:       '#1a1a1a',
    muted:            '#767676',
  },
  dark: {
    primary:          ColorUtils.lighten(brand, 0.1),
    primaryPressed:   ColorUtils.darken(brand, 0.05),
    primaryDisabled:  ColorUtils.darken(brand, 0.25),
    primarySurface:   ColorUtils.darken(brand, 0.38),
    primaryOverlay:   ColorUtils.toRgba(brand, 0.2),
    onPrimary:        ColorUtils.getContrastColor(ColorUtils.lighten(brand, 0.1)),

    successBg:        ColorUtils.mix(brand, '#14532d', 0.5),
    warningBg:        ColorUtils.mix(brand, '#713f12', 0.5),
    errorBg:          ColorUtils.mix(brand, '#7f1d1d', 0.5),

    background:       '#0f0f0f',
    card:             '#1e1e1e',
    border:           ColorUtils.darken(brand, 0.3),
    foreground:       '#f0f0f0',
    muted:            '#a0a0a0',
  },
};
```

## Using the palette in components

```tsx
import { createComponent, createPressable } from 'react-native-small-ui';
import { tokens } from './tokens';
import { View } from 'react-native';

const Card = createComponent(View, {
  borderRadius: 12,
  borderWidth: 1,
  padding: 16,
  _light: { backgroundColor: tokens.light.card, borderColor: tokens.light.border },
  _dark:  { backgroundColor: tokens.dark.card,  borderColor: tokens.dark.border },
});

const Button = createPressable({
  base: {
    padding: 12, borderRadius: 8, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
    _light: { backgroundColor: tokens.light.primary },
    _dark:  { backgroundColor: tokens.dark.primary },
  },
  _pressed:  {
    _light: { backgroundColor: tokens.light.primaryPressed },
    _dark:  { backgroundColor: tokens.dark.primaryPressed },
  },
  _focused:  {
    _light: { borderColor: tokens.light.primarySurface },
    _dark:  { borderColor: tokens.dark.primarySurface },
  },
  _disabled: {
    _light: { backgroundColor: tokens.light.primaryDisabled },
    _dark:  { backgroundColor: tokens.dark.primaryDisabled },
  },
});
```

## Accessibility check

Before shipping, verify contrast ratios meet WCAG AA:

```ts
import { ColorUtils } from 'react-native-small-ui/theme';

const checks = [
  ['primary on background', tokens.light.primary, tokens.light.background],
  ['foreground on card',    tokens.light.foreground, tokens.light.card],
  ['muted on background',   tokens.light.muted, tokens.light.background],
] as const;

checks.forEach(([label, fg, bg]) => {
  const ratio = ColorUtils.getContrastRatio(fg, bg);
  const pass = ratio >= 4.5 ? '✓ AA' : '✗ FAIL';
  console.log(`${label}: ${ratio} ${pass}`);
});
```

## When to use a plain object instead

For apps with a fixed, small token set, a plain object is simpler:

```ts
export const tokens = {
  light: { primary: '#8b59a0', background: '#fff', foreground: '#1a1a1a' },
  dark:  { primary: '#a070b8', background: '#0f0f0f', foreground: '#f0f0f0' },
};
```

Use `ColorUtils` to generate the palette when:
- You want a mathematically consistent scale
- You need pressed/disabled/surface states derived from one source token
- You want to verify WCAG contrast programmatically before shipping
