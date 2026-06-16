import { ScrollView, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, Box } from '@/src/design-system/primitives';

// ── Module-level components using custom _tablet and _compact props ───────────
// These props only apply when the platform predicates registered in
// src/config.ts evaluate to true at render time.

const AdaptiveCard = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: { backgroundColor: '#f9f9f9' },
  _dark: { backgroundColor: '#1a1a1a' },
  // _tablet and _compact are registered custom platform predicates
  _tablet: { padding: 32, borderRadius: 16 },
  _compact: { padding: 8, borderRadius: 4 },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function ConfigureScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isCompact = width < 375;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'configure()' }} />

      <ShowcaseSection
        title="configure({ platforms })"
        description="Custom predicates become valid _<key> style props on any createComponent output."
      >
        <VStack>
          <Box
            padding={12}
            borderRadius={8}
            _light={{ backgroundColor: '#f3eaf8' }}
            _dark={{ backgroundColor: '#1a0d2e' }}
          >
            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              Current width
            </AppText>
            <AppText
              fontWeight="700"
              fontSize={22}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              {Math.round(width)}px
            </AppText>
            <AppText
              fontSize={13}
              fontWeight="600"
              _light={{
                color: isTablet ? '#166534' : isCompact ? '#9b1c1c' : '#1a1a1a',
              }}
              _dark={{
                color: isTablet ? '#86efac' : isCompact ? '#fca5a5' : '#f0f0f0',
              }}
            >
              {isTablet
                ? '📱 tablet (≥ 768px)'
                : isCompact
                  ? '📲 compact (< 375px)'
                  : '📱 default'}
            </AppText>
          </Box>

          <AdaptiveCard>
            <AppText fontWeight="600">AdaptiveCard</AppText>
            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              padding=16 by default · 32 on _tablet · 8 on _compact
            </AppText>
          </AdaptiveCard>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
