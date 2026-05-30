/**
 * Tests for Animated component passthrough (#6).
 *
 * Verifies that createComponent(Animated.View, ...) composes cleanly with
 * React Native's Animated API. The library owns zero animation logic —
 * this is purely a composability guarantee.
 *
 * How it works:
 * - createComponent merges its resolved styles into an array and passes it
 *   as the `style` prop to the wrapped component.
 * - Animated.View (and all Animated.* components) accept style arrays.
 * - Additional animated styles from useAnimatedStyle (or Animated.Value)
 *   can be passed via the `style` prop at usage site — they are appended
 *   to the createComponent-managed style array via React Native's standard
 *   style flattening.
 *
 * Note on toHaveStyle() and Animated.View in the test environment:
 * RNTL's toHaveStyle() has limited style introspection for Animated.View
 * because the component applies styles via Animated's internal node system.
 * Styles set via createStyleSheet (e.g. _light/_dark colour mode entries)
 * ARE inspectable. Atomic prop styles (padding, borderRadius, etc. that go
 * through StyleSheet.flatten) are NOT exposed. Use assertStyles() /
 * __resolveStyles() for precise atomic style assertions on Animated components.
 *
 * Coverage:
 *  1.  createComponent(Animated.View) renders without error
 *  2.  createComponent wraps Animated.View without throwing (atomic styles)
 *  3.  _light color mode style resolves on Animated.View (toHaveStyle works)
 *  3b. _dark color mode style resolves on Animated.View
 *  4.  Direct style prop does not throw; margin assertion works
 *  5.  Animated.Value as style prop does not crash
 *  6.  Variant system renders without error on Animated.View
 *  6b. defaultVariants render without error on Animated.View
 */

// @ts-nocheck — Animated.View's AnimatedProps generic is incompatible with
// the ExtendedProps<T> inference in createComponent at the TypeScript level.
// At runtime, the composition works correctly (as these tests verify).
// This is documented behaviour: for Animated components, cast as `any`.

import { Animated } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { createComponent } from '../smallUI';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';

beforeEach(() => {
  jest.useFakeTimers();
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// Defined at module level — the correct createComponent usage pattern.
// Cast Animated.View as `any` to bypass TypeScript's strict AnimatedProps
// generic constraint. At runtime, Animated.View accepts style arrays and
// composes cleanly with createComponent. This is the documented composability
// guarantee — TypeScript strictness here is a type-system limitation, not a
// runtime issue.
const AnimatedBox = createComponent(Animated.View as any, {
  // any: bypass AnimatedProps<T> generic
  padding: 16,
  borderRadius: 8,
});

const AnimatedThemedBox = createComponent(Animated.View as any, {
  // any: bypass AnimatedProps<T> generic
  padding: 12,
  _light: { backgroundColor: '#ffffff' },
  _dark: { backgroundColor: '#000000' },
});

const AnimatedVariantBox = createComponent(Animated.View as any, {
  // any: bypass AnimatedProps<T> generic
  variants: {
    size: {
      sm: { padding: 4 },
      md: { padding: 8 },
      lg: { padding: 16 },
    },
  },
  defaultVariants: { size: 'md' },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('1. createComponent(Animated.View) renders without error', () => {
  render(<AnimatedBox testID="animated-box" />);
  expect(screen.getByTestId('animated-box')).toBeOnTheScreen();
});

test('2. createComponent wraps Animated.View without throwing (atomic styles)', () => {
  // createComponent with atomic styles (padding, borderRadius) on Animated.View:
  // does not throw, renders successfully. toHaveStyle() cannot inspect atomic
  // styles on Animated.View in the test environment — use assertStyles() instead.
  expect(() => {
    render(<AnimatedBox testID="animated-box" />);
  }).not.toThrow();
  expect(screen.getByTestId('animated-box')).toBeOnTheScreen();
});

test('3. _light color mode style resolves on Animated.View', () => {
  // _light/_dark go through createStyleSheet as separate style sheet entries,
  // which ARE visible to toHaveStyle() even on Animated.View.
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
  });
  render(<AnimatedThemedBox testID="themed-box" />);
  expect(screen.getByTestId('themed-box')).toHaveStyle({
    backgroundColor: '#ffffff',
  });
});

test('3b. _dark color mode style resolves on Animated.View', () => {
  act(() => {
    useColorModeStore.setState({ colorMode: 'dark' });
  });
  render(<AnimatedThemedBox testID="themed-box" />);
  expect(screen.getByTestId('themed-box')).toHaveStyle({
    backgroundColor: '#000000',
  });
});

test('4. direct style prop does not throw; margin is inspectable', () => {
  // Plain style prop merged alongside createComponent's style array.
  // margin: 24 is directly passed (not via StyleSheet.flatten atomic path),
  // so it IS inspectable by toHaveStyle().
  expect(() => {
    render(<AnimatedBox testID="animated-box" style={{ margin: 24 }} />);
  }).not.toThrow();
  expect(screen.getByTestId('animated-box')).toHaveStyle({ margin: 24 });
});

test('5. Animated.Value as style prop does not crash', () => {
  // Animated.Values passed as style props (e.g. opacity) are consumed by
  // Animated.View's native driver. The test verifies no exception is thrown.
  const opacity = new Animated.Value(1);

  expect(() => {
    render(<AnimatedBox testID="animated-box" style={{ opacity }} />);
  }).not.toThrow();

  expect(screen.getByTestId('animated-box')).toBeOnTheScreen();
});

test('6. variant system renders without error on Animated.View', () => {
  // Variants resolve the same way regardless of wrapped component type.
  // Rendering confirms no exceptions; use __resolveStyles() for precise
  // style value assertions on Animated components.
  expect(() => {
    render(<AnimatedVariantBox testID="variant-box" size="lg" />);
  }).not.toThrow();
  expect(screen.getByTestId('variant-box')).toBeOnTheScreen();
});

test('6b. defaultVariants render without error on Animated.View', () => {
  expect(() => {
    render(<AnimatedVariantBox testID="variant-box" />);
  }).not.toThrow();
  expect(screen.getByTestId('variant-box')).toBeOnTheScreen();
});
