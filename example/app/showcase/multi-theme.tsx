import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme, useThemeName, setTheme } from 'react-native-small-ui/theme';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack, Box } from '@/src/design-system/primitives';
import { ThemedCard, ThemedText } from '@/src/design-system/themed';
import type { AppTheme } from '@/src/theme/types';

const THEMES = [
  { name: 'default', label: 'Default', emoji: '🟣' },
  { name: 'ocean', label: 'Ocean', emoji: '🔵' },
  { name: 'sunset', label: 'Sunset', emoji: '🟠' },
] as const;

export default function MultiThemeScreen() {
  const activeThemeName = useThemeName();
  const theme = useTheme() as AppTheme;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Multi-Theme' }} />

      <ShowcaseSection
        title="setTheme + useThemeName"
        description="Switch between registered themes at runtime. ThemedCard and ThemedText update instantly."
      >
        <HStack gap={8} flexWrap="wrap">
          {THEMES.map(({ name, label, emoji }) => {
            const isActive = activeThemeName === name;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: isActive
                      ? (theme?.light?.primary ?? '#8b59a0')
                      : 'transparent',
                    borderColor: isActive
                      ? (theme?.light?.primary ?? '#8b59a0')
                      : '#e5e5e5',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setTheme(name)}
                activeOpacity={0.7}
              >
                <AppText fontSize={18}>{emoji}</AppText>
                <AppText
                  fontSize={12}
                  fontWeight={isActive ? '700' : '400'}
                  _light={{ color: isActive ? '#fff' : '#1a1a1a' }}
                  _dark={{ color: isActive ? '#fff' : '#f0f0f0' }}
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
        description="Components update immediately on theme switch"
      >
        <ThemedCard>
          <VStack gap={8}>
            <ThemedText fontWeight="700" fontSize={16}>
              {activeThemeName} theme
            </ThemedText>
            <ThemedText fontSize={13} opacity={0.7}>
              This card and text read from the active theme's token set.
            </ThemedText>
            <HStack gap={8} flexWrap="wrap">
              {theme &&
                Object.entries(theme.light).map(([key, value]) => (
                  <Box
                    key={key}
                    padding={8}
                    borderRadius={6}
                    alignItems="center"
                    gap={4}
                    _light={{ backgroundColor: '#f9f9f9' }}
                    _dark={{ backgroundColor: '#1a1a1a' }}
                  >
                    <Box
                      width={28}
                      height={28}
                      borderRadius={14}
                      style={{ backgroundColor: value as string }}
                    />
                    <AppText
                      fontSize={9}
                      _light={{ color: '#767676' }}
                      _dark={{ color: '#a0a0a0' }}
                    >
                      {key}
                    </AppText>
                  </Box>
                ))}
            </HStack>
          </VStack>
        </ThemedCard>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  themeBtn: {
    flex: 1,
    minWidth: 80,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
});
