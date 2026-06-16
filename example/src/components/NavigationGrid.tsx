import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { AppText } from '@/src/design-system/primitives';

export interface NavItem {
  label: string;
  description: string;
  route: string;
  api: string;
}

interface NavigationGridProps {
  items: NavItem[];
}

export function NavigationGrid({ items }: NavigationGridProps) {
  const router = useRouter();
  const { isDark } = useColorMode();

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
              borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
            },
          ]}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
        >
          <AppText
            style={styles.api}
            _light={{ color: '#6b3d82' }}
            _dark={{ color: '#c084dc' }}
          >
            {item.api}
          </AppText>
          <AppText
            style={styles.label}
            _light={{ color: '#1a1a1a' }}
            _dark={{ color: '#f0f0f0' }}
          >
            {item.label}
          </AppText>
          <AppText
            style={styles.description}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            {item.description}
          </AppText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  api: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
