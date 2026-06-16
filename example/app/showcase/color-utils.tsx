import { ScrollView, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ColorUtils } from 'react-native-small-ui/theme';
import { useColorModeValue } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack, Box } from '@/src/design-system/primitives';

const SAMPLE_COLORS = ['#8b59a0', '#79a964', '#e09a59', '#e00c2c', '#0077b6'];
const ALPHA_LEVELS = [0.1, 0.25, 0.5, 0.75, 1.0];

export default function ColorUtilsScreen() {
  const bg = useColorModeValue('#ffffff', '#0f0f0f');

  return (
    <ScrollView
      style={{ backgroundColor: bg as string }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'ColorUtils' }} />

      <ShowcaseSection
        title="ColorUtils.getHexAlpha"
        description="Add transparency to any hex color."
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
                  <AppText fontSize={9} color="#fff" textAlign="center">
                    {alpha}
                  </AppText>
                </View>
              ))}
            </HStack>
          </VStack>
        ))}
      </ShowcaseSection>

      <ShowcaseSection
        title="ColorUtils.getContrastColor"
        description="Returns #000 or #fff for maximum contrast."
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
          <AppText fontSize={13}>
            Current background:{' '}
            <AppText fontWeight="700" fontFamily={'monospace' as any}>
              {bg as string}
            </AppText>
          </AppText>
          <AppText
            fontSize={12}
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
    flex: 1,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
