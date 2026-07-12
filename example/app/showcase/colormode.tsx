import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import {
  useColorMode,
  toggleColorScheme,
  setColorScheme,
} from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, HStack, Box } from '@/src/design-system/primitives';

export default function ColorModeScreen() {
  const { colorMode, isDark } = useColorMode();

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Color Mode' }} />

      <ShowcaseSection
        title="useColorMode"
        description="Current color mode from the store."
      >
        <Box
          padding={20}
          borderRadius={12}
          alignItems="center"
          _light={{ backgroundColor: '#f9f9f9' }}
          _dark={{ backgroundColor: '#1a1a1a' }}
        >
          <AppText fontSize={32}>{isDark ? '🌙' : '☀️'}</AppText>
          <AppText
            fontWeight="700"
            fontSize={20}
            _light={{ color: '#6b3d82' }}
            _dark={{ color: '#c084dc' }}
          >
            {colorMode}
          </AppText>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection
        title="toggleColorScheme"
        description="Flip between light and dark."
      >
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: isDark ? '#f5f5f5' : '#1a1a1a' },
          ]}
          onPress={toggleColorScheme}
          activeOpacity={0.7}
        >
          <AppText
            fontWeight="600"
            _light={{ color: '#ffffff' }}
            _dark={{ color: '#1a1a1a' }}
          >
            Toggle ({isDark ? 'switch to light' : 'switch to dark'})
          </AppText>
        </TouchableOpacity>
      </ShowcaseSection>

      <ShowcaseSection
        title="setColorScheme"
        description="Set a specific mode programmatically."
      >
        <HStack gap={12}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: '#f5f5f5',
                borderColor: colorMode === 'light' ? '#6b3d82' : '#e5e5e5',
                borderWidth: 2,
              },
            ]}
            onPress={() => setColorScheme('light')}
            activeOpacity={0.7}
          >
            <AppText fontWeight="600" color="#1a1a1a">
              ☀️ Light
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: '#1a1a1a',
                borderColor: colorMode === 'dark' ? '#c084dc' : '#2a2a2a',
                borderWidth: 2,
              },
            ]}
            onPress={() => setColorScheme('dark')}
            activeOpacity={0.7}
          >
            <AppText fontWeight="600" color="#f0f0f0">
              🌙 Dark
            </AppText>
          </TouchableOpacity>
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  modeBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
});
