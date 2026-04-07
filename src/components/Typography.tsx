import React, { memo } from 'react';
import { Text } from './primitives';
import { Text as RNText, type TextStyle } from 'react-native';
// import { createComponent } from 'react-native-small-ui';

// const Text = createComponent(RNText);

const Presets = {
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
} satisfies Record<string, TextStyle>;

const Variants = {
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
  extrabold: {
    fontFamily: 'Inter-ExtraBold',
    fontWeight: 900,
  },
} as const;

type TextComponentProps = React.ComponentProps<typeof Text>;

type TypographyProps = TextComponentProps & {
  preset?: keyof typeof Presets;
  variant?: keyof typeof Variants;
};

const _Typography = ({
  children,
  preset = 'default',
  variant = 'normal',
  ...textProps
}: TypographyProps) => {
  const propStyles: TextComponentProps = {
    ...Presets[preset],
    ...Variants[variant],
  };
  return (
    <Text
      role={preset.startsWith('h') ? 'heading' : undefined}
      {...propStyles}
      // fontFamily=''
      {...textProps}
      ref={() => {
        //
      }}
    >
      {children}
      <RNText
        ref={() => {
          //
        }}
      >
        {children}
      </RNText>
    </Text>
  );
};

export const Typography = memo(_Typography);
