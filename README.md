# react-native-tinybase

Small UI Lib for React Native. Inspired by [native base](https://nativebase.io/)

## Installation

```sh
npm install react-native-tinybase
```
```sh
yarn install react-native-tinybase
```

## Usage


```js
import { useTinyBase, createComponent, useColorModeValue, useColorMode } from 'react-native-tinybase';

// ...

const MyComponent = createComponent(View, {
  padding: 4,
  _light: {
    backgroundColor: '#fefefe'
  },
  _dark: {
    backgroundColor: '#232323'
  }
})
const MyText = createComponent(Text, {
  textAlign: 'center',
  _light: {
    color: '#000'
  },
  _dark: {
    color: '#fff'
  }
})
const ExampleComponent = createComponent(View, (theme) => ({
  borderColor: theme.utils.getHexAlpha(theme.colors.light.border, 0.5),
  borderWidth: 10,
  padding: 150,
  _light: {
    backgroundColor: 'blue',
  },
}));

function App() {
  useTinyBase() // Initialize 
  // Start using it
  const backgroundColor = useColorModeValue('#e99', '#f87')
  return (
    <View>
      <MyComponent>
        <MyText backgroundColor={backgroundColor}>Example</MyText>
        <ExampleComponent />
      </MyComponent>
    </View>
  )
}
```

### React Native Web
https://necolas.github.io/react-native-web/docs/installation/

# Known Issues:
### Expo

#### Color mode detection
If changing the appearance settings on the devices does no effect. Take a look at this.

`ios/Info.plist`
```
<key>UIUserInterfaceStyle</key>
<string>Automatic</string>
```
Or to your `app.json`
```
"expo": {"userInterfaceStyle": "automatic"}
```



## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

