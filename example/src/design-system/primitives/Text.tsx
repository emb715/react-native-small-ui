import type { ComponentProps } from 'react';
import { Text as RNText } from 'react-native';
import { createComponent } from 'react-native-small-ui';

// ─── Internal createComponent output ─────────────────────────────────────────
// Typography is internal — AppText is what consumers import.
// No fontFamily here: this is a shared primitive. Add fontFamily in weight
// variants only if your project has custom fonts loaded.

const Typography = createComponent(RNText, {
  variants: {
    preset: {
      h1: { fontSize: 34, lineHeight: 41 },
      h2: { fontSize: 28, lineHeight: 34 },
      h3: { fontSize: 22, lineHeight: 28 },
      h4: { fontSize: 20, lineHeight: 28 },
      h5: { fontSize: 17, lineHeight: 24 },
      h6: { fontSize: 14, lineHeight: 18 },
      body: { fontSize: 16, lineHeight: 24 },
      caption: { fontSize: 12, lineHeight: 18 },
      small: { fontSize: 10, lineHeight: 14 },
    },
    weight: {
      normal: { fontWeight: '400' as const },
      semibold: { fontWeight: '600' as const },
      bold: { fontWeight: '700' as const },
    },
  },
  defaultVariants: { preset: 'body', weight: 'normal' },
  _light: { color: '#1a1a1a' },
  _dark: { color: '#f0f0f0' },
});

// ─── Thin wrapper ─────────────────────────────────────────────────────────────
// Handles accessibilityRole — a behavioral prop createComponent cannot express
// as a variant. All style props, _light/_dark, and extend() reach through via
// ...props spread.

const HEADING_PRESETS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

type TypographyProps = ComponentProps<typeof Typography>;

export function AppText({
  preset = 'body',
  weight = 'normal',
  ...props
}: TypographyProps) {
  return (
    <Typography
      preset={preset}
      weight={weight}
      accessibilityRole={HEADING_PRESETS.has(preset) ? 'header' : undefined}
      {...props}
    />
  );
}
