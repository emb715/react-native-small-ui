import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack } from '@/src/design-system/primitives';

// ── ctx.colorMode — color derived directly from the factory context
const ColorModeCard = createComponent(View, (ctx) => ({
  padding: 20,
  borderRadius: 12,
  backgroundColor: ctx.colorMode === 'dark' ? '#1e1e1e' : '#f8f4fc',
  borderWidth: 1,
  borderColor: ctx.colorMode === 'dark' ? '#3a2a4a' : '#d4b8e8',
}));

// ── ctx.breakpoint() — padding scales with screen width
const ResponsiveCard = createComponent(View, (ctx) => ({
  padding: ctx.breakpoint({ default: 8, sm: 16, md: 24, lg: 32 }) ?? 8,
  borderRadius: 8,
  backgroundColor: ctx.colorMode === 'dark' ? '#1e1e1e' : '#ffffff',
  borderWidth: 1,
  borderColor: ctx.colorMode === 'dark' ? '#2a2a2a' : '#e5e5e5',
}));

// ── Both together — responsive sizing + color mode in one factory
const AdaptiveBadge = createComponent(View, (ctx) => ({
  paddingVertical: ctx.breakpoint({ default: 4, md: 6 }) ?? 4,
  paddingHorizontal: ctx.breakpoint({ default: 8, md: 12 }) ?? 8,
  borderRadius: 9999,
  backgroundColor: ctx.colorMode === 'dark' ? '#2d1a3e' : '#f3eaf8',
}));

export default function CtxFactoryScreen() {
  const { isDark } = useColorMode();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'ctx Factory', headerShown: false }} />

      <ShowcaseSection
        title="ctx.colorMode"
        description="Pass a function to createComponent to access ctx.colorMode directly — use it inline instead of _light/_dark props."
      >
        <ColorModeCard>
          <VStack>
            <AppText
              fontWeight="600"
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              ctx.colorMode = &quot;{isDark ? 'dark' : 'light'}&quot;
            </AppText>
            <AppText
              fontSize={12}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              Background and border chosen via ctx.colorMode in the factory
              function — not via _light/_dark props.
            </AppText>
          </VStack>
        </ColorModeCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="ctx.breakpoint()"
        description="ctx.breakpoint() resolves a value map to the current screen width. Components only subscribe to the breakpoints they actually read."
      >
        <ResponsiveCard>
          <VStack>
            <AppText
              fontWeight="600"
              _light={{ color: '#1a1a1a' }}
              _dark={{ color: '#f0f0f0' }}
            >
              Padding: {'{'}default:8, sm:16, md:24, lg:32{'}'}
            </AppText>
            <AppText
              fontSize={12}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              Resize the preview window to see the padding update. The component
              re-renders only when the active breakpoint changes.
            </AppText>
          </VStack>
        </ResponsiveCard>
      </ShowcaseSection>

      <ShowcaseSection
        title="Both together"
        description="A single factory function using both ctx.colorMode and ctx.breakpoint() — responsive sizing that is also color-mode aware."
      >
        <HStack gap={8} flexWrap="wrap">
          <AdaptiveBadge>
            <AppText
              fontSize={12}
              fontWeight="600"
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              primary
            </AppText>
          </AdaptiveBadge>
          <AdaptiveBadge>
            <AppText
              fontSize={12}
              fontWeight="600"
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              secondary
            </AppText>
          </AdaptiveBadge>
          <AdaptiveBadge>
            <AppText
              fontSize={12}
              fontWeight="600"
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              tertiary
            </AppText>
          </AdaptiveBadge>
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
