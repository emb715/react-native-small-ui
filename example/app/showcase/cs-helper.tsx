import { ScrollView, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { cs, createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack } from '@/src/design-system/primitives';

const Card = createComponent(View, {
  padding: 16,
  borderRadius: 10,
  borderWidth: 1,
  _light: { backgroundColor: '#ffffff', borderColor: '#e5e5e5' },
  _dark: { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' },
});

const Badge = createComponent(View, {
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 9999,
  _light: { backgroundColor: '#f3eaf8' },
  _dark: { backgroundColor: '#2d1a3e' },
});

export default function CsHelperScreen() {
  const { isDark } = useColorMode();
  const [selected, setSelected] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const cardStyle = cs(
    {
      padding: 16,
      borderRadius: 10,
      borderWidth: 1,
    },
    isDark
      ? { backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' }
      : { backgroundColor: '#ffffff', borderColor: '#e5e5e5' },
    selected && {
      borderColor: '#8b59a0',
      borderWidth: 2,
      _light: { backgroundColor: '#f8f4fc' },
      _dark: { backgroundColor: '#1a0d2e' },
    },
    disabled && { opacity: 0.4 }
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'cs()', headerShown: false }} />

      <ShowcaseSection
        title="cs() — conditional styles"
        description="Merge base styles with conditionally applied overrides. Falsy values are ignored."
      >
        <VStack gap={12}>
          <TouchableOpacity onPress={() => setSelected((s) => !s)}>
            <View style={cardStyle}>
              <AppText
                fontWeight="600"
                _light={{ color: '#1a1a1a' }}
                _dark={{ color: '#f0f0f0' }}
              >
                {selected ? 'Selected ✓' : 'Tap to select'}
              </AppText>
              <AppText
                fontSize={12}
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                cs() merges base + conditional selected style. Border and
                background change when selected=true.
              </AppText>
            </View>
          </TouchableOpacity>

          <HStack gap={8}>
            <TouchableOpacity
              onPress={() => setSelected((s) => !s)}
              style={{ flex: 1 }}
            >
              <Card
                _light={{
                  borderColor: selected ? '#8b59a0' : '#e5e5e5',
                  backgroundColor: selected ? '#f8f4fc' : '#ffffff',
                }}
                _dark={{
                  borderColor: selected ? '#8b59a0' : '#2a2a2a',
                  backgroundColor: selected ? '#1a0d2e' : '#1e1e1e',
                }}
                borderWidth={selected ? 2 : 1}
              >
                <AppText
                  fontSize={12}
                  _light={{ color: '#6b3d82' }}
                  _dark={{ color: '#c084dc' }}
                >
                  selected: {String(selected)}
                </AppText>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDisabled((d) => !d)}
              style={{ flex: 1 }}
            >
              <Card opacity={disabled ? 0.4 : 1}>
                <AppText
                  fontSize={12}
                  _light={{ color: '#767676' }}
                  _dark={{ color: '#a0a0a0' }}
                >
                  disabled: {String(disabled)}
                </AppText>
              </Card>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Falsy filtering"
        description="false, null, undefined, 0, '' are all ignored — safe to use inline conditions without guards."
      >
        <HStack gap={8} flexWrap="wrap">
          {[true, false, true, false, true].map((active, i) => (
            <Badge
              key={i}
              style={cs(
                {
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  borderRadius: 9999,
                },
                isDark
                  ? { backgroundColor: '#2d1a3e' }
                  : { backgroundColor: '#f3eaf8' },
                active && { borderWidth: 1.5, borderColor: '#8b59a0' },
                !active && { opacity: 0.45 },
                false,
                null,
                undefined
              )}
            >
              <AppText
                fontSize={12}
                fontWeight="600"
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                {active ? 'active' : 'off'}
              </AppText>
            </Badge>
          ))}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Last-write-wins"
        description="When two objects share a key, the later argument wins. Predictable, no magic."
      >
        <VStack gap={8}>
          <AppText
            fontSize={12}
            fontFamily={'monospace' as any}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            {'cs({ padding: 8 }, { padding: 16, margin: 4 })'}
          </AppText>
          <Card>
            <AppText
              fontSize={13}
              _light={{ color: '#1a1a1a' }}
              _dark={{ color: '#f0f0f0' }}
            >
              Result:{' '}
              <AppText fontWeight="700" fontFamily={'monospace' as any}>
                {JSON.stringify(cs({ padding: 8 }, { padding: 16, margin: 4 }))}
              </AppText>
            </AppText>
            <AppText
              fontSize={12}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              padding:8 is overridden by padding:16 — last arg wins on conflict.
            </AppText>
          </Card>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
