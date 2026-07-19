import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useBreakpointValue } from 'react-native-small-ui/utils';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { AppText, VStack, HStack } from '@/src/design-system/primitives';

export default function BreakpointValueScreen() {
  const { isDark } = useColorMode();

  const columns = useBreakpointValue({ default: 1, sm: 2, lg: 3 });
  const fontSize = useBreakpointValue({ default: 14, md: 16, lg: 18 });
  const padding = useBreakpointValue({ default: 12, sm: 16, lg: 24 });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'useBreakPointValue' }} />

      <ShowcaseSection
        title="useBreakPointValue"
        description="Returns different values based on current window width. Resize to see changes."
      >
        <VStack>
          <HStack style={{ justifyContent: 'space-between' }}>
            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              columns
            </AppText>
            <AppText
              fontWeight="700"
              fontSize={18}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              {columns}
            </AppText>
          </HStack>
          <HStack style={{ justifyContent: 'space-between' }}>
            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              fontSize
            </AppText>
            <AppText
              fontWeight="700"
              fontSize={18}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              {fontSize}
            </AppText>
          </HStack>
          <HStack style={{ justifyContent: 'space-between' }}>
            <AppText
              fontSize={13}
              _light={{ color: '#767676' }}
              _dark={{ color: '#a0a0a0' }}
            >
              padding
            </AppText>
            <AppText
              fontWeight="700"
              fontSize={18}
              _light={{ color: '#6b3d82' }}
              _dark={{ color: '#c084dc' }}
            >
              {padding}
            </AppText>
          </HStack>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Live grid"
        description={`${columns} column(s) at current width`}
      >
        <View style={[styles.grid, { gap: 8 }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                {
                  width: `${100 / (columns as number)}%` as any,
                  padding: padding as number,
                  backgroundColor: isDark ? '#1e1e1e' : '#f3eaf8',
                  borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: fontSize as number,
                  fontWeight: '600',
                  color: isDark ? '#c084dc' : '#6b3d82',
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </Text>
            </View>
          ))}
        </View>
      </ShowcaseSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});
