---
title: Hooks
---

## Responsive Hooks

Import from `'react-native-small-ui/utils'` for responsive utilities.

### useOrientation

Detects device orientation and returns either `'landscape'` or `'portrait'`.

```js
import { useOrientation } from 'react-native-small-ui/utils';
```

**Usage:**

```jsx
import { useOrientation } from 'react-native-small-ui/utils';

function MyComponent() {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  return (
    <View style={{ flexDirection: isLandscape ? 'row' : 'column' }}>
      <Text>Orientation: {orientation}</Text>
    </View>
  );
}
```

---

### useMediaQuery

CSS-like media query matching. Returns a boolean indicating if the query matches.

```js
import { useMediaQuery } from 'react-native-small-ui/utils';
```

**Usage:**

```jsx
import { useMediaQuery } from 'react-native-small-ui/utils';

function ResponsiveComponent() {
  const isLargeScreen = useMediaQuery('(min-width: 30rem)');
  const isMedium = useMediaQuery('(min-width: 30rem) and (max-width: 60rem)');

  return (
    <View>
      <Text>Large screen: {isLargeScreen ? 'Yes' : 'No'}</Text>
      <Text>Medium screen: {isMedium ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

---

### useBreakPointValue

Returns different values based on the current screen width breakpoint.

```js
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

**Breakpoints:**
- `default` - Base value (0px+)
- `xs` - 480px+
- `sm` - 640px+
- `md` - 768px+
- `lg` - 1024px+
- `xl` - 1280px+
- `2xl` - 1536px+

**Usage:**

```jsx
import { useBreakPointValue } from 'react-native-small-ui/utils';

function ResponsiveCard() {
  const padding = useBreakPointValue({
    default: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  });

  const fontSize = useBreakPointValue({
    default: 14,
    md: 16,
    lg: 18,
  });

  return (
    <View style={{ padding }}>
      <Text style={{ fontSize }}>Responsive content</Text>
    </View>
  );
}
```

---

## Color Mode Hooks

Import from `'react-native-small-ui/colormode'` for color mode utilities.

### useColorModeValue

Returns one of two values based on the current color scheme (light/dark).

```js
import { useColorModeValue } from 'react-native-small-ui/colormode';
```

**Usage with strings:**

```jsx
import { useColorModeValue } from 'react-native-small-ui/colormode';

function ThemedText() {
  const textColor = useColorModeValue('#000000', '#ffffff');
  const backgroundColor = useColorModeValue('#ffffff', '#000000');

  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Themed Text</Text>
    </View>
  );
}
```

**Usage with style objects:**

```jsx
import { useColorModeValue } from 'react-native-small-ui/colormode';

function ThemedCard() {
  const cardStyle = useColorModeValue(
    {
      color: '#f90',
      backgroundColor: '#eee',
      borderColor: '#999',
    },
    {
      color: '#f60',
      backgroundColor: '#333',
      borderColor: '#777',
    }
  );

  return (
    <View style={cardStyle}>
      <Text>Themed Card</Text>
    </View>
  );
}
```

---

### useColorMode

Access and control the current color scheme programmatically.

```js
import { useColorMode } from 'react-native-small-ui/colormode';
```

**Returns:**
- `colorMode` - Current mode: `'light'`, `'dark'`, or `'auto'`

**Usage:**

```jsx
import { useColorMode } from 'react-native-small-ui/colormode';

function ColorModeDisplay() {
  const { colorMode } = useColorMode();

  return (
    <View>
      <Text>Current color mode: {colorMode}</Text>
    </View>
  );
}
```

---

### setColorScheme

Set the color scheme programmatically.

```js
import { setColorScheme } from 'react-native-small-ui/colormode';
```

**Usage:**

```jsx
import { setColorScheme } from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text } from 'react-native';

function ThemeSelector() {
  return (
    <View>
      <TouchableOpacity onPress={() => setColorScheme('light')}>
        <Text>Light Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('dark')}>
        <Text>Dark Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('auto')}>
        <Text>Auto (System)</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### toggleColorScheme

Toggle between light and dark modes (ignores 'auto').

```js
import { toggleColorScheme } from 'react-native-small-ui/colormode';
```

**Usage:**

```jsx
import { toggleColorScheme } from 'react-native-small-ui/colormode';
import { TouchableOpacity, Text } from 'react-native';

function ThemeToggle() {
  return (
    <TouchableOpacity onPress={toggleColorScheme}>
      <Text>Toggle Theme</Text>
    </TouchableOpacity>
  );
}
```

---

## Theme Hooks

Import from `'react-native-small-ui/theme'` for the full theming system.

### useTheme

Reactive hook to access the active theme. Returns `unknown` — cast to your own type.

```js
import { useTheme } from 'react-native-small-ui/theme';
```

**Usage — full theme:**

```tsx
import { useTheme } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

type AppTheme = {
  light: { primary: string; background: string };
  dark:  { primary: string; background: string };
};

// Create component outside render
const Button = createComponent(TouchableOpacity, { borderRadius: 8 });

function ThemedButton() {
  const theme = useTheme() as AppTheme;

  return (
    <Button
      _light={{ backgroundColor: theme.light.primary }}
      _dark={{ backgroundColor: theme.dark.primary }}
    >
      <Text>Themed Button</Text>
    </Button>
  );
}
```

**Usage — selector (typed slice):**

```tsx
const primary = useTheme((t) => (t as AppTheme).light.primary);
```

The selector re-renders only when the selected value changes.

---

### useThemeName

Returns the active theme name as a string.

```js
import { useThemeName } from 'react-native-small-ui/theme';

const name = useThemeName(); // 'default' | 'ocean' | ...
```

See the [Theming Guide](/guides/theming) for the full theme system including `registerTheme`, `setTheme`, and `generateSpaceUnits`.
