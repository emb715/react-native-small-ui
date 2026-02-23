---
title: Theming Guide
description: Complete guide to the theme system
---

The theme system provides semantic color tokens, automatic palette generation, and spacing utilities for building consistent design systems.

:::note[Optional Feature]
The theme system is optional and adds ~107KB to your bundle. See [Bundle Optimization](/guides/bundle-optimization) for alternatives.
:::

## Installation

```js
import { useTheme, registerTheme } from 'react-native-small-ui/theme';
```

---

## Default Theme

The library includes a pre-configured theme with light and dark color schemes:

```js
import { useTheme } from 'react-native-small-ui/theme';

function MyComponent() {
  const theme = useTheme();

  console.log(theme.colors.light.primary);    // '#8b59a0'
  console.log(theme.colors.dark.primary);     // '#756896'
  console.log(theme.space?.[4]);              // 16 (4 * 4px base unit)
}
```

### Default Color Tokens

#### Light Mode

| Token | Color | Usage |
|-------|-------|-------|
| `background` | `#fdfbfd` | Page background |
| `foreground` | `#1c1c1e` | Primary text |
| `primary` | `#8b59a0` | Primary brand color |
| `primary_foreground` | `#f4eff6` | Text on primary |
| `secondary` | `#79a964` | Secondary actions |
| `destructive` | `#e00c2c` | Errors, delete actions |
| `accent` | `#19d5bc` | Highlights, CTAs |
| `muted` | `#f4f4f5` | Subtle backgrounds |
| `border` | `#c0a3cc` | Borders, dividers |
| `card` | `#e2d6e8` | Card backgrounds |
| `ring` | `#c0b3cc` | Focus rings |

#### Dark Mode

All tokens are available in dark mode with adjusted values for optimal contrast.

### Accessing Default Theme

You can import the default theme directly:

```js
import { defaultTheme, defaultThemeColors } from 'react-native-small-ui/theme';

console.log(defaultTheme.colors.light.primary);    // '#8b59a0'
console.log(defaultTheme.colors.dark.background);  // '#09090b'
console.log(defaultTheme.space?.[4]);              // 16

// Or just the colors
console.log(defaultThemeColors.light.primary);     // '#8b59a0'
```

This is useful for:
- Inspecting theme values without registering a custom theme
- Using theme values outside React components
- Building custom theme configurations based on defaults

---

## Using Theme Colors

### With createComponent

```jsx
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { TouchableOpacity, Text } from 'react-native';

// Create styled components outside render cycle
const Button = createComponent(TouchableOpacity, {
  borderRadius: 8,
  _light: {
    borderWidth: 1,
  },
  _dark: {
    borderWidth: 1,
  },
});

const ButtonText = createComponent(Text, {
  fontSize: 16,
  fontWeight: '600',
});

function ThemedButton({ children }) {
  const theme = useTheme();

  return (
    <Button
      padding={theme.space?.[4]}
      _light={{
        backgroundColor: theme.colors.light.primary,
        borderColor: theme.colors.light.border,
      }}
      _dark={{
        backgroundColor: theme.colors.dark.primary,
        borderColor: theme.colors.dark.border,
      }}
    >
      <ButtonText
        _light={{ color: theme.colors.light.primary_foreground }}
        _dark={{ color: theme.colors.dark.primary_foreground }}
      >
        {children}
      </ButtonText>
    </Button>
  );
}
```

### With useThemeSchema

For automatic color mode switching:

```jsx
import { useThemeSchema } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { View, Text } from 'react-native';

// Create component outside render
const Card = createComponent(View, {
  padding: 16,
  borderWidth: 1,
});

function AutoThemedCard() {
  const colors = useThemeSchema(); // Automatically returns light or dark

  return (
    <Card
      backgroundColor={colors.card}
      borderColor={colors.border}
    >
      <Text style={{ color: colors.foreground }}>Content</Text>
    </Card>
  );
}
```

---

## Custom Themes

### Register a Custom Theme

```js
import { registerTheme } from 'react-native-small-ui/theme';

const myTheme = {
  colors: {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#007AFF',
      primary_foreground: '#ffffff',
      secondary: '#5856D6',
      secondary_foreground: '#ffffff',
      destructive: '#FF3B30',
      destructive_foreground: '#ffffff',
      accent: '#FF9500',
      accent_foreground: '#000000',
      muted: '#f5f5f5',
      muted_foreground: '#8e8e93',
      border: '#d1d1d6',
      card: '#ffffff',
      card_foreground: '#000000',
      ring: '#007AFF',
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#0A84FF',
      primary_foreground: '#000000',
      secondary: '#5E5CE6',
      secondary_foreground: '#ffffff',
      destructive: '#FF453A',
      destructive_foreground: '#ffffff',
      accent: '#FF9F0A',
      accent_foreground: '#000000',
      muted: '#1c1c1e',
      muted_foreground: '#8e8e93',
      border: '#38383a',
      card: '#1c1c1e',
      card_foreground: '#ffffff',
      ring: '#0A84FF',
    },
  },
  usePalette: false, // Disable automatic palette generation
  useUnits: true,    // Enable spacing units
};

// Register theme at app initialization
function App() {
  useSmallUI();
  registerTheme(myTheme);
  return <YourApp />;
}
```

---

## Color Palettes

The theme system can automatically generate color palettes with shades from 50 to 950.

### Using Default Palettes

```jsx
import { useTheme } from 'react-native-small-ui/theme';

function PaletteExample() {
  const theme = useTheme();

  return (
    <View>
      {/* Access palette colors */}
      <View style={{ backgroundColor: theme.colors.light.palette?.red?.[500] }} />
      <View style={{ backgroundColor: theme.colors.light.palette?.blue?.[700] }} />
      <View style={{ backgroundColor: theme.colors.dark.palette?.green?.[300] }} />
    </View>
  );
}
```

### Generate Custom Palettes

```js
import { registerTheme } from 'react-native-small-ui/theme';

const themeWithPalettes = {
  colors: {
    light: {
      background: '#ffffff',
      foreground: '#000000',
      // ... other tokens
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      // ... other tokens
    },
  },
  usePalette: {
    baseColors: {
      brand: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
  },
  useUnits: true,
};

registerTheme(themeWithPalettes);
```

This generates palettes for each base color:
- `theme.colors.light.palette.brand[50]` to `[950]`
- `theme.colors.light.palette.success[50]` to `[950]`
- And so on...

---

## Spacing Units

The theme includes a spacing system based on a 4px grid.

### Default Spacing Scale

```js
const theme = useTheme();

theme.space?.['.25']  // 1px
theme.space?.['.50']  // 2px
theme.space?.['.75']  // 3px
theme.space?.[1]      // 4px
theme.space?.[2]      // 8px
theme.space?.[3]      // 12px
theme.space?.[4]      // 16px
theme.space?.[5]      // 20px
theme.space?.[6]      // 24px
theme.space?.[7]      // 28px
theme.space?.[8]      // 32px
theme.space?.[9]      // 36px
theme.space?.[10]     // 40px
```

### Using Spacing Units

```jsx
import { useTheme } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { View } from 'react-native';

// Create component outside render
const Card = createComponent(View, {});

function SpacedCard() {
  const theme = useTheme();

  return (
    <Card
      padding={theme.space?.[4]}        // 16px
      marginBottom={theme.space?.[6]}   // 24px
      gap={theme.space?.[2]}            // 8px
    >
      {/* content */}
    </Card>
  );
}
```

### Custom Spacing Scale

```js
const themeWithCustomSpacing = {
  colors: {
    // ... colors
  },
  useUnits: {
    unit: 8,           // 8px base unit instead of 4px
    maxAmount: 20,     // Generate up to space[20]
    withNegatives: true, // Include negative values
  },
};

registerTheme(themeWithCustomSpacing);

// Now available:
// theme.space[1]   = 8px
// theme.space[2]   = 16px
// theme.space[-1]  = -8px
```

---

## Semantic Tokens

Use semantic tokens for consistent, meaningful color application:

```jsx
import { useTheme } from 'react-native-small-ui/theme';

function SemanticColors() {
  const theme = useTheme();
  const colors = theme.colors.light; // or use useThemeSchema()

  return (
    <View>
      {/* Primary actions */}
      <Button backgroundColor={colors.primary}>
        <Text color={colors.primary_foreground}>Primary Action</Text>
      </Button>

      {/* Secondary actions */}
      <Button backgroundColor={colors.secondary}>
        <Text color={colors.secondary_foreground}>Secondary</Text>
      </Button>

      {/* Destructive actions */}
      <Button backgroundColor={colors.destructive}>
        <Text color={colors.destructive_foreground}>Delete</Text>
      </Button>

      {/* Muted/disabled */}
      <View backgroundColor={colors.muted}>
        <Text color={colors.muted_foreground}>Disabled</Text>
      </View>

      {/* Cards and surfaces */}
      <View backgroundColor={colors.card} borderColor={colors.border}>
        <Text color={colors.card_foreground}>Card Content</Text>
      </View>
    </View>
  );
}
```

---

## TypeScript Support

The theme system is fully typed:

```tsx
import { useTheme } from 'react-native-small-ui/theme';
import type { ThemeSnapshot, ThemeConfig } from 'react-native-small-ui/theme';

function TypedComponent() {
  const theme: ThemeSnapshot = useTheme();

  // TypeScript autocomplete works
  theme.colors.light.primary;
  theme.colors.dark.secondary;
  theme.space?.[4];
}

// Custom theme with type safety
const myTheme: ThemeConfig = {
  colors: {
    light: {
      // TypeScript enforces all required tokens
      background: '#fff',
      foreground: '#000',
      // ...
    },
    dark: {
      // ...
    },
  },
  usePalette: true,
  useUnits: true,
};
```

---

## Best Practices

### 1. Use Semantic Tokens

```jsx
// ✅ Good - Semantic and maintainable
backgroundColor: theme.colors.light.primary

// ❌ Avoid - Hard-coded colors
backgroundColor: '#007AFF'
```

### 2. Leverage Spacing Scale

```jsx
// ✅ Good - Consistent spacing
padding: theme.space?.[4]

// ❌ Avoid - Magic numbers
padding: 17
```

### 3. Use useThemeSchema for Auto Mode

```jsx
// ✅ Good - Automatically adapts
const colors = useThemeSchema();

// ❌ More verbose
_light: { color: theme.colors.light.foreground },
_dark: { color: theme.colors.dark.foreground },
```

### 4. Extract Theme-Aware Components

```jsx
// ✅ Good - Reusable themed component created outside
const PrimaryButtonStyled = createComponent(TouchableOpacity, {});

function PrimaryButton({ children }) {
  const theme = useTheme();
  return (
    <PrimaryButtonStyled
      backgroundColor={theme.colors.light.primary}
    >
      {children}
    </PrimaryButtonStyled>
  );
}

// ❌ Avoid - Repeating theme logic everywhere
function MyScreen() {
  const theme = useTheme();
  const Button = createComponent(TouchableOpacity, {}); // Also avoid this
  return (
    <>
      <Button backgroundColor={theme.colors.light.primary}>One</Button>
      <Button backgroundColor={theme.colors.light.primary}>Two</Button>
    </>
  );
}
```

---

## Advanced: Runtime Theme Switching

```jsx
import { registerTheme, useTheme } from 'react-native-small-ui/theme';
import { useState } from 'react';

const blueTheme = {
  colors: {
    light: { primary: '#007AFF', /* ... */ },
    dark: { primary: '#0A84FF', /* ... */ },
  },
};

const greenTheme = {
  colors: {
    light: { primary: '#34C759', /* ... */ },
    dark: { primary: '#30D158', /* ... */ },
  },
};

function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('blue');

  const switchTheme = (themeName) => {
    if (themeName === 'blue') {
      registerTheme(blueTheme);
    } else {
      registerTheme(greenTheme);
    }
    setCurrentTheme(themeName);
  };

  return (
    <View>
      <Button onPress={() => switchTheme('blue')}>Blue Theme</Button>
      <Button onPress={() => switchTheme('green')}>Green Theme</Button>
    </View>
  );
}
```

---

## Migration from Hard-Coded Colors

### Before (Hard-coded)

```jsx
const Button = createComponent(TouchableOpacity, {
  backgroundColor: '#007AFF',
  padding: 16,
});
```

### After (Themed)

```jsx
import { useTheme } from 'react-native-small-ui/theme';
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity } from 'react-native';

// Create component outside render
const Button = createComponent(TouchableOpacity, {});

function ThemedButton() {
  const theme = useTheme();

  return (
    <Button
      backgroundColor={theme.colors.light.primary}
      padding={theme.space?.[4]}
    />
  );
}
```

**Benefits:**
- Consistent colors across app
- Easy theme switching
- Dark mode support
- TypeScript autocomplete
- Single source of truth

---

## FAQ

### Do I need the theme system?

No! The theme system is optional. You can use hard-coded colors with core-only:

```js
import { createComponent } from 'react-native-small-ui';

const Button = createComponent(TouchableOpacity, {
  backgroundColor: '#007AFF', // Direct colors work fine
});
```

### Can I use my own design tokens?

Yes! You can skip the theme system and use your own:

```js
import { colors, spacing } from './design-system';

const Button = createComponent(TouchableOpacity, {
  backgroundColor: colors.brand.primary,
  padding: spacing.md,
});
```

### How do I disable palette generation?

Set `usePalette: false` in your theme config:

```js
registerTheme({
  colors: { /* ... */ },
  usePalette: false, // No palette generation
  useUnits: true,
});
```

### Can I have more than light/dark?

Currently, only light and dark modes are supported. For additional themes, use runtime theme switching with `registerTheme()`.

---

## Next Steps

- [Color Utilities](/utilities/colors) - Color manipulation tools
- [Bundle Optimization](/guides/bundle-optimization) - Minimize bundle size
- [Hooks Reference](/utilities/hooks) - useTheme and other hooks
