import { ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { HStack, AppText } from '@/src/design-system/primitives';

const Avatar = createComponent(Image, {
  width: 64,
  height: 64,
  borderRadius: 32,
});

const AvatarLg = createComponent(Image, {
  width: 96,
  height: 96,
  borderRadius: 48,
});

export default function ImageAvatarScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Avatar', headerShown: false }} />

      <ShowcaseSection
        title="Avatar"
        description="createComponent(Image, { width, height, borderRadius }) — source passed as prop at usage time."
      >
        <HStack gap={16}>
          <Avatar source={{ uri: 'https://i.pravatar.cc/128' }} />
          <AvatarLg source={{ uri: 'https://i.pravatar.cc/192' }} />
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            64px and 96px variants — same component, different base styles
          </AppText>
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
