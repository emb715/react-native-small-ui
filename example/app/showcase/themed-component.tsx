import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-small-ui/theme';
import { ShowcaseSection } from '@/src/components';
import {
  AppText,
  VStack,
  HStack,
  Box,
  Divider,
  Card,
} from '@/src/design-system/primitives';
import type { AppTheme } from '@/src/theme/types';

export default function ThemedComponentScreen() {
  const theme = useTheme() as AppTheme;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Theme-Driven Components' }} />

      <ShowcaseSection
        title="Theme-Driven Components"
        description="createComponent stays static. Pass theme tokens as props — components update instantly when the theme switches."
      >
        <Card
          _light={{
            backgroundColor: theme?.light?.card,
            borderColor: theme?.light?.border,
          }}
          _dark={{
            backgroundColor: theme?.dark?.card,
            borderColor: theme?.dark?.border,
          }}
        >
          <VStack gap={16} padding={16}>
            <HStack gap={12}>
              <Box
                width={48}
                height={48}
                borderRadius={24}
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: theme?.light?.primary ?? '#8b59a0' }}
              >
                <AppText fontWeight="700" fontSize={18} color="#fff">
                  A
                </AppText>
              </Box>
              <VStack gap={2}>
                <AppText fontWeight="700" fontSize={16}>
                  Alex Rivera
                </AppText>
                <AppText fontSize={13} opacity={0.7}>
                  Senior Engineer
                </AppText>
              </VStack>
            </HStack>

            <Divider />

            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              Active theme tokens:
            </AppText>
            <VStack gap={6}>
              {theme &&
                Object.entries(theme.light).map(([key, value]) => (
                  <HStack key={key} justifyContent="space-between">
                    <AppText
                      fontSize={12}
                      fontFamily={'monospace' as any}
                      _light={{ color: '#6b3d82' }}
                      _dark={{ color: '#c084dc' }}
                    >
                      {key}
                    </AppText>
                    <HStack gap={6}>
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: value as string,
                        }}
                      />
                      <AppText
                        fontSize={12}
                        _light={{ color: '#767676' }}
                        _dark={{ color: '#a0a0a0' }}
                      >
                        {value as string}
                      </AppText>
                    </HStack>
                  </HStack>
                ))}
            </VStack>
          </VStack>
        </Card>
      </ShowcaseSection>
    </ScrollView>
  );
}
