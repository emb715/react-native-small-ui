import { StyleSheet, View, Text, Pressable, Appearance } from 'react-native';
import {
  TinyBaseProvider,
  createComponent,
  useColorMode,
  useColorModeValue,
  useTheme,
  useTinyBase,
} from 'react-native-tinybase';

// TEST
const ExampleComponent = createComponent(View, (theme) => ({
  color: theme.colors.light.primary,
  borderColor: theme.utils.getHexAlpha(theme.colors.light.border, 0.5),
  borderWidth: 10,
  padding: 150,
  backgroundColor: 'blue',
  _light: {
    backgroundColor: 'blue',
  },
}));
const ExampleView = createComponent(View, {
  padding: 100,
  _light: {
    backgroundColor: 'blue',
  },
  _dark: {
    backgroundColor: 'orange',
  },
});
const ExampleText = createComponent(Text, {
  color: 'red',

  _light: {
    backgroundColor: '#fff',
  },
  _dark: {
    backgroundColor: 'orange',
  },
});
const ExamplePressable = createComponent(Pressable, {
  backgroundColor: 'red',
  _light: {
    backgroundColor: '#fff',
  },
  _dark: {
    backgroundColor: 'orange',
  },
});

function AppInner() {
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const colorValue = useColorModeValue('#fff', '#000');

  return (
    <View style={[styles.container, { backgroundColor: colorValue }]}>
      <ExampleView
        hitSlop={100}
        _light={{
          backgroundColor: 'yellow',
          // color: 'red',
        }}
        _dark={{
          backgroundColor: 'blue',
        }}
      >
        <ExampleText>{Appearance.getColorScheme()}</ExampleText>
        <ExampleText>Example</ExampleText>
      </ExampleView>
      <ExamplePressable
        style={(args) => ({
          backgroundColor: args.pressed ? '#0f0' : '#f11',
        })}
      >
        <ExampleText>
          {colorMode} {colorValue}
        </ExampleText>
      </ExamplePressable>
      <ExampleComponent>
        <ExampleText>
          {theme.utils.getHexAlpha(theme.colors.dark.primary, 0.5)}
        </ExampleText>
      </ExampleComponent>
    </View>
  );
}
export function App2() {
  // const colorMode = useColorMode();
  // const colorValue = useColorModeValue('#fff', '#000');
  return (
    <TinyBaseProvider>
      <AppInner />
    </TinyBaseProvider>
  );
}
export default function App() {
  useTinyBase();
  // const colorMode = useColorMode();
  // const colorValue = useColorModeValue('#fff', '#000');
  return <AppInner />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
