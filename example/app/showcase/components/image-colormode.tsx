import { ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

const Thumbnail = createComponent(Image, {
  width: 128,
  height: 128,
  borderRadius: 8,
  _light: { opacity: 1 },
  _dark: { opacity: 0.6 },
});

export default function ImageColorModeScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Color Mode', headerShown: false }} />

      <ShowcaseSection
        title="_light / _dark opacity"
        description="opacity:1 in light mode, opacity:0.6 in dark mode. Switch the docs theme to see it update instantly."
      >
        <VStack>
          <Thumbnail source={{ uri: 'https://i.pravatar.cc/256' }} />
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Image dims to 60% opacity in dark mode via _dark prop.
          </AppText>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
