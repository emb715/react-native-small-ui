import { ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { createPressable } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack } from '@/src/design-system/primitives';

// ── Basic pressable with pressed + hovered state ─────────────────────────────
const PressableCard = createPressable({
  base: {
    padding: 16,
    borderRadius: 12,
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
      boxShadow: '0 2px 12px rgba(139,89,160,0.15)',
      cursor: 'pointer',
    } as any,
  },
});

// ── Pressable button with intent variants ─────────────────────────────────────
const PressableButton = createPressable({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  variants: {
    intent: {
      primary: {
        _light: { backgroundColor: '#8b59a0' },
        _dark: { backgroundColor: '#a070b8' },
      },
      destructive: {
        _light: { backgroundColor: '#e00c2c' },
        _dark: { backgroundColor: '#be0a25' },
      },
    },
  },
  defaultVariants: { intent: 'primary' },
  _pressed: {
    opacity: 0.8,
  },
  _hovered: {
    _web: { opacity: 0.92, cursor: 'pointer' } as any,
  },
});

// ── Pressable icon button ─────────────────────────────────────────────────────
const IconButton = createPressable({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    _light: { backgroundColor: '#f3eaf8' },
    _dark: { backgroundColor: '#2d1a3e' },
  },
  _pressed: {
    _light: { backgroundColor: '#e8d5f5' },
    _dark: { backgroundColor: '#3d2a4e' },
  },
  _hovered: {
    _web: { cursor: 'pointer', opacity: 0.85 } as any,
  },
});

export default function PressableScreen() {
  const { isDark } = useColorMode();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen
        options={{ title: 'createPressable', headerShown: false }}
      />

      <ShowcaseSection
        title="createPressable"
        description="Wraps Pressable with _pressed and _hovered style support. Press and hold to see the state change."
      >
        <PressableCard>
          <VStack gap={4}>
            <AppText
              fontWeight="600"
              _light={{ color: '#1a1a1a' }}
              _dark={{ color: '#f0f0f0' }}
            >
              Press and hold this card
            </AppText>
            <AppText
              fontSize={12}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              Background and border change via _pressed styles. On web, hover
              shows a shadow via _hovered.
            </AppText>
          </VStack>
        </PressableCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="_pressed + variants"
        description="Interactive state styles compose with the variant system."
      >
        <VStack gap={8}>
          <PressableButton intent="primary">
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              Primary
            </Text>
          </PressableButton>
          <PressableButton intent="destructive">
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              Destructive
            </Text>
          </PressableButton>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="_hovered (web)"
        description="Hover styles via onHoverIn/onHoverOut — no-op on iOS/Android, active on web."
      >
        <HStack gap={12}>
          <IconButton>
            <AppText fontSize={20}>★</AppText>
          </IconButton>
          <IconButton>
            <AppText fontSize={20}>♥</AppText>
          </IconButton>
          <IconButton>
            <AppText fontSize={20}>↗</AppText>
          </IconButton>
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
