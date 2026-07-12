import { ScrollView, View, StyleSheet, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ColorUtils } from 'react-native-small-ui/theme';
import { getStatusBarStyle } from 'react-native-small-ui';
import {
  useColorMode,
  useColorModeValue,
} from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack, Box } from '@/src/design-system/primitives';

const SAMPLE_COLORS = ['#8b59a0', '#79a964', '#e09a59', '#e00c2c', '#0077b6'];
const ALPHA_LEVELS = [0.1, 0.25, 0.5, 0.75, 1.0];
const BRAND = '#8b59a0';

export default function ColorUtilsScreen() {
  const { isDark } = useColorMode();
  const bg = useColorModeValue('#ffffff', '#0f0f0f');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Color Utils', headerShown: false }} />
      <StatusBar barStyle={getStatusBarStyle(isDark ? '#121212' : '#ffffff')} />

      <ShowcaseSection
        title="ColorUtils.getHexAlpha"
        description="Add transparency to any hex color. Returns 8-digit hex (#rrggbbaa)."
      >
        {SAMPLE_COLORS.map((color) => (
          <VStack key={color} gap={4}>
            <AppText
              fontSize={12}
              fontFamily={'monospace' as any}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              {color}
            </AppText>
            <HStack gap={4}>
              {ALPHA_LEVELS.map((alpha) => (
                <View
                  key={alpha}
                  style={[
                    styles.swatch,
                    { backgroundColor: ColorUtils.getHexAlpha(color, alpha) },
                  ]}
                >
                  <AppText
                    fontSize={9}
                    _light={{ color: '#fff' }}
                    _dark={{ color: '#fff' }}
                  >
                    {alpha}
                  </AppText>
                </View>
              ))}
            </HStack>
          </VStack>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.toRgba"
        description="Convert hex to rgba() string — useful for web boxShadow and CSS properties."
      >
        <VStack gap={8}>
          {SAMPLE_COLORS.slice(0, 3).map((color) => (
            <HStack key={color} gap={8} alignItems="center">
              <View style={[styles.dot, { backgroundColor: color }]} />
              <AppText
                fontSize={12}
                fontFamily={'monospace' as any}
                _light={{ color: '#1a1a1a' }}
                _dark={{ color: '#f0f0f0' }}
              >
                {ColorUtils.toRgba(color, 0.6)}
              </AppText>
            </HStack>
          ))}
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.getContrastColor + getContrastMode"
        description="Returns #000 or #fff for maximum contrast (WCAG luminance)."
      >
        <HStack flexWrap="wrap" gap={8}>
          {SAMPLE_COLORS.map((color) => (
            <Box
              key={color}
              padding={12}
              borderRadius={8}
              alignItems="center"
              minWidth={72}
              style={{ backgroundColor: color }}
            >
              <AppText
                fontWeight="700"
                fontSize={12}
                style={{ color: ColorUtils.getContrastColor(color) }}
              >
                Aa
              </AppText>
              <AppText
                fontSize={10}
                opacity={0.7}
                style={{ color: ColorUtils.getContrastColor(color) }}
              >
                {ColorUtils.getContrastMode(color)}
              </AppText>
            </Box>
          ))}
        </HStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.getContrastRatio"
        description="WCAG contrast ratio (1–21). ≥4.5 passes AA for normal text."
      >
        <VStack gap={8}>
          {SAMPLE_COLORS.map((color) => {
            const ratio = ColorUtils.getContrastRatio(
              color,
              isDark ? '#121212' : '#ffffff'
            );
            const passes = ratio >= 4.5;
            return (
              <HStack key={color} gap={8} alignItems="center">
                <View style={[styles.dot, { backgroundColor: color }]} />
                <AppText
                  fontSize={13}
                  fontFamily={'monospace' as any}
                  _light={{ color: '#1a1a1a' }}
                  _dark={{ color: '#f0f0f0' }}
                >
                  {ratio}
                </AppText>
                <AppText
                  fontSize={11}
                  fontWeight="600"
                  _light={{ color: passes ? '#2d7a2d' : '#c0392b' }}
                  _dark={{ color: passes ? '#8fc477' : '#ff6b80' }}
                >
                  {passes ? 'AA ✓' : 'fail'}
                </AppText>
              </HStack>
            );
          })}
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.darken + lighten"
        description="Adjust HSL lightness — preserves hue and saturation."
      >
        <VStack gap={8}>
          <AppText
            fontSize={11}
            fontWeight="700"
            letterSpacing={0.5}
            _light={{ color: '#6b3d82' }}
            _dark={{ color: '#c084dc' }}
          >
            DARKEN ← {BRAND} → LIGHTEN
          </AppText>
          <HStack gap={4}>
            {[0.3, 0.2, 0.1, 0, 0.1, 0.2, 0.3, 0.4].map((amount, i) => {
              const color =
                i < 3
                  ? ColorUtils.darken(BRAND, amount)
                  : i === 3
                    ? BRAND
                    : ColorUtils.lighten(BRAND, amount);
              return (
                <View
                  key={i}
                  style={[styles.swatch, { backgroundColor: color, flex: 1 }]}
                />
              );
            })}
          </HStack>
          <AppText
            fontSize={11}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            darken(0.3) → darken(0.1) → base → lighten(0.1) → lighten(0.4)
          </AppText>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.mix"
        description="Linear interpolation between two colors. weight=0 → color1, weight=1 → color2."
      >
        <VStack gap={8}>
          {[
            { c1: '#8b59a0', c2: '#ffffff', label: 'primary → white' },
            { c1: '#e00c2c', c2: '#8b59a0', label: 'red → purple' },
            { c1: '#0077b6', c2: '#79a964', label: 'blue → green' },
          ].map(({ c1, c2, label }) => (
            <VStack key={label} gap={4}>
              <AppText
                fontSize={11}
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                {label}
              </AppText>
              <HStack gap={4}>
                {[0, 0.25, 0.5, 0.75, 1].map((w) => (
                  <View
                    key={w}
                    style={[
                      styles.swatch,
                      { backgroundColor: ColorUtils.mix(c1, c2, w), flex: 1 },
                    ]}
                  />
                ))}
              </HStack>
            </VStack>
          ))}
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="getStatusBarStyle"
        description="Returns 'light-content' or 'dark-content' based on background color contrast."
      >
        <Box
          padding={16}
          borderRadius={8}
          borderWidth={1}
          _light={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}
          _dark={{ backgroundColor: '#1e1e1e', borderColor: '#2a2a2a' }}
        >
          <AppText
            fontSize={13}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Current page background:{' '}
            <AppText fontWeight="700" fontFamily={'monospace' as any}>
              {isDark ? '#121212' : '#ffffff'}
            </AppText>
          </AppText>
          <AppText
            fontSize={13}
            marginTop={4}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            StatusBar style:{' '}
            <AppText fontWeight="700" fontFamily={'monospace' as any}>
              {getStatusBarStyle(isDark ? '#121212' : '#ffffff')}
            </AppText>
          </AppText>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection
        title="useColorModeValue"
        description="Returns different values for light vs dark mode."
      >
        <Box
          padding={16}
          borderRadius={8}
          borderWidth={1}
          _light={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}
          _dark={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}
        >
          <AppText
            fontSize={13}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            Current value:{' '}
            <AppText fontWeight="700" fontFamily={'monospace' as any}>
              {bg as string}
            </AppText>
          </AppText>
          <AppText
            fontSize={12}
            marginTop={4}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            useColorModeValue('#ffffff', '#0f0f0f') — reactive to color mode
          </AppText>
        </Box>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  swatch: {
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
