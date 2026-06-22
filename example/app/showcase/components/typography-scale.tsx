import { ScrollView, Text as RNText } from 'react-native';
import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { VStack } from '@/src/design-system/primitives';

// Typography component as defined in Typography.mdx — system fonts only
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
      h4: { fontSize: 20, lineHeight: 28 },
      h5: { fontSize: 17, lineHeight: 24 },
      h6: { fontSize: 14, lineHeight: 18 },
      body: { fontSize: 16, lineHeight: 24 },
      caption: { fontSize: 12, lineHeight: 18 },
      small: { fontSize: 10, lineHeight: 14 },
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

const PRESETS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body',
  'caption',
  'small',
] as const;

export default function TypographyScaleScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen
        options={{ title: 'Typography Scale', headerShown: false }}
      />

      <ShowcaseSection
        title="preset variant"
        description="h1 through small — size and lineHeight defined per preset."
      >
        <VStack>
          {PRESETS.map((preset) => (
            <Text key={preset} preset={preset}>
              {preset} — The quick brown fox
            </Text>
          ))}
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
