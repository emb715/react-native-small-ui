import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ShowcaseSection } from '@/src/components';
import {
  Card,
  Button,
  AppText,
  VStack,
  HStack,
  Divider,
} from '@/src/design-system/primitives';

export default function SlotsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: '.withSlots()' }} />

      <ShowcaseSection
        title=".withSlots()"
        description="Card.Header, Card.Body, Card.Footer — compound component via dot notation."
      >
        <Card>
          <Card.Header>
            <VStack gap={2}>
              <AppText fontWeight="700" fontSize={16}>
                Alex Rivera
              </AppText>
              <AppText
                fontSize={13}
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                Senior Engineer · San Francisco
              </AppText>
            </VStack>
          </Card.Header>

          <Card.Body>
            <VStack>
              <AppText fontSize={14}>
                Building developer tools and design systems. Open source
                contributor.
              </AppText>
              <Divider />
              <HStack gap={16}>
                <VStack gap={2}>
                  <AppText fontWeight="700" fontSize={16}>
                    142
                  </AppText>
                  <AppText
                    fontSize={12}
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    Projects
                  </AppText>
                </VStack>
                <VStack gap={2}>
                  <AppText fontWeight="700" fontSize={16}>
                    3.4k
                  </AppText>
                  <AppText
                    fontSize={12}
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    Stars
                  </AppText>
                </VStack>
                <VStack gap={2}>
                  <AppText fontWeight="700" fontSize={16}>
                    89
                  </AppText>
                  <AppText
                    fontSize={12}
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    PRs merged
                  </AppText>
                </VStack>
              </HStack>
            </VStack>
          </Card.Body>

          <Card.Footer>
            <Button size="sm" intent="outline">
              <AppText
                fontWeight="600"
                fontSize={13}
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                Follow
              </AppText>
            </Button>
            <Button size="sm">
              <AppText
                fontWeight="600"
                fontSize={13}
                _light={{ color: '#fff' }}
                _dark={{ color: '#fff' }}
              >
                Message
              </AppText>
            </Button>
          </Card.Footer>
        </Card>
      </ShowcaseSection>
    </ScrollView>
  );
}
