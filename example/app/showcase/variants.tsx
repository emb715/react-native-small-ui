import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import {
  Button,
  HStack,
  VStack,
  AppText,
} from '@/src/design-system/primitives';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const INTENTS = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
  'outline',
] as const;

export default function VariantsScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Variants' }} />

      <ShowcaseSection
        title="size variant"
        description="xs / sm / md (default) / lg — padding and gap scale together."
      >
        <HStack flexWrap="wrap" gap={8}>
          {SIZES.map((size) => (
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
                {size}
              </AppText>
            </Button>
          ))}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="intent variant"
        description="5 intents. Each defines _light and _dark backgrounds separately."
      >
        <VStack>
          {INTENTS.map((intent) => (
            <Button key={intent} intent={intent}>
              <AppText
                fontWeight="600"
                fontSize={14}
                _light={{
                  color:
                    intent === 'outline' || intent === 'ghost'
                      ? '#6b3d82'
                      : '#fff',
                }}
                _dark={{
                  color:
                    intent === 'outline' || intent === 'ghost'
                      ? '#c084dc'
                      : '#fff',
                }}
              >
                {intent}
              </AppText>
            </Button>
          ))}
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="compoundVariants"
        description="xs + destructive → 2px colored border. ghost + sm → reduced horizontal padding."
      >
        <HStack flexWrap="wrap" gap={8}>
          <Button size="xs" intent="destructive">
            <AppText
              fontWeight="600"
              fontSize={11}
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              xs + destructive
            </AppText>
          </Button>
          <Button size="sm" intent="ghost">
            <AppText
              fontWeight="600"
              fontSize={12}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              ghost + sm
            </AppText>
          </Button>
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="defaultVariants"
        description="Button without any variant props renders with size=md + intent=primary."
      >
        <Button>
          <AppText
            fontWeight="600"
            fontSize={14}
            _light={{ color: '#fff' }}
            _dark={{ color: '#fff' }}
          >
            Default (md + primary)
          </AppText>
        </Button>
      </ShowcaseSection>
    </ScrollView>
  );
}
