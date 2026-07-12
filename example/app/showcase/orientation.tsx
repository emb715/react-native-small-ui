import { ScrollView, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useOrientation } from 'react-native-small-ui/utils';
import { ShowcaseSection } from '@/src/components';
import { AppText, Box } from '@/src/design-system/primitives';

export default function OrientationScreen() {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'useOrientation' }} />

      <ShowcaseSection
        title="useOrientation"
        description="Returns 'portrait' or 'landscape'. Updates reactively on device rotation."
      >
        <Box
          padding={20}
          borderRadius={12}
          alignItems="center"
          _light={{ backgroundColor: '#f3eaf8' }}
          _dark={{ backgroundColor: '#1a0d2e' }}
        >
          <AppText fontSize={48}>{isLandscape ? '📺' : '📱'}</AppText>
          <AppText
            fontWeight="700"
            fontSize={20}
            _light={{ color: '#6b3d82' }}
            _dark={{ color: '#c084dc' }}
          >
            {orientation}
          </AppText>
          <AppText
            fontSize={13}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            Rotate your device to see this update
          </AppText>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection
        title="Adaptive layout"
        description="Stack in portrait, row in landscape"
      >
        <View style={isLandscape ? styles.row : styles.column}>
          {['Primary', 'Secondary', 'Action'].map((label, i) => (
            <Box
              key={label}
              flex={1}
              padding={16}
              borderRadius={8}
              alignItems="center"
              _light={{
                backgroundColor:
                  i === 0 ? '#f3eaf8' : i === 1 ? '#edf7ea' : '#fdf6e3',
              }}
              _dark={{
                backgroundColor:
                  i === 0 ? '#1a0d2e' : i === 1 ? '#0d2e0d' : '#2e2000',
              }}
            >
              <AppText fontWeight="600" fontSize={14}>
                {label}
              </AppText>
            </Box>
          ))}
        </View>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  column: { flexDirection: 'column', gap: 12 },
});
