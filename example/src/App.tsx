import {
  StyleSheet,
  View,
  Text as RNText,
  Pressable,
  Appearance,
  TouchableOpacity,
} from 'react-native';
import {
  createComponent,
  useColorMode,
  useColorModeValue,
  useSmallUI,
  ColorUtils,
  toggleColorScheme,
  useBreakPointValue,
  getTheme,
} from 'react-native-small-ui';
import { Box, Center, Text } from './components/primitives';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { myTheme } from './customTheme';

type StackParamList = {
  Home: undefined;
  AppInner: undefined;
};
const Stack = createNativeStackNavigator<StackParamList>();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}

// myTheme

const theme = getTheme();

// TEST
const ExampleComponent = createComponent(View, {
  // color: theme.colors.light.primary, // Uncomment this will warn with: 'color' does not exist
  borderColor: ColorUtils.getHexAlpha(theme.colors.light.border, 0.5),
  borderWidth: 10,
  padding: 150,
  backgroundColor: 'blue',
  _light: {
    backgroundColor: 'blue',
  },
});
const ExampleView = createComponent(View, {
  padding: 100,
  // _light: {
  //   backgroundColor: '#0f0',
  // },
  // _dark: {
  //   backgroundColor: 'orange',
  // },
});
const ExampleText = createComponent(Text, {
  color: 'red',
  // _light: {
  //   backgroundColor: '#fff',
  // },
  // _dark: {
  //   backgroundColor: 'orange',
  // },
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
  // const theme = useTheme();
  const { colorMode } = useColorMode();
  const colorValue = useColorModeValue('#fff', '#000');
  const colorChangeOnWidth = useBreakPointValue({
    'default': '#fff',
    'sm': '#f00',
    '2xl': '#0f0',
    'lg': '#f0f',
    'md': '#0ff',
    'xl': '#09c',
    'xs': '#ccc',
  });
  // const maxWidth = useBreakPointValue({
  //   default: '100%',
  //   md: 100,
  //   lg: 300,
  // });
  const otherThing = useBreakPointValue({
    'xs': 'XS value',
    'sm': 'small value',
    'md': 'value can be anything',
    'lg': 'large',
    'xl': ' XL large',
    '2xl': ' 2XL large',
    'default': '  DEFAULT',
  });

  return (
    <View style={[styles.container, { backgroundColor: colorValue }]}>
      <ExampleView
        hitSlop={100}
        _light={
          {
            // backgroundColor: 'yellow',
            // color: 'red',
          }
        }
        _dark={
          {
            // backgroundColor: 'blue',
          }
        }
      >
        <ExampleText>{Appearance.getColorScheme()}</ExampleText>
        <Text color={colorChangeOnWidth}>{otherThing}</Text>
        <RNText style={{ color: colorChangeOnWidth }}>{otherThing}</RNText>
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
          {ColorUtils.getHexAlpha(theme.colors.dark.primary, 0.5)}
        </ExampleText>
      </ExampleComponent>
    </View>
  );
}

function HomeScreen() {
  const colorMode = useColorMode();
  const navigation = useNavigation();
  return (
    <Center
      flex={1}
      _light={{
        backgroundColor: '#f1f1f1',
      }}
      _dark={{
        backgroundColor: '#111',
      }}
    >
      <Box>
        <TouchableOpacity onPress={() => toggleColorScheme()}>
          <Box
            marginTop={10}
            paddingVertical={8}
            paddingHorizontal={12}
            borderRadius={6}
            borderWidth={1}
            _light={{
              backgroundColor: '#333',
              borderColor: '#111',
            }}
            _dark={{
              backgroundColor: '#eee',
              borderColor: '#f2f2f2',
            }}
          >
            <Text
              _light={{
                color: '#fff',
              }}
              _dark={{
                color: 'red',
              }}
            >
              Toggle Color Scheme
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
      <Box
        marginTop={10}
        paddingVertical={8}
        paddingHorizontal={12}
        borderRadius={6}
        _light={{
          backgroundColor: '#bbb',
        }}
        _dark={{
          backgroundColor: '#222',
        }}
      >
        <Text
          _light={{
            color: '#000',
          }}
          _dark={{
            color: '#f0f',
            backgroundColor: 'transparent',
          }}
        >
          isDark: {colorMode.isDark.toString()}
        </Text>
      </Box>
      <TouchableOpacity onPress={() => navigation.navigate('AppInner')}>
        <Box
          marginTop={10}
          paddingVertical={8}
          paddingHorizontal={12}
          borderRadius={6}
          borderWidth={1}
          _light={{
            backgroundColor: '#333',
            borderColor: '#111',
          }}
          _dark={{
            backgroundColor: '#eee',
            borderColor: '#f2f2f2',
          }}
        >
          <Text
            _light={{
              color: '#fff',
            }}
            _dark={{
              color: '#000',
            }}
          >
            Change screen
          </Text>
        </Box>
      </TouchableOpacity>
    </Center>
  );
}

export default function App() {
  useSmallUI();

  const navigationTheme = useColorModeValue(DefaultTheme, DarkTheme);
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AppInner" component={AppInner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
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
