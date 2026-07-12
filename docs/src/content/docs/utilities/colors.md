---
title: Color Utilities
---

Color utilities for manipulating and analyzing hex colors. Part of the theme package — no additional dependencies.

## Installation

```js
import { ColorUtils } from 'react-native-small-ui/theme';
```

All utilities accept 3-digit (`#rgb`) and 6-digit (`#rrggbb`) hex input.

---

## ColorUtils.getHexAlpha

Add alpha transparency to a hex color. Returns an 8-digit hex string (`#rrggbbaa`).

```js
ColorUtils.getHexAlpha('#000000', 0.5)  // '#00000080'
ColorUtils.getHexAlpha('#fff', 0.1)     // '#ffffff1a'
```

**Parameters:** `hexColor: string`, `alpha: number` (0–1)

**Common use — modal overlays:**

```tsx
const Overlay = createComponent(View, {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
});

<Overlay backgroundColor={ColorUtils.getHexAlpha('#000000', 0.5)} />
```

---

## ColorUtils.toRgba

Convert a hex color to an `rgba()` CSS string. Useful for web-specific styles where `rgba()` is required (e.g. `boxShadow`, `textShadow`).

```js
ColorUtils.toRgba('#8b59a0', 0.5)  // 'rgba(139, 89, 160, 0.5)'
ColorUtils.toRgba('#000')           // 'rgba(0, 0, 0, 1)'
```

**Parameters:** `hexColor: string`, `alpha?: number` (0–1, default `1`)

**Common use — web shadows:**

```tsx
const Card = createComponent(View, {
  _web: {
    boxShadow: `0 4px 16px ${ColorUtils.toRgba('#8b59a0', 0.2)}`,
  } as any,
});
```

---

## ColorUtils.getContrastColor

Return the highest-contrast text color — `#ffffff` or `#000000` — for a given background. Uses WCAG relative luminance.

```js
ColorUtils.getContrastColor('#8b59a0')  // '#ffffff'
ColorUtils.getContrastColor('#f0f0f0')  // '#000000'
```

**Parameters:** `color: string`

**Common use — dynamic text on user-supplied colors:**

```tsx
function ColorChip({ color }: { color: string }) {
  const text = ColorUtils.getContrastColor(color);
  return (
    <View style={{ backgroundColor: color, padding: 12 }}>
      <Text style={{ color: text }}>{color}</Text>
    </View>
  );
}
```

---

## ColorUtils.getContrastMode

Return `'light'` when the color is dark (needs light text on top), `'dark'` when the color is light (needs dark text).

```js
ColorUtils.getContrastMode('#8b59a0')  // 'light'  — dark color
ColorUtils.getContrastMode('#f0f0f0')  // 'dark'   — light color
```

**Parameters:** `color: string`

---

## ColorUtils.getContrastRatio

Return the WCAG contrast ratio between two hex colors (range 1–21, rounded to 2 decimal places).

```js
ColorUtils.getContrastRatio('#ffffff', '#000000')  // 21
ColorUtils.getContrastRatio('#8b59a0', '#ffffff')  // 4.73 — passes WCAG AA
ColorUtils.getContrastRatio('#8b59a0', '#8b59a0')  // 1    — no contrast
```

**Parameters:** `hex1: string`, `hex2: string`

**WCAG thresholds:**

| Ratio | Requirement |
|-------|-------------|
| ≥ 3.0 | AA — large text, UI components |
| ≥ 4.5 | AA — normal text |
| ≥ 7.0 | AAA — enhanced |

**Common use — accessibility checks at build time:**

```ts
const ratio = ColorUtils.getContrastRatio(tokens.light.primary, '#ffffff');
if (ratio < 4.5) {
  console.warn(`Primary color fails WCAG AA on white: ${ratio}`);
}
```

---

## ColorUtils.darken

Darken a hex color by reducing its HSL lightness. Preserves hue and saturation — produces visually predictable shades without muddying the hue.

```js
ColorUtils.darken('#8b59a0', 0.1)  // slightly darker purple
ColorUtils.darken('#8b59a0', 0.3)  // pressed / active state
```

**Parameters:** `hexColor: string`, `amount: number` (0–1)

**Common use — pressed state tokens:**

```ts
const tokens = {
  light: {
    primary: '#8b59a0',
    primaryPressed: ColorUtils.darken('#8b59a0', 0.1),
    primaryDisabled: ColorUtils.lighten('#8b59a0', 0.3),
  },
};
```

---

## ColorUtils.lighten

Lighten a hex color by increasing its HSL lightness. Produces tints suitable for backgrounds, badges, and subtle surfaces.

```js
ColorUtils.lighten('#8b59a0', 0.1)  // slightly lighter purple
ColorUtils.lighten('#8b59a0', 0.4)  // badge background / surface tint
```

**Parameters:** `hexColor: string`, `amount: number` (0–1)

---

## ColorUtils.mix

Linearly interpolate between two hex colors. `weight=0` returns `hex1`, `weight=1` returns `hex2`.

```js
ColorUtils.mix('#000000', '#ffffff', 0.5)    // '#808080'
ColorUtils.mix('#8b59a0', '#ffffff', 0.85)   // very light purple tint
ColorUtils.mix('#e00c2c', '#8b59a0', 0.5)   // midpoint between red and purple
```

**Parameters:** `hex1: string`, `hex2: string`, `weight: number` (0–1)

**Common use — generating semantic colors from brand tokens:**

```ts
const primary = '#8b59a0';

const tokens = {
  light: {
    primary,
    successBg:  ColorUtils.mix(primary, '#dcfce7', 0.5),
    warningBg:  ColorUtils.mix(primary, '#fef9c3', 0.5),
    errorBg:    ColorUtils.mix(primary, '#fee2e2', 0.5),
  },
};
```

---

## Composing utilities

The utilities compose — use them together to build a full token scale from a single brand color:

```ts
import { ColorUtils } from 'react-native-small-ui/theme';

const brand = '#8b59a0';

export const tokens = {
  light: {
    primary:         brand,
    primaryPressed:  ColorUtils.darken(brand, 0.1),
    primaryDisabled: ColorUtils.lighten(brand, 0.35),
    primarySurface:  ColorUtils.lighten(brand, 0.45),
    primaryOverlay:  ColorUtils.toRgba(brand, 0.12),
    onPrimary:       ColorUtils.getContrastColor(brand),
  },
  dark: {
    primary:         ColorUtils.lighten(brand, 0.1),
    primaryPressed:  ColorUtils.darken(brand, 0.05),
    primaryDisabled: ColorUtils.darken(brand, 0.2),
    primarySurface:  ColorUtils.darken(brand, 0.35),
    primaryOverlay:  ColorUtils.toRgba(brand, 0.2),
    onPrimary:       ColorUtils.getContrastColor(ColorUtils.lighten(brand, 0.1)),
  },
};
```
