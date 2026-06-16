import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { border } from 'react-native-small-ui/presets';
import { ShowcaseSection } from '@/src/components';
import { AppText } from '@/src/design-system/primitives';

// ── Extend chain — all at module level ───────────────────────────────────────

const BaseCard = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  ...border.hairline,
  _light: { backgroundColor: '#f9f9f9', borderColor: '#e5e5e5' },
  _dark: { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' },
});

const ElevatedCard = BaseCard.extend({
  _light: { backgroundColor: '#ffffff', borderColor: '#e5e5e5' },
  _dark: { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' },
  _ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  _android: { elevation: 4 },
});

const FeaturedCard = ElevatedCard.extend({
  padding: 24,
  borderRadius: 16,
  borderLeftWidth: 4,
  _light: {
    backgroundColor: '#f3eaf8',
    borderColor: '#e5e5e5',
    borderLeftColor: '#8b59a0',
  },
  _dark: {
    backgroundColor: '#1a0d2e',
    borderColor: '#2a2a2a',
    borderLeftColor: '#a070b8',
  },
  _ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  _android: { elevation: 8 },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function ExtendScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: '.extend()' }} />

      <ShowcaseSection
        title="BaseCard"
        description="createComponent(View, { flat style })"
      >
        <BaseCard>
          <AppText fontWeight="600">Base Card</AppText>
          <AppText
            fontSize={13}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Hairline border, light background. No elevation.
          </AppText>
        </BaseCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="ElevatedCard"
        description="BaseCard.extend({ elevation shadow })"
      >
        <ElevatedCard>
          <AppText fontWeight="600">Elevated Card</AppText>
          <AppText
            fontSize={13}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Inherits BaseCard. Adds platform elevation shadow. White background.
          </AppText>
        </ElevatedCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="FeaturedCard"
        description="ElevatedCard.extend({ larger padding, accent border })"
      >
        <FeaturedCard>
          <AppText fontWeight="700" fontSize={16}>
            Featured Card
          </AppText>
          <AppText
            fontSize={13}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Inherits ElevatedCard. Adds 24px padding, 16px radius, deeper
            elevation, and a purple left accent border.
          </AppText>
        </FeaturedCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="Prop override on extended component"
        description="FeaturedCard with padding=12 passed as a prop — prop wins over base."
      >
        <FeaturedCard padding={12}>
          <AppText fontWeight="600">Prop override</AppText>
          <AppText
            fontSize={13}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            padding=12 passed as prop overrides the inherited 24px base value.
          </AppText>
        </FeaturedCard>
      </ShowcaseSection>
    </ScrollView>
  );
}
