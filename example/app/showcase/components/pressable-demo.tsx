import { ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { createPressable } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

const DemoCard = createPressable({
  base: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    _light: { backgroundColor: '#ffffff', borderColor: '#e5e5e5' },
    _dark: { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' },
  },
  _pressed: {
    _light: { backgroundColor: '#f3eaf8', borderColor: '#8b59a0' },
    _dark: { backgroundColor: '#2d1a3e', borderColor: '#8b59a0' },
  },
  _hovered: {
    _web: {
      boxShadow: '0 2px 8px rgba(139,89,160,0.2)',
      cursor: 'pointer',
    } as any,
  },
});

const DemoButton = createPressable({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
    _light: { backgroundColor: '#8b59a0' },
    _dark: { backgroundColor: '#a070b8' },
  },
  _pressed: { opacity: 0.8 },
  _hovered: {
    _web: { opacity: 0.92, cursor: 'pointer' } as any,
  },
  _focused: {
    borderColor: '#c084dc',
    _web: { outlineWidth: 0 } as any, // suppress default browser outline — use custom border instead
  },
  _disabled: {
    opacity: 0.4,
    _light: { backgroundColor: '#c0a3cc' },
    _dark: { backgroundColor: '#5a4068' },
  },
});

export default function PressableDemoScreen() {
  const { isDark } = useColorMode();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <Stack.Screen options={{ title: 'Pressable', headerShown: false }} />

      <ShowcaseSection
        title="_pressed"
        description="Press and hold to see the card highlight."
      >
        <DemoCard>
          <AppText
            fontWeight="600"
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Press and hold
          </AppText>
          <AppText
            fontSize={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            _pressed styles apply on press-in, reset on press-out.
          </AppText>
        </DemoCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="_pressed + _hovered"
        description="Opacity on press. Hover adds web shadow."
      >
        <VStack gap={8}>
          <DemoButton>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Press me</Text>
          </DemoButton>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="_focused"
        description="Focus ring appears on keyboard/tab navigation (web) and screen readers. No-op on touch."
      >
        <DemoButton>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Tab to focus</Text>
        </DemoButton>
      </ShowcaseSection>

      <ShowcaseSection
        title="_disabled"
        description="Opacity and border applied when disabled=true. No events needed — reads props.disabled."
      >
        <VStack gap={8}>
          <DemoButton disabled>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Disabled</Text>
          </DemoButton>
          <DemoButton>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Enabled</Text>
          </DemoButton>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
