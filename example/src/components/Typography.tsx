import React from 'react';
import { Text as RNText } from 'react-native';
import { createComponent } from 'react-native-small-ui';

const Text = createComponent(RNText);

const TypographyPresets = {
  h1: {
    fontFamily: 'Inter',
    fontSize: 34,
    lineHeight: 41,
  },
  h2: {
    fontFamily: 'Inter',
    fontSize: 28,
    lineHeight: 34,
  },
  h3: {
    fontFamily: 'Inter',
    fontSize: 22,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'Inter',
    fontSize: 20,
    lineHeight: 28,
  },
  h5: {
    fontFamily: 'Inter',
    fontSize: 17,
    lineHeight: 24,
  },
  h6: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 18,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  medium: {
    fontSize: 14,
    lineHeight: 22,
  },
  small: {
    fontSize: 12,
    lineHeight: 18,
  },
  smallest: {
    fontSize: 10,
    lineHeight: 14,
  },
} as const;

type TypographyPresetType = keyof typeof TypographyPresets;

const TypographyVariants = {
  thin: {
    fontFamily: 'Inter-Thin',
    fontWeight: 200,
  },
  light: {
    fontFamily: 'Inter-Light',
    fontWeight: 300,
  },
  normal: {
    fontFamily: 'Inter',
    fontWeight: 400,
  },
  semibold: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: 600,
  },
  bold: {
    fontFamily: 'Inter-Bold',
    fontWeight: 700,
  },
} as const;
type TypographyVariantType = keyof typeof TypographyVariants;

type TypographyProps = React.PropsWithChildren<{
  preset?: TypographyPresetType;
  variant?: TypographyVariantType;
}> &
  React.ComponentProps<typeof Text>;

export function Typography({
  children,
  preset = 'default',
  variant = 'normal',
  ...textProps
}: TypographyProps) {
  const TypographyPropStyles: React.ComponentProps<typeof Text> = {
    ...TypographyPresets[preset],
    ...TypographyVariants[variant],
  };
  return (
    <Text
      role={preset.startsWith('h') ? 'heading' : undefined}
      {...TypographyPropStyles}
      {...textProps}
    >
      {children}
    </Text>
  );
}
