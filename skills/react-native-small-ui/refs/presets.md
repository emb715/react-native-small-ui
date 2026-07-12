# Presets

Plain style objects — spread into `createComponent` or `StyleSheet.create`. No API, no registration, zero runtime cost.

```tsx
import { elevation, shadow, inset, text, layout, border } from 'react-native-small-ui/presets';
```

## elevation

Cross-platform shadow (iOS shadow + Android elevation pair).

```tsx
const Card = createComponent(View, { ...elevation.md, borderRadius: 8 });
```

Keys: `none` · `xs` · `sm` · `md` · `lg` · `xl`

## shadow

iOS-only shadow presets.

```tsx
const Overlay = createComponent(View, { ...shadow.soft });
```

Keys: `none` · `soft` · `default` · `pronounced` · `inset`

## inset

Safe-area padding presets.

```tsx
const Screen = createComponent(View, { ...inset.safe, flex: 1 });
```

Keys: `none` · `safe` · `safeHorizontal` · `modal`

## text

Cross-platform text rendering normalisations.

```tsx
const Label = createComponent(Text, { ...text.crisp, fontSize: 14 });
```

Keys: `fixed` · `crisp` · `accessible`

## layout

Common flexbox patterns.

```tsx
const Row    = createComponent(View, { ...layout.row,    gap: 8 });
const Center = createComponent(View, { ...layout.center, flex: 1 });
```

Keys: `fill` · `center` · `row` · `rowBetween` · `column` · `absoluteFill`

## border

Border width and shape presets.

```tsx
const Input = createComponent(TextInput, { ...border.thin, borderRadius: 6 });
const Pill  = createComponent(View,      { ...border.pill });
```

Keys: `hairline` · `thin` · `medium` · `thick` · `pill`
