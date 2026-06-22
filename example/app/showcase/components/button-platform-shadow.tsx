import { ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack } from '@/src/design-system/primitives';

const ShadowButton = createComponent(TouchableOpacity, {
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    _light: { backgroundColor: '#8b59a0' },
    _dark: { backgroundColor: '#a070b8' },
    _ios: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    _android: { elevation: 4 },
    _web: { boxShadow: '0 2px 8px rgba(0,0,0,0.25)' as any },
  },
});

const FlatButton = createComponent(TouchableOpacity, {
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    _light: { backgroundColor: '#8b59a0' },
    _dark: { backgroundColor: '#a070b8' },
  },
});

export default function ButtonPlatformShadowScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen
        options={{ title: 'Platform Shadow', headerShown: false }}
      />

      <ShowcaseSection
        title="Platform shadow"
        description="_ios uses shadow* props. _android uses elevation. _web uses boxShadow CSS."
      >
        <VStack>
          <ShadowButton
            _web={
              isDark
                ? ({ boxShadow: '0 2px 12px rgba(160,112,184,0.35)' } as any)
                : ({ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' } as any)
            }
          >
            <AppText
              fontWeight="600"
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              With shadow (_ios / _android / _web)
            </AppText>
          </ShadowButton>
          <FlatButton>
            <AppText
              fontWeight="600"
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              Without shadow (baseline)
            </AppText>
          </FlatButton>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
