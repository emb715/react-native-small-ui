import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { View, Text } from 'react-native';
import {
  useColorMode,
  useCustomColorMode,
  setCustomColorMode,
  clearCustomColorMode,
} from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack } from '@/src/design-system/primitives';

// ── Module-level component with custom color mode styles ──────────────────────

const ArticleContainer = createComponent(View, {
  padding: 20,
  borderRadius: 12,
  _light: { backgroundColor: '#ffffff' },
  _dark: { backgroundColor: '#1a1a1a' },
  _sepia: { backgroundColor: '#f4e9d0' },
  _highContrast: { backgroundColor: '#000000' },
});

const ArticleText = createComponent(Text, {
  fontSize: 15,
  lineHeight: 24,
  _light: { color: '#1a1a1a' },
  _dark: { color: '#f0f0f0' },
  _sepia: { color: '#3b2a1a' },
  _highContrast: { color: '#ffffff' },
});

// ── Screen ───────────────────────────────────────────────────────────────────

export default function CustomColorModeScreen() {
  const { isDark } = useColorMode();
  const { activeMode } = useCustomColorMode();

  const modes = [
    { key: null, label: 'Default', emoji: '🔆' },
    { key: 'sepia', label: 'Sepia', emoji: '📜' },
    { key: 'highContrast', label: 'High Contrast', emoji: '⬛' },
  ] as const;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Custom Color Modes' }} />

      <ShowcaseSection
        title="setCustomColorMode"
        description="Registered in configure({ colorModes }). Activates _sepia or _highContrast style props app-wide."
      >
        <HStack flexWrap="wrap" gap={8}>
          {modes.map(({ key, label, emoji }) => {
            const isActive = activeMode === key;
            return (
              <TouchableOpacity
                key={String(key)}
                style={[
                  styles.modeBtn,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? '#2d1a3e'
                        : '#f3eaf8'
                      : isDark
                        ? '#1a1a1a'
                        : '#f9f9f9',
                    borderColor: isActive
                      ? isDark
                        ? '#c084dc'
                        : '#6b3d82'
                      : isDark
                        ? '#2a2a2a'
                        : '#e5e5e5',
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
                onPress={() =>
                  key === null
                    ? clearCustomColorMode()
                    : setCustomColorMode(key)
                }
                activeOpacity={0.7}
              >
                <AppText fontSize={18}>{emoji}</AppText>
                <AppText
                  fontSize={12}
                  fontWeight={isActive ? '700' : '400'}
                  _light={{ color: isActive ? '#6b3d82' : '#1a1a1a' }}
                  _dark={{ color: isActive ? '#c084dc' : '#f0f0f0' }}
                >
                  {label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Live preview"
        description="Article renders with the active mode's styles"
      >
        <ArticleContainer>
          <VStack gap={8}>
            <ArticleText fontWeight="700" fontSize={17}>
              The Art of Reading
            </ArticleText>
            <ArticleText>
              Custom color modes let you define named visual states beyond light
              and dark. Each mode is a set of style overrides applied globally
              to any component that declares a corresponding underscore-prefixed
              prop.
            </ArticleText>
            <ArticleText fontSize={13} opacity={0.7}>
              Active mode: {activeMode ?? 'default (none)'}
            </ArticleText>
          </VStack>
        </ArticleContainer>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modeBtn: {
    flex: 1,
    minWidth: 90,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
});
