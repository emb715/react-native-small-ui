import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

export default function TextBasicScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Text', headerShown: false }} />

      <ShowcaseSection
        title="Basic"
        description="Base _light/_dark color applies automatically. No useColorMode needed at the call site."
      >
        <VStack>
          <AppText _light={{ color: '#1a1a1a' }} _dark={{ color: '#f0f0f0' }}>
            Hello world
          </AppText>
          <AppText
            marginTop={4}
            fontSize={16}
            lineHeight={24}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Body text with fontSize and lineHeight props
          </AppText>
          <AppText
            marginTop={4}
            _light={{ color: '#666' }}
            _dark={{ color: '#aaa' }}
          >
            Secondary — per-instance _light/_dark override
          </AppText>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
