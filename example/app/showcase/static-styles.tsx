import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { elevation } from 'react-native-small-ui/presets';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';
import { View } from 'react-native';

// ── Module-level components ──────────────────────────────────────────────────

const ProductCard = createComponent(View, {
  borderRadius: 16,
  padding: 20,
  gap: 12,
  _light: { backgroundColor: '#ffffff' },
  _dark: { backgroundColor: '#1e1e1e' },
  _ios: {
    shadowColor: '#8b59a0',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  _android: { elevation: 6 },
});

const PriceBadge = createComponent(View, {
  alignSelf: 'flex-start' as const,
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 9999,
  _light: { backgroundColor: '#f3eaf8' },
  _dark: { backgroundColor: '#2d1a3e' },
});

const WebCard = createComponent(View, {
  borderRadius: 12,
  padding: 20,
  gap: 10,
  _light: { backgroundColor: '#ffffff' },
  _dark: { backgroundColor: '#1e1e1e' },
  _ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  _android: { elevation: 3 },
  // _web applies only on react-native-web — web-specific CSS properties are valid here
  _web: {
    cursor: 'pointer' as any,
    maxWidth: 480,
    boxShadow: '0 2px 12px rgba(139, 89, 160, 0.15)' as any,
    transition: 'box-shadow 0.2s ease' as any,
  },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function StaticStylesScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Static Styles' }} />

      <ShowcaseSection
        title="createComponent"
        description="Wrap any RN component. _light/_dark apply per color mode. _ios/_android/_web/_native apply per platform."
      >
        <ProductCard>
          <VStack>
            <AppText fontSize={18} fontWeight="700">
              Wireless Headphones
            </AppText>
            <AppText _light={{ color: '#767676' }} _dark={{ color: '#a0a0a0' }}>
              Premium noise cancellation · 40h battery
            </AppText>
          </VStack>
          <PriceBadge>
            <AppText
              fontWeight="700"
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              $299
            </AppText>
          </PriceBadge>
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Platform note: iOS shadow uses purple tint via _ios. Android uses
            elevation: 6 via _android.
          </AppText>
        </ProductCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="Direct style props"
        description="All RN style properties are available as props. No StyleSheet.create() needed."
      >
        <ProductCard padding={12} borderRadius={8}>
          <AppText fontWeight="600">Props override base styles</AppText>
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            padding=12 and borderRadius=8 passed directly as props — overrides
            the base 20/16 values.
          </AppText>
        </ProductCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="elevation preset"
        description="elevation.sm spread at the component level — _ios shadow + _android elevation applied per platform."
      >
        <ProductCard {...elevation.sm}>
          <AppText fontWeight="600">elevation.sm applied</AppText>
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Spread elevation.sm as top-level props so _ios/_android keys resolve
            correctly at the component level.
          </AppText>
        </ProductCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="_web styles"
        description="_web applies only on react-native-web. Use web-native CSS properties: cursor, boxShadow, maxWidth, transition."
      >
        <WebCard>
          <AppText fontWeight="600">
            Web-only styles active on this platform
          </AppText>
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            On web: cursor: pointer · maxWidth: 480 · purple box-shadow ·
            transition. On iOS/Android: standard shadow/elevation instead.
          </AppText>
        </WebCard>
      </ShowcaseSection>
    </ScrollView>
  );
}
