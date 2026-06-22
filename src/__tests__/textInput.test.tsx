/**
 * Adversarial regression tests for the TextInput StylePropsLookUp bug.
 *
 * Root cause: `StylePropsLookUp` had no `TextInput` entry, so
 * `resolvePropByType` fell through to the `_default` bucket (ViewStyleProps).
 * ViewStyleProps does NOT include text-specific props (fontSize, color,
 * fontWeight, letterSpacing, lineHeight, textTransform, etc.), so those props
 * were silently swallowed — never passed to StyleSheet, never on the element.
 *
 * Fix: `TextInput: TextStyleProps` added to the lookup map.
 *
 * These tests are adversarial — they target exactly the props that were being
 * dropped, assert the rendered element actually carries them in its style,
 * and will FAIL on any build where the fix has not been applied.
 *
 * Total: 11 tests
 */

import { render, screen } from '@testing-library/react-native';
import { TextInput } from 'react-native';

import { createComponent } from '../smallUI';

// ---------------------------------------------------------------------------
// Mock setup — copied verbatim from smallUI.test.tsx
// ---------------------------------------------------------------------------

const mockConsoleWarn = jest.fn();
jest.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Module-scope component definitions — NEVER inside test functions.
// Each component targets a specific prop that ViewStyleProps drops so that
// a regression immediately surfaces at the right assertion.
// ---------------------------------------------------------------------------

// Test 1 — fontSize: a TextStyle-only prop absent from ViewStyleProps
const FontSizeInput = createComponent(TextInput, { fontSize: 16 });

// Test 2 — color via _light: also a TextStyle-only prop
const ColorInput = createComponent(TextInput, {
  _light: { color: '#1a1a1a' },
});

// Test 3 — borderRadius: present in ViewStyleProps but should still work via TextStyleProps
const BorderRadiusInput = createComponent(TextInput, { borderRadius: 8 });

// Test 4 — paddingVertical: present in ViewStyleProps, sanity baseline
const PaddingVerticalInput = createComponent(TextInput, {
  paddingVertical: 10,
});

// Test 5 — borderWidth: present in ViewStyleProps, sanity baseline
const BorderWidthInput = createComponent(TextInput, { borderWidth: 1 });

// Test 6 — fontWeight: TextStyle-only, absent from ViewStyleProps
const FontWeightInput = createComponent(TextInput, { fontWeight: '600' });

// Test 7 — combined: five props across both ViewStyleProps and TextStyleProps
const CombinedInput = createComponent(TextInput, {
  fontSize: 14,
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderWidth: 1,
});

// Test 8 — combined _light color props: borderColor, backgroundColor, color
const LightColorInput = createComponent(TextInput, {
  _light: {
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
});

// Tests 9 & 10 — ComponentConfig form (base + variants)
const FormInput = createComponent(TextInput, {
  base: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  variants: {
    status: {
      idle: { _light: { borderColor: '#e5e5e5' } },
      error: { _light: { borderColor: '#e00c2c' } },
    },
  },
  defaultVariants: { status: 'idle' },
});

// Test 11 — native prop pass-through: placeholder must NOT be swallowed
const PlaceholderInput = createComponent(TextInput, { fontSize: 14 });

// ---------------------------------------------------------------------------
// describe: style props apply correctly
// ---------------------------------------------------------------------------

describe('createComponent(TextInput) — style props apply correctly', () => {
  /**
   * fontSize is ABSENT from ViewStyleProps. Before the fix, resolvePropByType
   * used ViewStyleProps for TextInput and never placed fontSize into `atomic`,
   * so it was dropped from the style entirely.
   */
  test('should apply fontSize when fontSize is set as a base style prop', () => {
    // Arrange + Act
    render(<FontSizeInput testID="t" />);
    // Assert
    expect(screen.getByTestId('t')).toHaveStyle({ fontSize: 16 });
  });

  /**
   * color is ABSENT from ViewStyleProps. Light mode is the default in the
   * test environment (colorMode store initialises to 'light').
   * Before the fix, color inside _light was never routed through TextStyleProps
   * because the lookup returned ViewStyleProps, which doesn't know about color.
   */
  test('should apply color from _light when color mode is light (default)', () => {
    render(<ColorInput testID="t" />);
    expect(screen.getByTestId('t')).toHaveStyle({ color: '#1a1a1a' });
  });

  /**
   * borderRadius IS in ViewStyleProps, so this would have passed even before
   * the fix. It acts as a sanity baseline: if this fails, the test setup itself
   * is broken, not just the TextInput path.
   */
  test('should apply borderRadius when borderRadius is set as a base style prop', () => {
    render(<BorderRadiusInput testID="t" />);
    expect(screen.getByTestId('t')).toHaveStyle({ borderRadius: 8 });
  });

  /**
   * paddingVertical IS in ViewStyleProps — same sanity baseline purpose.
   */
  test('should apply paddingVertical when paddingVertical is set as a base style prop', () => {
    render(<PaddingVerticalInput testID="t" />);
    expect(screen.getByTestId('t')).toHaveStyle({ paddingVertical: 10 });
  });

  /**
   * borderWidth IS in ViewStyleProps — sanity baseline.
   */
  test('should apply borderWidth when borderWidth is set as a base style prop', () => {
    render(<BorderWidthInput testID="t" />);
    expect(screen.getByTestId('t')).toHaveStyle({ borderWidth: 1 });
  });

  /**
   * fontWeight is ABSENT from ViewStyleProps. Before the fix this was silently
   * dropped — the TextInput rendered without any font weight applied.
   */
  test('should apply fontWeight when fontWeight is set as a base style prop', () => {
    render(<FontWeightInput testID="t" />);
    expect(screen.getByTestId('t')).toHaveStyle({ fontWeight: '600' });
  });

  /**
   * Combined case: mixes ViewStyleProps keys (borderRadius, paddingVertical,
   * paddingHorizontal, borderWidth) with a TextStyle-only key (fontSize).
   * Before the fix, fontSize was the only prop that would be silently dropped,
   * causing a partial style to appear correct at a glance. This test catches
   * the subtle partial-drop regression.
   */
  test('should apply all five combined base style props', () => {
    render(<CombinedInput testID="t" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveStyle({ fontSize: 14 });
    expect(el).toHaveStyle({ borderRadius: 8 });
    expect(el).toHaveStyle({ paddingVertical: 10 });
    expect(el).toHaveStyle({ paddingHorizontal: 14 });
    expect(el).toHaveStyle({ borderWidth: 1 });
  });

  /**
   * Triple _light color props. color and borderColor are absent from
   * ViewStyleProps; backgroundColor is present. Before the fix, passing all
   * three would silently drop color and borderColor, making the component look
   * partly styled while the most critical props (text color) were gone.
   */
  test('should apply borderColor, backgroundColor, and color from _light in light mode', () => {
    render(<LightColorInput testID="t" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveStyle({ borderColor: '#e5e5e5' });
    expect(el).toHaveStyle({ backgroundColor: '#ffffff' });
    expect(el).toHaveStyle({ color: '#1a1a1a' });
  });
});

// ---------------------------------------------------------------------------
// describe: ComponentConfig with variants applies base styles
// ---------------------------------------------------------------------------

describe('createComponent(TextInput) — ComponentConfig with variants applies base styles', () => {
  /**
   * The ComponentConfig path (base + variants + defaultVariants) goes through
   * the same resolvePropByType call. Before the fix, the base styles that
   * included fontSize were dropped even when variants were involved, producing
   * a component that had variant borders but no font size — a silent regression.
   */
  test('should apply base styles (including fontSize) when variants are present with defaultVariant=idle', () => {
    render(<FormInput testID="t" />);
    const el = screen.getByTestId('t');
    expect(el).toHaveStyle({ borderRadius: 8 });
    expect(el).toHaveStyle({ paddingVertical: 10 });
    expect(el).toHaveStyle({ fontSize: 14 });
  });

  /**
   * Variant switching: status="error" should change borderColor to the error
   * value. Before the fix, borderColor from _light was already broken; after
   * the fix this also confirms variant resolution still works correctly when
   * TextStyleProps is the active lookup.
   */
  test('should apply error borderColor from _light when status variant is set to error', () => {
    render(<FormInput testID="t" status="error" />);
    expect(screen.getByTestId('t')).toHaveStyle({ borderColor: '#e00c2c' });
  });
});

// ---------------------------------------------------------------------------
// describe: non-style props pass through
// ---------------------------------------------------------------------------

describe('createComponent(TextInput) — non-style props pass through', () => {
  /**
   * placeholder is a native TextInput prop — NOT a style prop. It must reach
   * the underlying TextInput via remainingProps. Before the fix this worked
   * accidentally (placeholder was never in any StylePropsLookUp entry), but
   * this test explicitly guards the contract: native props MUST NOT be swallowed.
   *
   * Queried via testID (not via placeholder text) to stay consistent with the
   * project's testing convention. We verify the element is on screen AND that
   * it carries the placeholder prop via getProp.
   */
  test('should pass placeholder through to the underlying TextInput without swallowing it', () => {
    render(<PlaceholderInput testID="t" placeholder="enter text" />);
    const el = screen.getByTestId('t');
    // Element must render — placeholder did not cause a crash
    expect(el).toBeOnTheScreen();
    // placeholder must be visible on the element as a prop, not eaten as a style
    expect(el.props.placeholder).toBe('enter text');
  });
});
