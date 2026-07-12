import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

const Box = createComponent(View);

export default function LayoutBoxScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Box', headerShown: false }} />

      <ShowcaseSection
        title="Box"
        description="createComponent(View) — transparent wrapper. All style props available."
      >
        <VStack>
          <Box
            padding={16}
            borderRadius={8}
            _light={{ backgroundColor: '#f3eaf8' }}
            _dark={{ backgroundColor: '#2d1a3e' }}
          >
            <AppText _light={{ color: '#1a1a1a' }} _dark={{ color: '#f0f0f0' }}>
              Box with _light / _dark background
            </AppText>
          </Box>
          <Box
            padding={12}
            marginTop={8}
            borderRadius={8}
            _light={{ backgroundColor: '#eaf3ea' }}
            _dark={{ backgroundColor: '#1a2e1a' }}
          >
            <AppText _light={{ color: '#1a1a1a' }} _dark={{ color: '#f0f0f0' }}>
              marginTop and padding as props
            </AppText>
          </Box>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
