import { Stack } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ColorModeToggle } from '@/src/components';

export default function ShowcaseLayout() {
  const { isDark } = useColorMode();

  return (
    <Stack
      screenOptions={{
        headerRight: () => <ColorModeToggle />,
        headerStyle: {
          backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
        },
        headerTintColor: isDark ? '#c084dc' : '#8b59a0',
        headerBackTitle: 'Back',
        headerTitleStyle: {
          fontWeight: '600',
          color: isDark ? '#f0f0f0' : '#1a1a1a',
        },
      }}
    />
  );
}
