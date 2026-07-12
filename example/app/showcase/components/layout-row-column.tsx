import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, HStack, VStack } from '@/src/design-system/primitives';

const Swatch = createComponent(View, {
  width: 48,
  height: 48,
  borderRadius: 8,
});

export default function LayoutRowColumnScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Row & Column', headerShown: false }} />

      <ShowcaseSection
        title="HStack — row"
        description="flexDirection:row, alignItems:center, gap:8 by default."
      >
        <HStack>
          <Swatch
            _light={{ backgroundColor: '#8b59a0' }}
            _dark={{ backgroundColor: '#c084dc' }}
          />
          <Swatch
            _light={{ backgroundColor: '#79a964' }}
            _dark={{ backgroundColor: '#8fc477' }}
          />
          <Swatch
            _light={{ backgroundColor: '#e00c2c' }}
            _dark={{ backgroundColor: '#ff6b80' }}
          />
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="VStack — column"
        description="flexDirection:column, gap:8 by default. No alignItems override."
      >
        <VStack>
          <AppText
            fontWeight="600"
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            First item
          </AppText>
          <AppText
            fontWeight="600"
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Second item
          </AppText>
          <AppText
            fontWeight="600"
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Third item
          </AppText>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
