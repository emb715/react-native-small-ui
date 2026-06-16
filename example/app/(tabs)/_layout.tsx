import { Tabs } from 'expo-router';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ColorModeToggle } from '@/src/components';

export default function TabLayout() {
  const { isDark } = useColorMode();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <ColorModeToggle />,
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
        tabBarActiveTintColor: isDark ? '#c084dc' : '#8b59a0',
        tabBarInactiveTintColor: isDark ? '#555' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
          borderTopColor: isDark ? '#1a1a1a' : '#e5e5e5',
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Components',
          tabBarLabel: 'Components',
        }}
      />
      <Tabs.Screen
        name="responsive"
        options={{
          title: 'Responsive',
          tabBarLabel: 'Responsive',
        }}
      />
      <Tabs.Screen
        name="theming"
        options={{
          title: 'Theming',
          tabBarLabel: 'Theming',
        }}
      />
      <Tabs.Screen
        name="presets"
        options={{
          title: 'Presets',
          tabBarLabel: 'Presets',
        }}
      />
    </Tabs>
  );
}
