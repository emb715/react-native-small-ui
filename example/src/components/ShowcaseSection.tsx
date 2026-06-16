import { StyleSheet, Text, View } from 'react-native';
import { useColorMode } from 'react-native-small-ui/colormode';

interface ShowcaseSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ShowcaseSection({
  title,
  description,
  children,
}: ShowcaseSectionProps) {
  const { isDark } = useColorMode();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#c084dc' : '#6b3d82' }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            styles.description,
            { color: isDark ? '#a0a0a0' : '#767676' },
          ]}
        >
          {description}
        </Text>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
});
