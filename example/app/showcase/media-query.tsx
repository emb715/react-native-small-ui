import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useMediaQuery } from 'react-native-small-ui/utils';
import { ShowcaseSection } from '@/src/components';
import { AppText, HStack, VStack, Box } from '@/src/design-system/primitives';

export default function MediaQueryScreen() {
  const isWide = useMediaQuery('(min-width: 640px)');
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'useMediaQuery' }} />

      <ShowcaseSection
        title="useMediaQuery"
        description="CSS-like media query matching. Returns a boolean that updates on resize."
      >
        <VStack>
          {[
            { query: '(min-width: 640px)', value: isWide },
            { query: '(min-width: 1024px)', value: isLarge },
            { query: '(orientation: portrait)', value: isPortrait },
          ].map(({ query, value }) => (
            <HStack key={query} style={{ justifyContent: 'space-between' }}>
              <AppText
                fontSize={12}
                style={{ fontFamily: 'monospace' as any }}
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                {query}
              </AppText>
              <Box
                paddingVertical={2}
                paddingHorizontal={8}
                borderRadius={4}
                _light={{ backgroundColor: value ? '#edf7ea' : '#fdecea' }}
                _dark={{ backgroundColor: value ? '#1a3d1a' : '#3d0a0a' }}
              >
                <AppText
                  fontWeight="700"
                  fontSize={12}
                  _light={{ color: value ? '#166534' : '#9b1c1c' }}
                  _dark={{ color: value ? '#86efac' : '#fca5a5' }}
                >
                  {value ? 'true' : 'false'}
                </AppText>
              </Box>
            </HStack>
          ))}
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Layout response"
        description="Sidebar visible when min-width: 640px"
      >
        <HStack style={{ gap: 12, alignItems: 'flex-start' }}>
          {isWide && (
            <Box
              width={120}
              padding={12}
              borderRadius={8}
              _light={{
                backgroundColor: '#f3eaf8',
                borderColor: '#c0a3cc',
                borderWidth: 1,
              }}
              _dark={{
                backgroundColor: '#1a0d2e',
                borderColor: '#4a2a5e',
                borderWidth: 1,
              }}
            >
              <AppText
                fontSize={12}
                fontWeight="600"
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                Sidebar
              </AppText>
              <AppText
                fontSize={11}
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                {'>= 640px'}
              </AppText>
            </Box>
          )}
          <Box
            flex={1}
            padding={12}
            borderRadius={8}
            _light={{
              backgroundColor: '#f9f9f9',
              borderColor: '#e5e5e5',
              borderWidth: 1,
            }}
            _dark={{
              backgroundColor: '#1a1a1a',
              borderColor: '#2a2a2a',
              borderWidth: 1,
            }}
          >
            <AppText fontSize={12} fontWeight="600">
              Main content
            </AppText>
            <AppText
              fontSize={11}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              {isWide ? 'Sidebar visible' : 'Full width — sidebar hidden'}
            </AppText>
          </Box>
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
