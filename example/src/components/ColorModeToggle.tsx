import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  toggleColorScheme,
  useColorMode,
} from 'react-native-small-ui/colormode';

/**
 * Header toggle button for light/dark mode.
 * Place in headerRight of any Stack or Tabs screenOptions.
 * Icon-only — space-efficient for navigation chrome.
 */
export function ColorModeToggle() {
  const { isDark } = useColorMode();

  return (
    <TouchableOpacity
      style={[styles.btn, isDark ? styles.btnDark : styles.btnLight]}
      onPress={toggleColorScheme}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      }
    >
      <Text>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLight: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  btnDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
});
