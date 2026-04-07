# Usage Examples - Modular Imports

This document demonstrates the different ways to import and use react-native-small-ui with the new modular export structure.

## Import Patterns

### 1. Core Only (Minimal Bundle - ~15KB)

Use this when you only need component creation without theming or responsive utilities.

```typescript
import { createComponent, useSmallUI } from 'react-native-small-ui';
import { View, TouchableOpacity, Text } from 'react-native';

// Initialize in App root
function App() {
  useSmallUI();
  return <YourApp />;
}

// Create components with platform-specific and color mode styling
const Card = createComponent(View, {
  padding: 16,
  borderRadius: 8,
  _light: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  _dark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
  },
  _ios: {
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  _android: {
    elevation: 2,
  },
});

const Button = createComponent(TouchableOpacity, {
  padding: 12,
  borderRadius: 6,
  backgroundColor: '#007AFF',
  _ios: {
    shadowOpacity: 0.2,
  },
  _android: {
    elevation: 4,
  },
});

// Use in your components
function MyScreen() {
  return (
    <Card>
      <Button>
        <Text>Click me</Text>
      </Button>
    </Card>
  );
}
```

**Bundle Impact**: ~15KB (only zustand dependency)

---

### 2. Core + Color Mode (~18KB)

Add color mode utilities for programmatic theme switching.

```typescript
import { createComponent, useSmallUI } from 'react-native-small-ui';
import {
  useColorMode,
  useColorModeValue,
  toggleColorScheme,
  setColorScheme,
} from 'react-native-small-ui/colormode';
import { View, TouchableOpacity, Text } from 'react-native';

function App() {
  useSmallUI();
  return <YourApp />;
}

const Card = createComponent(View, {
  padding: 16,
  _light: { backgroundColor: '#fff' },
  _dark: { backgroundColor: '#1a1a1a' },
});

function ThemeToggle() {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={toggleColorScheme}>
      <Text>Current mode: {colorMode}</Text>
      <Text>Tap to toggle</Text>
    </TouchableOpacity>
  );
}

function ConditionalComponent() {
  // Get different values based on current color mode
  const borderColor = useColorModeValue('#e5e5e5', '#333333');

  return <View style={{ borderWidth: 1, borderColor }} />;
}

// Programmatic control
function SettingsScreen() {
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

**Bundle Impact**: ~18KB (zustand only, color mode logic is lightweight)

---

### 3. Core + Responsive Utils (~22KB)

Add responsive utilities for breakpoints, media queries, and orientation.

```typescript
import { createComponent, useSmallUI } from 'react-native-small-ui';
import {
  useBreakPointValue,
  useMediaQuery,
  useOrientation,
} from 'react-native-small-ui/utils';
import { View, Text } from 'react-native';

function App() {
  useSmallUI();
  return <YourApp />;
}

// Responsive padding based on breakpoints
function ResponsiveCard() {
  const padding = useBreakPointValue({
    default: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  });

  const Card = createComponent(View, {
    padding,
    backgroundColor: '#fff',
    borderRadius: 8,
  });

  return <Card><Text>Responsive padding</Text></Card>;
}

// Media query matching
function MediaQueryExample() {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return (
    <View>
      <Text>Large screen: {isLargeScreen ? 'Yes' : 'No'}</Text>
      <Text>Portrait: {isPortrait ? 'Yes' : 'No'}</Text>
    </View>
  );
}

// Orientation detection
function OrientationExample() {
  const orientation = useOrientation();

  return (
    <View style={{ flexDirection: orientation === 'landscape' ? 'row' : 'column' }}>
      <Text>Current orientation: {orientation}</Text>
    </View>
  );
}
```

**Bundle Impact**: ~22KB (adds css-mediaquery dependency)

---

### 4. Core + Theme (~122KB)

Add the full theming system with color generation and semantic tokens.

```typescript
import { createComponent, useSmallUI } from 'react-native-small-ui';
import {
  useTheme,
  registerTheme,
  ColorUtils,
  type ThemeConfig,
} from 'react-native-small-ui/theme';
import { View, Text, TouchableOpacity } from 'react-native';

// Optional: Register custom theme
const customTheme: ThemeConfig = {
  colors: {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#007AFF',
      primary_foreground: '#ffffff',
      secondary: '#5856D6',
      secondary_foreground: '#ffffff',
      // ... other semantic colors
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#0A84FF',
      primary_foreground: '#000000',
      // ... other semantic colors
    },
  },
  usePalette: true,
  useUnits: true,
};

function App() {
  useSmallUI();
  registerTheme(customTheme);
  return <YourApp />;
}

// Use theme colors
function ThemedButton() {
  const theme = useTheme();

  const Button = createComponent(TouchableOpacity, {
    padding: theme.space?.[4], // Using theme spacing units
    borderRadius: 8,
    _light: {
      backgroundColor: theme.colors.light.primary,
    },
    _dark: {
      backgroundColor: theme.colors.dark.primary,
    },
  });

  const ButtonText = createComponent(Text, {
    _light: {
      color: theme.colors.light.primary_foreground,
    },
    _dark: {
      color: theme.colors.dark.primary_foreground,
    },
  });

  return (
    <Button>
      <ButtonText>Themed Button</ButtonText>
    </Button>
  );
}

// Use palette colors
function PaletteExample() {
  const theme = useTheme();

  return (
    <View>
      {Object.keys(theme.colors.light.palette || {}).map((colorName) => (
        <View
          key={colorName}
          style={{
            backgroundColor: theme.colors.light.palette?.[colorName]?.[500],
            padding: 16,
          }}
        >
          <Text>{colorName}</Text>
        </View>
      ))}
    </View>
  );
}

// Use ColorUtils
function ColorUtilsExample() {
  const backgroundColor = '#007AFF';
  const alphaColor = ColorUtils.getHexAlpha(backgroundColor, 0.5); // 50% opacity
  const contrastColor = ColorUtils.getContrastColor(backgroundColor); // black or white
  const contrastMode = ColorUtils.getContrastMode(backgroundColor); // 'light' or 'dark'

  return (
    <View style={{ backgroundColor: alphaColor }}>
      <Text style={{ color: contrastColor }}>
        Contrast mode: {contrastMode}
      </Text>
    </View>
  );
}
```

**Bundle Impact**: ~122KB (adds zod and @ctrl/tinycolor dependencies)

---

### 5. Everything Combined (~125KB)

Use all features together.

```typescript
import { createComponent, useSmallUI } from 'react-native-small-ui';
import {
  useColorMode,
  toggleColorScheme,
} from 'react-native-small-ui/colormode';
import { useTheme, registerTheme } from 'react-native-small-ui/theme';
import { useBreakPointValue, useMediaQuery } from 'react-native-small-ui/utils';
import { View, Text, TouchableOpacity } from 'react-native';

function App() {
  useSmallUI();
  registerTheme(customTheme);
  return <YourApp />;
}

function FullFeaturedComponent() {
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const padding = useBreakPointValue({
    default: theme.space?.[2],
    md: theme.space?.[4],
    lg: theme.space?.[6],
  });

  const Card = createComponent(View, {
    padding,
    borderRadius: 8,
    _light: {
      backgroundColor: theme.colors.light.card,
      borderColor: theme.colors.light.border,
    },
    _dark: {
      backgroundColor: theme.colors.dark.card,
      borderColor: theme.colors.dark.border,
    },
  });

  return (
    <Card>
      <Text>Color mode: {colorMode}</Text>
      <Text>Large screen: {isLargeScreen ? 'Yes' : 'No'}</Text>
      <TouchableOpacity onPress={toggleColorScheme}>
        <Text>Toggle theme</Text>
      </TouchableOpacity>
    </Card>
  );
}
```

**Bundle Impact**: ~125KB (all dependencies included)

---

## Migration from Old Imports

### Old Way (Deprecated but still works)

```typescript
import {
  createComponent,
  useTheme,
  useBreakPointValue,
  useColorMode,
} from 'react-native-small-ui';
```

**Issue**: This imports everything, including heavy dependencies you might not use.

### New Way (Recommended)

```typescript
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { useBreakPointValue } from 'react-native-small-ui/utils';
import { useColorMode } from 'react-native-small-ui/colormode';
```

**Benefit**: Tree-shaking works correctly, only the code you import is included in your bundle.

---

## Bundle Size Comparison

| Import Pattern | Estimated Size | What's Included |
|---------------|----------------|-----------------|
| Core only | ~15KB | createComponent, useSmallUI, zustand |
| Core + ColorMode | ~18KB | + color mode hooks |
| Core + Utils | ~22KB | + responsive utilities, css-mediaquery |
| Core + Theme | ~122KB | + theming system, zod, tinycolor |
| Everything | ~125KB | All features |

---

## Recommendations

**For simple apps** (no theming needed):
```typescript
import { createComponent } from 'react-native-small-ui';
```

**For apps with custom themes** (no library theme system):
```typescript
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
```

**For responsive apps** (no theming):
```typescript
import { createComponent } from 'react-native-small-ui';
import { useBreakPointValue, useMediaQuery } from 'react-native-small-ui/utils';
```

**For full-featured apps** (design systems):
```typescript
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { useBreakPointValue } from 'react-native-small-ui/utils';
```
