import { Pressable, Text } from 'react-native';
import { toggleColorScheme, useColorMode } from '../useColorMode';

export const TEST_ID_BUTTON = 'toggle-color_button';
export const TEST_ID_TEXT = 'toggle-color_text';

export function ToggleColorTest() {
  const { colorMode } = useColorMode();

  const onPress = () => {
    toggleColorScheme();
  };

  return (
    <Pressable onPress={onPress} testID={TEST_ID_BUTTON}>
      <Text testID={TEST_ID_TEXT}>current {colorMode}</Text>
    </Pressable>
  );
}
