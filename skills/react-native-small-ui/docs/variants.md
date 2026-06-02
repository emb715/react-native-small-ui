# Variants

`createComponent` accepts a config object with `base`, `variants`, `compoundVariants`, and `defaultVariants` instead of a plain style object.

```tsx
import { createComponent } from 'react-native-small-ui';
import { TouchableOpacity, Text } from 'react-native';

const Button = createComponent(TouchableOpacity, {
  base: {
    borderRadius: 8,
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  variants: {
    intent: {
      primary: {
        _light: { backgroundColor: '#007AFF' },
        _dark:  { backgroundColor: '#0A84FF' },
      },
      danger: {
        _light: { backgroundColor: '#e00c2c' },
        _dark:  { backgroundColor: '#be0a25' },
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        _light: { borderColor: '#007AFF' },
        _dark:  { borderColor: '#0A84FF' },
      },
    },
    size: {
      sm: { paddingVertical: 6,  paddingHorizontal: 12 },
      md: { paddingVertical: 10, paddingHorizontal: 20 },
      lg: { paddingVertical: 14, paddingHorizontal: 28 },
    },
  },
  compoundVariants: [
    // Applied only when both size=lg AND intent=danger
    { variants: { size: 'lg', intent: 'danger' }, style: { borderWidth: 2 } },
  ],
  defaultVariants: { intent: 'primary', size: 'md' },
});

// Variant props are typed and auto-completed
<Button intent="danger" size="sm" />
<Button intent="ghost" />   // size defaults to 'md'
```

## `.extend()` — deriving variants

```tsx
const IconButton = Button.extend({
  base: { width: 44, height: 44, padding: 0 },
});
// Inherits all Button variants. Add or override freely.
```

## `createComponentGroup` — shared context

Groups components that belong together semantically and share a reactive context.

```tsx
import { createComponentGroup } from 'react-native-small-ui';
import { View, Text, TextInput } from 'react-native';

// At module scope
const Field = createComponentGroup({
  Root:  { Component: View,      style: { gap: 4 } },
  Label: { Component: Text,      style: { fontSize: 14, _light: { color: '#333' }, _dark: { color: '#ccc' } } },
  Input: { Component: TextInput, style: { borderWidth: 1, borderRadius: 6, padding: 8 } },
});

// Usage
<Field.Root>
  <Field.Label>Email</Field.Label>
  <Field.Input placeholder="you@example.com" />
</Field.Root>
```
