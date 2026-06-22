---
title: Animated Components
description: Using Animated.View and Reanimated with createComponent
sidebar:
  order: 8
---

`createComponent` wraps any `ComponentType` — including `Animated.View` and Reanimated's `Animated.View`. Base styles (color mode, platform, variants) work identically. The constraint: animated values must go through the `style` prop directly, not as atomic style props.

## React Native `Animated`

```tsx
import { Animated } from 'react-native';
import { createComponent } from 'react-native-small-ui';

// ✅ Base styles through createComponent — animated values through style prop
const AnimatedCard = createComponent(Animated.View, {
  borderRadius: 12,
  _light: { backgroundColor: '#ffffff' },
  _dark:  { backgroundColor: '#1e1e1e' },
});

function FadeInCard() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  // Pass animated values via style prop — they bypass createComponent's atomic system
  return <AnimatedCard style={{ opacity }} />;
}
```

The `style` prop on any `SmallUIComponent` is passed through directly to the underlying component — animated values in `style` reach `Animated.View` unchanged.

## Reanimated (`react-native-reanimated`)

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { createComponent } from 'react-native-small-ui';

const AnimatedCard = createComponent(Animated.View, {
  borderRadius: 12,
  padding: 16,
  _light: { backgroundColor: '#ffffff' },
  _dark:  { backgroundColor: '#1e1e1e' },
});

function SpringCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedCard
      style={animatedStyle}
      onTouchStart={() => { scale.value = withSpring(0.95); }}
      onTouchEnd={() => { scale.value = withSpring(1); }}
    />
  );
}
```

## What works / what doesn't

| | Works |
|---|---|
| `_light` / `_dark` base styles | ✅ |
| `_ios` / `_android` / `_web` platform styles | ✅ |
| Variants, `.extend()`, `.withSlots()` | ✅ |
| `Animated.Value` via `style` prop | ✅ |
| `useAnimatedStyle` via `style` prop | ✅ |
| `Animated.Value` as an atomic prop (`opacity={animValue}`) | ❌ — atomic props are passed to `StyleSheet.create`, not the Animated system |

The key rule: **animated values go in `style`, static values go as props.**

```tsx
const Card = createComponent(Animated.View, { borderRadius: 8 });

// ✅ Correct
<Card style={{ opacity: animatedOpacity }} borderRadius={16} />

// ❌ Wrong — opacity passed as atomic prop, not animated
<Card opacity={animatedOpacity} />
```

## `createPressable` + Reanimated

`createPressable` manages its own `onPressIn`/`onPressOut` for `_pressed` state. To combine with Reanimated gesture handlers, use `onPressIn`/`onPressOut` — they are forwarded:

```tsx
const Button = createPressable({
  base: { padding: 12, borderRadius: 8 },
  _pressed: { opacity: 0.8 },
});

function AnimatedButton() {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Button
      style={animStyle}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Text>Press</Text>
    </Button>
  );
}
```

`_pressed` and the Reanimated scale animate simultaneously — they're independent systems.
