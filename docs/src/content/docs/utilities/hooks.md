---
title: Hooks
---

### useOrientation

This hook will return one **landscape** or **portrait**

**`useOrientation()`**

```jsx
const isLandscape = useOrientation() === 'landscape';
```


### useMediaQuery

Simple usage for media query string. This hook will return a boolean

**`useMediaQuery()`**

```jsx
useMediaQuery('(min-width: 30rem)')
useMediaQuery('(min-width: 30rem) and (max-width: 60rem)')
```


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
import { useColorModeValue } from 'react-native-small-ui';

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



### useBreakPointValue

This hook will return one of the given values based on the current width of the device.

**`useBreakPointValue()`**

```jsx
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
