import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

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

export default function TextVariantsScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Text Variants', headerShown: false }} />

      <ShowcaseSection
        title="preset variant"
        description="All preset values — h1 through small. accessibilityRole=header set automatically for h1–h6."
      >
        <VStack>
          {PRESETS.map((preset) => (
            <AppText
              key={preset}
              preset={preset}
              _light={{ color: '#1a1a1a' }}
              _dark={{ color: '#f0f0f0' }}
            >
              {preset} — The quick brown fox
            </AppText>
          ))}
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
