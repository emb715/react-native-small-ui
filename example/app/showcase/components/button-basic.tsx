import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, Button, VStack } from '@/src/design-system/primitives';

export default function ButtonBasicScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Button', headerShown: false }} />

      <ShowcaseSection
        title="intent variant"
        description="5 intents — primary (default), secondary, ghost, destructive, outline."
      >
        <VStack>
          <Button intent="primary">
            <AppText
              fontWeight="600"
              fontSize={14}
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              primary
            </AppText>
          </Button>
          <Button intent="secondary" _dark={{ backgroundColor: '#6b3f80' }}>
            <AppText
              fontWeight="600"
              fontSize={14}
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              secondary
            </AppText>
          </Button>
          <Button
            intent="ghost"
            _dark={{ borderWidth: 1, borderColor: '#7a5a8a' }}
          >
            <AppText
              fontWeight="600"
              fontSize={14}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              ghost
            </AppText>
          </Button>
          <Button intent="destructive">
            <AppText
              fontWeight="600"
              fontSize={14}
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              destructive
            </AppText>
          </Button>
          <Button intent="outline">
            <AppText
              fontWeight="600"
              fontSize={14}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              outline
            </AppText>
          </Button>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="size variant"
        description="xs / sm / md (default) / lg."
      >
        <VStack>
          {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} size={size}>
              <AppText
                fontWeight="600"
                fontSize={
                  size === 'xs'
                    ? 11
                    : size === 'sm'
                      ? 12
                      : size === 'lg'
                        ? 16
                        : 14
                }
                _light={{ color: '#fff' }}
                _dark={{ color: '#fff' }}
              >
                size=&quot;{size}&quot;
              </AppText>
            </Button>
          ))}
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
