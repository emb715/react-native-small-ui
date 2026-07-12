import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { elevation, border, layout } from 'react-native-small-ui/presets';
import { ShowcaseSection } from '@/src/components';
import { AppText, HStack, Box } from '@/src/design-system/primitives';

// ── Module-level elevation demo cards ────────────────────────────────────────
// Spread the full elevation level — _ios, _android, and _web are all included.
// Web gets boxShadow; iOS gets shadow* props; Android gets elevation.

const elevationBase = {
  padding: 16,
  borderRadius: 8,
  alignItems: 'center' as const,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1e1e1e' },
};

const ElevNone = createComponent(View, { ...elevationBase, ...elevation.none });
const ElevXs = createComponent(View, { ...elevationBase, ...elevation.xs });
const ElevSm = createComponent(View, { ...elevationBase, ...elevation.sm });
const ElevMd = createComponent(View, { ...elevationBase, ...elevation.md });
const ElevLg = createComponent(View, { ...elevationBase, ...elevation.lg });

export default function PresetsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'Presets' }} />

      <ShowcaseSection
        title="elevation"
        description="Cross-platform shadow presets. _ios shadow + _android elevation."
      >
        <HStack
          style={{ flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}
        >
          {[
            { C: ElevNone, label: 'none' },
            { C: ElevXs, label: 'xs' },
            { C: ElevSm, label: 'sm' },
            { C: ElevMd, label: 'md' },
            { C: ElevLg, label: 'lg' },
          ].map(({ C, label }) => (
            <C key={label} style={{ minWidth: 56 }}>
              <AppText
                fontSize={11}
                fontWeight="600"
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                {label}
              </AppText>
            </C>
          ))}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="border"
        description="Border width and radius presets."
      >
        <HStack style={{ flexWrap: 'wrap', gap: 10 }}>
          {(['hairline', 'thin', 'medium', 'thick', 'pill'] as const).map(
            (key) => (
              <Box
                key={key}
                padding={12}
                borderRadius={key === 'pill' ? 9999 : 8}
                borderWidth={
                  key === 'hairline'
                    ? border.hairline.borderWidth
                    : key === 'thin'
                      ? border.thin.borderWidth
                      : key === 'medium'
                        ? border.medium.borderWidth
                        : key === 'thick'
                          ? border.thick.borderWidth
                          : 1
                }
                _light={{ borderColor: '#8b59a0', backgroundColor: '#f9f9f9' }}
                _dark={{ borderColor: '#a070b8', backgroundColor: '#1a1a1a' }}
              >
                <AppText
                  fontSize={11}
                  fontWeight="600"
                  _light={{ color: '#767676' }}
                  _dark={{ color: '#a0a0a0' }}
                >
                  {key}
                </AppText>
              </Box>
            )
          )}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="layout"
        description="Flex layout presets. Spread into createComponent."
      >
        <HStack style={{ flexWrap: 'wrap', gap: 8 }}>
          {Object.keys(layout).map((key) => (
            <Box
              key={key}
              padding={8}
              borderRadius={6}
              _light={{ backgroundColor: '#f3eaf8' }}
              _dark={{ backgroundColor: '#1a0d2e' }}
            >
              <AppText
                fontSize={11}
                fontWeight="600"
                style={{ fontFamily: 'monospace' as any }}
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                layout.{key}
              </AppText>
            </Box>
          ))}
        </HStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
