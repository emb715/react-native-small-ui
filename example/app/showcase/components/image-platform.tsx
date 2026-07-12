import { ScrollView, Image, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

const HeroImage = createComponent(Image, {
  width: '100%' as const,
  _ios: { height: 240 },
  _android: { height: 200 },
  _web: { height: 320 },
});

const PlatformNote = createComponent(View, {
  marginTop: 8,
  padding: 10,
  borderRadius: 6,
  _light: { backgroundColor: '#f3eaf8' },
  _dark: { backgroundColor: '#2d1a3e' },
});

export default function ImagePlatformScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen
        options={{ title: 'Platform Sizing', headerShown: false }}
      />

      <ShowcaseSection
        title="Platform-specific height"
        description="_ios:240px · _android:200px · _web:320px — width is always 100%."
      >
        <VStack>
          <HeroImage
            source={{ uri: 'https://placehold.co/800x400/8b59a0/ffffff.png' }}
            resizeMode="cover"
          />
          <PlatformNote>
            <AppText
              fontSize={12}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              You are on web — height is 320px via _web. On iOS it would be
              240px, on Android 200px.
            </AppText>
          </PlatformNote>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
