import { ScrollView, Text as RNText } from 'react-native';
import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { VStack } from '@/src/design-system/primitives';

const Typography = createComponent(RNText, {
  base: {
    _light: { color: '#1a1a1a' },
    _dark: { color: '#f0f0f0' },
  },
  variants: {
    preset: {
      h1: { fontSize: 34, lineHeight: 41 },
      h2: { fontSize: 28, lineHeight: 34 },
      h3: { fontSize: 22, lineHeight: 28 },
      body: { fontSize: 16, lineHeight: 24 },
      caption: { fontSize: 12, lineHeight: 18 },
    },
    weight: {
      thin: { fontWeight: '200' },
      light: { fontWeight: '300' },
      normal: { fontWeight: '400' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
      extrabold: { fontWeight: '900' },
    },
  },
  defaultVariants: { preset: 'body', weight: 'normal' },
});

const HEADING_PRESETS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
type TypographyProps = ComponentProps<typeof Typography>;

function Text({
  preset = 'body',
  weight = 'normal',
  ...props
}: TypographyProps) {
  return (
    <Typography
      preset={preset}
      weight={weight}
      accessibilityRole={
        HEADING_PRESETS.has(preset as string) ? 'header' : undefined
      }
      {...props}
    />
  );
}

export default function TypographyOverridesScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen
        options={{ title: 'Typography Overrides', headerShown: false }}
      />

      <ShowcaseSection
        title="Per-instance overrides"
        description="Default, weight override, and inline _light/_dark color — all applied at the call site."
      >
        <VStack>
          <Text>Default — body preset, normal weight</Text>
          <Text preset="h3" weight="bold">
            h3 + bold weight
          </Text>
          <Text
            preset="caption"
            weight="semibold"
            _light={{ color: '#666' }}
            _dark={{ color: '#aaa' }}
          >
            caption + semibold + secondary color
          </Text>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
