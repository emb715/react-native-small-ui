import { StyleSheet, Text } from 'react-native';
import { useColorMode } from 'react-native-small-ui/colormode';

interface ApiLabelProps {
  children: string;
}

export function ApiLabel({ children }: ApiLabelProps) {
  const { isDark } = useColorMode();
  return (
    <Text
      style={[
        styles.label,
        {
          backgroundColor: isDark ? '#1a0d2e' : '#f3eaf8',
          color: isDark ? '#c084dc' : '#6b3d82',
        },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace' as any,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});
