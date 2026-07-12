import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack, Badge } from '@/src/design-system/primitives';

const INTENTS = ['info', 'success', 'warning', 'destructive'] as const;

const LABELS: Record<(typeof INTENTS)[number], string> = {
  info: 'New',
  success: 'Active',
  warning: 'Pending',
  destructive: 'Error',
};

const TEXT_COLORS = {
  info: { light: '#0077b6', dark: '#7ec8e3' },
  success: { light: '#2d7a2d', dark: '#8fc477' },
  warning: { light: '#7a5a00', dark: '#f0c040' },
  destructive: { light: '#c0392b', dark: '#ff6b80' },
} as const;

export default function BadgeDemoScreen() {
  const { isDark } = useColorMode();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Badge', headerShown: false }} />

      <ShowcaseSection
        title="intent variant"
        description="Four semantic intents — all colors from design system tokens."
      >
        <HStack gap={8} flexWrap="wrap">
          {INTENTS.map((intent) => (
            <Badge key={intent} intent={intent}>
              <AppText
                fontSize={12}
                fontWeight="600"
                _light={{ color: TEXT_COLORS[intent].light }}
                _dark={{ color: TEXT_COLORS[intent].dark }}
              >
                {LABELS[intent]}
              </AppText>
            </Badge>
          ))}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="inline usage"
        description="Badges alongside text — alignSelf: flex-start keeps them pill-shaped."
      >
        <VStack gap={12}>
          {INTENTS.map((intent) => (
            <HStack key={intent} gap={8} alignItems="center">
              <Badge intent={intent}>
                <AppText
                  fontSize={11}
                  fontWeight="700"
                  _light={{ color: TEXT_COLORS[intent].light }}
                  _dark={{ color: TEXT_COLORS[intent].dark }}
                >
                  {intent}
                </AppText>
              </Badge>
              <AppText
                fontSize={13}
                _light={{ color: '#1a1a1a' }}
                _dark={{ color: '#f0f0f0' }}
              >
                Status label for {intent} state
              </AppText>
            </HStack>
          ))}
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
