---
title: Color Utilities
---

Color utilities for manipulating and analyzing colors. Part of the theme package.

## Installation

```js
import { ColorUtils } from 'react-native-small-ui/theme';
```

:::note
ColorUtils is part of the theme package (~122KB). If you only need basic color utilities without the full theme system, consider using a lighter alternative like [tinycolor](https://www.npmjs.com/package/tinycolor2).
:::

---

## ColorUtils.getHexAlpha

Add alpha transparency to a hex color.

**Parameters:**
- `hexColor` (string): Hex color code (`#fff` or `#ffffff`)
- `alpha` (number): Alpha value between 0 and 1

**Returns:** New hex color string with alpha channel

**Example:**

```js
import { ColorUtils } from 'react-native-small-ui/theme';

const semiTransparent = ColorUtils.getHexAlpha('#ff0000', 0.5);
// Returns: '#ff000080' (50% opacity red)

const almostInvisible = ColorUtils.getHexAlpha('#007AFF', 0.1);
// Returns: '#007AFF1A' (10% opacity blue)
```

**Usage in components:**

```jsx
import { ColorUtils } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

// Create component outside render
const Overlay = createComponent(View, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

function TransparentOverlay() {
  return (
    <Overlay
      backgroundColor={ColorUtils.getHexAlpha('#000000', 0.5)}
    />
  );
}
```

---

## ColorUtils.getContrastColor

Get the best contrast color (black or white) for a given background color.

**Parameters:**
- `color` (string): Hex color code

**Returns:** `'#ffffff'` or `'#000000'` for optimal contrast

**Example:**

```js
import { ColorUtils } from 'react-native-small-ui/theme';

const textColor = ColorUtils.getContrastColor('#333333');
// Returns: '#ffffff' (white text on dark background)

const darkTextColor = ColorUtils.getContrastColor('#f5f5f5');
// Returns: '#000000' (black text on light background)
```

**Usage in components:**

```jsx
import { ColorUtils } from 'react-native-small-ui/theme';
import { View, Text } from 'react-native';

function DynamicTextColor({ backgroundColor, children }) {
  const textColor = ColorUtils.getContrastColor(backgroundColor);

  return (
    <View style={{ backgroundColor, padding: 16 }}>
      <Text style={{ color: textColor }}>{children}</Text>
    </View>
  );
}

// Usage
<DynamicTextColor backgroundColor="#007AFF">
  Automatically uses white text
</DynamicTextColor>

<DynamicTextColor backgroundColor="#f5f5f5">
  Automatically uses black text
</DynamicTextColor>
```

---

## ColorUtils.getContrastMode

Determine if a color is better suited for light or dark mode.

**Parameters:**
- `color` (string): Hex color code

**Returns:** `'light'` or `'dark'`

**Example:**

```js
import { ColorUtils } from 'react-native-small-ui/theme';

const mode = ColorUtils.getContrastMode('#333333');
// Returns: 'light' (dark color needs light text)

const lightMode = ColorUtils.getContrastMode('#f5f5f5');
// Returns: 'dark' (light color needs dark text)
```

**Usage in components:**

```jsx
import { ColorUtils } from 'react-native-small-ui/theme';
import { View, Text } from 'react-native';

function AdaptiveCard({ backgroundColor, children }) {
  const contrastMode = ColorUtils.getContrastMode(backgroundColor);
  const textColor = contrastMode === 'light' ? '#ffffff' : '#000000';
  const borderColor = contrastMode === 'light' ? '#555555' : '#cccccc';

  return (
    <View
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor,
        padding: 16
      }}
    >
      <Text style={{ color: textColor }}>{children}</Text>
    </View>
  );
}
```

---

## Common Patterns

### Dynamic Theme Colors

```jsx
import { ColorUtils } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

// Create component outside render
const Button = createComponent(TouchableOpacity, {
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
});

function ThemedButton({ color, children }) {
  const textColor = ColorUtils.getContrastColor(color);

  return (
    <Button backgroundColor={color}>
      <Text style={{ color: textColor }}>{children}</Text>
    </Button>
  );
}
```

### Overlay Components

```jsx
import { ColorUtils } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { View, Modal } from 'react-native';

// Create component outside render
const Overlay = createComponent(View, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
});

function ModalOverlay({ visible, children }) {
  return (
    <Modal transparent visible={visible}>
      <Overlay backgroundColor={ColorUtils.getHexAlpha('#000000', 0.5)}>
        {children}
      </Overlay>
    </Modal>
  );
}
```