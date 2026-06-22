import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText } from '@/src/design-system/primitives';

const Center = createComponent(View, {
  alignItems: 'center',
  justifyContent: 'center',
});

const Dot = createComponent(View, {
  width: 48,
  height: 48,
  borderRadius: 24,
  _light: { backgroundColor: '#8b59a0' },
  _dark: { backgroundColor: '#c084dc' },
});

export default function LayoutCenterScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Center', headerShown: false }} />

      <ShowcaseSection
        title="Center"
        description="alignItems:center + justifyContent:center. Children are centered on both axes."
      >
        <Center
          height={100}
          borderRadius={8}
          _light={{ backgroundColor: '#fafafa' }}
          _dark={{ backgroundColor: '#1a1a1a' }}
        >
          <Dot />
        </Center>
        <AppText
          fontSize={12}
          _light={{ color: '#767676' }}
          _dark={{ color: '#a0a0a0' }}
        >
          The purple dot is centered inside the container.
        </AppText>
      </ShowcaseSection>
    </ScrollView>
  );
}
