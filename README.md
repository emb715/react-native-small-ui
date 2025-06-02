# react-native-tinybase

Small UI Lib for React Native. Inspired by [native base](https://nativebase.io/)

# Introduction

The idea behind **React Native TinyBase** is being able to create components that can be easily styled. Allowing you to build universal apps in React Native with multi-platform and dark mode support.
Uses typescript to bring autocompletion for styles when creating component and using them.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Basic Usage](#usage)
  - [Create Component](#create-component)
  - [Hooks](#hooks)
    - [useOrientation](#useorientation)
    - [useMediaQuery](#usemediaquery)
    - [useColorModeValue](#usecolormodevalue)
    - [useBreakPointValue](#usebreakpointvalue)
  - [Theme](#theme)
    - [useTheme](#useTheme)
    - [Theme Config](#theme-config)
    - [Utilities](#theme-utilities)
  - [Helpers](#helpers)
- [Known Issues](#known-issues)
  - [Expo](#expo)
- [Built With](#built-with)

## Installation

```sh
npm install react-native-tinybase
```

or

```sh
yarn add react-native-tinybase
```

#### Web support

- [React Native Web](https://necolas.github.io/react-native-web/docs/installation/)

## Getting Started

Get started by adding **`useTinyBase`** hook in your App.

```js
// No config
...
import { useTinyBase } from 'react-native-tinybase';


function App() {
  useTinyBase()
  return (
    <View>
      <Text>Example</Text>
    </View>
  )
}
```

# Usage

## Create Component

You can use the `createComponent` helper function to extend the styling capabilities to platform specifics, color mode, and inline style with props. The component will have access to the following props.

**Utility Style Props**

All available styles of the component. Like: _backgroundColor_, _alignContent_, etc.

Customized are prefixed with **underscore**:

- \_light
- \_dark
- \_ios
- \_android
- \_web

Example:

```jsx
import { createComponent } from 'react-native-tinybase';

const MyComponent = createComponent(View, {
  alignItems: 'center',
  justifyContent: 'center'
  _light: {
    backgroundColor: '#f1f1f1',
  },
  _dark_: {
    backgroundColor: '#123123',
  },
  _ios: {
    marginTop: 10,
  },
  _android: {
    marginTop: 16,
  },
  _web: {
    marginTop: 0
  }
})
```

The new created component `MyComponent` will also extend the same props for styling.

```typescript
function App() {
  const myFlag = useMemo(() => {
    // something that will return true or false
    return true;
  });

  return (
    <MyComponent paddingTop={myFlag ? 16 : 0}>
      <Text>Hi!</Text>
    </MyComponent>
  );
}
```

### Using a theme in createComponent

You can create a theme and use it in your styles.

```typescript
import { getTheme, createComponent } from 'react-native-tinybase';

const theme = getTheme()
// const myTheme = registerTheme({ ... })

const MyComponent = createComponent(View, 
  {
  color: 'red', // wrong key, View doesn't have color
  borderWith: 1
  _light: {
    borderColor: theme.colors.light.border,
  },
  _dark_: {
    borderColor: theme.colors.dark.border,
  },
})
```

### Utilities

> Use it from ColorUtils.

`import {ColorUtils} from 'react-native-tinybase'`

#### Utils for colors

**`ColorUtils.getHexAlpha`**

```js
/**
 * @param {string} hexColor #fff or #ffffff
 * @param {number} alpha between 0 and 1
 * @return {string} new hex color with alpha
 */
 function getHexAlpha('#f00', 0.5): '#ff000080'
```

**`ColorUtils.getContrastColor`**

Accepts a color as argument to get the contrast color of it. `#fff` or `#000`

```js
/**
 * @param {string} color
 * @return {string} #fff or #000
 */
 function getContrastColor('#333'): '#fff'
```

**`ColorUtils.getContrastMode`**

Accepts a color as argument to get the corresponding color mode. `light` or `dark`

```js
/**
 * @param {string} color
 * @return {string} light or dark
 */
 function getContrastMode('#333'): 'light'
```


## Hooks

### useOrientation

This hook will return one **landscape** or **portrait**

**`useOrientation()`**

```jsx
const isLandscape = useOrientation() === 'landscape';
```

<!-- #end: useOrientation -->

### useMediaQuery

Simple usage for media query string. This hook will return a boolean

**`useMediaQuery()`**

```jsx
useMediaQuery('(min-width: 30rem)')
useMediaQuery('(min-width: 30rem) and (max-width: 60rem)')
```

<!-- #end: useMediaQuery -->

### useColorModeValue

This hook will return one of the given values based on the current appearance mode.
Accepts 2 arguments, the first for light and the second for dark.

**`useColorModeValue(light, dark)`**

```jsx
// with object
const lightStyle = {
  color: '#f90',
  backgroundColor: '#eee',
  borderColor: '#999',
};
const darkStyle = {
  color: '#f60',
  backgroundColor: '#333',
  borderColor: '#777',
};
const basedOnColorMode = useColorModeValue(lightStyle, darkStyle);
```

```js
// with string
const basedOnColorMode = useColorModeValue('#eee', '#333');
```

#### Usage

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useColorModeValue } from 'react-native-tinybase';

const Bar = () => {
  const color = useColorModeValue('a light color', 'a dark color');
  const foo = useColorModeValue(
    {
      color: '#f00',
      backgroundColor: '#f1f1f1',
    },
    {
      color: '#f09',
      backgroundColor: '#333',
    }
  );

  return (
    <View>
      <Text>The color should be: {color}</Text>
      <Text style={foo}>Other style for text</Text>
    </View>
  );
};
```

<!-- #end: useColorMode -->

### useBreakPointValue

This hook will return one of the given values based on the current width of the device.

**`useBreakPointValue()`**

```jsx
// with string or what ever value
const aValue = useBreakPointValue({
    'xs': 'XS value',
    'sm': 'small value',
    'md': 'value can be anything',
    'lg': 'large',
    'xl': ' XL large',
    '2xl': ' 2XL large',
    'default': '  DEFAULT',
  });
```

<!-- ### end: useBreakPointValue -->

----

## Themable
### useTheme

A hook to retrieve all the theme values and utility helpers.
> Be sure to  call `registerTheme` first if you want to have any customization.

By default it will use [defaultTheme](#default-theme)

#### Usage

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-tinybase';

const Taz = () => {
  const theme = useTheme();

  return (
    <View>
      <Text>
        Theme primary: Light: {theme.colors.light.primary}, Dark:{' '}
        {theme.colors.dark.primary}
      </Text>
    </View>
  );
};
```


## Theme

Use custom theme example in `./example/src/customTheme.ts`

### Theme Config

...

```typescript
import { type ThemeConfig } from 'react-native-tinybase'

const myThemeConfig = {
  ...
} satisfies ThemeConfig;
```

### Default theme

```
const theme = {
  "colors": {
    "light": {
      "background": "#fdfbfd",
      "foreground": "#1c1c1e",
      "muted": "#f4f4f5",
      "muted_foreground": "#71717a",
      "primary": "#8b59a0",
      "primary_foreground": "#f4eff6",
      "secondary": "#79a964",
      "secondary_foreground": "#fff",
      "destructive": "#e00c2c",
      "destructive_foreground": "#f4eff6",
      "accent": "#19d5bc",
      "accent_foreground": "#303835",
      "border": "#c0a3cc",
      "card": "#e2d6e8",
      "card_foreground": "#1c1c1e",
      "ring": "#c0b3cc",
      "palette": {
        // ...
      }
    },
    "dark": {
      "background": "#09090b",
      "foreground": "#fafafa",
      "muted": "#1a1a38",
      "muted_foreground": "#a1a1aa",
      "primary": "#756896",
      "primary_foreground": "#f4eff6",
      "secondary": "#899668",
      "secondary_foreground": "#e2e5dc",
      "destructive": "#be0a25",
      "destructive_foreground": "#f4eff6",
      "accent": "#16bea7",
      "accent_foreground": "#303835",
      "border": "#2d283a",
      "card": "#3f3851",
      "card_foreground": "#fafafa",
      "ring": "#2d183a",
      "palette": {
        // ...
      }
    }
  }
}
```

## Helpers

### getStatusBarColor

To retrieve `light-content` or `dark-content` based on the appearance mode (dark mode).
This is helpful for updating the status bar style.

[React Native status bar style](https://reactnative.dev/docs/statusbar#statusbarstyle)

### getTheme

Get values of the current theme

---

## Known Issues:

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

---

## Built with

- [React Native](https://reactnative.dev/)
- [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
- [zustand](https://zustand-demo.pmnd.rs/)

<!-- ## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow. -->

## License

MIT
