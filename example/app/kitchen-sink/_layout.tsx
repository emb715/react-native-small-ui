import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ColorModeToggle } from '@/src/components';

export default function KitchenSinkLayout() {
  const { isDark } = useColorMode();
  return (
    <Stack
      screenOptions={{
        headerRight: () => <ColorModeToggle />,
        headerBackTitle: 'Kitchen Sink',
        headerStyle: {
          backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? '#1a1a1a' : '#e5e5e5',
        },
        headerTintColor: isDark ? '#c084dc' : '#6b3d82',
        headerTitleStyle: {
          fontWeight: '600',
          color: isDark ? '#f0f0f0' : '#1a1a1a',
        },
      }}
    />
  );
}
