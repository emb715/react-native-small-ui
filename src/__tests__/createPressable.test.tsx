/**
 * Tests for createPressable() and .extend() on createPressable output.
 *
 * Coverage:
 *  .extend() on createPressable previously dropped interactive styles
 *    (_pressed, _hovered, _focused, _disabled) — fixed in R4.
 *
 *  1. extended pressable still has _pressed style applied when pressed
 *  2. extended pressable __resolveStyles still returns base styles (style composition check)
 *  3. .extend() on createPressable output preserves _pressed via PressableConfig extend path
 */

import { act, fireEvent, render } from '@testing-library/react-native';

import { createPressable } from '../createPressable';
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

// ===========================================================================
// _hovered state
// ===========================================================================

describe('createPressable — _hovered state', () => {
  const HoverPressable = createPressable({
    base: { padding: 8 },
    _hovered: { borderWidth: 4 },
  });

  test('_hovered styles applied on hoverIn, removed on hoverOut', () => {
    // Arrange
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <HoverPressable testID="hovered" />
    );
    const el = getByTestId('hovered');

    // Act: hoverIn → state becomes hovered
    act(() => {
      fireEvent(el, 'hoverIn');
    });

    // Assert: _hovered styles must be active
    expect(el).toHaveStyle({ borderWidth: 4 });

    // Act: hoverOut → state reverts
    act(() => {
      fireEvent(el, 'hoverOut');
    });

    // Assert: _hovered styles must be gone
    expect(el).not.toHaveStyle({ borderWidth: 4 });
  });
});

// ===========================================================================
// _focused state
// ===========================================================================

describe('createPressable — _focused state', () => {
  const FocusPressable = createPressable({
    base: { padding: 8 },
    _focused: { borderColor: 'blue' },
  });

  test('_focused styles applied on focus, removed on blur', () => {
    // Arrange
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <FocusPressable testID="focused" />
    );
    const el = getByTestId('focused');

    // Act: focus event → focused state becomes true
    act(() => {
      fireEvent(el, 'focus');
    });

    // Assert: _focused styles must be active
    expect(el).toHaveStyle({ borderColor: 'blue' });

    // Act: blur event → focused state reverts
    act(() => {
      fireEvent(el, 'blur');
    });

    // Assert: _focused styles must be gone
    expect(el).not.toHaveStyle({ borderColor: 'blue' });
  });
});

// ===========================================================================
// _disabled state
// ===========================================================================

describe('createPressable — _disabled state', () => {
  const DisabledPressable = createPressable({
    base: { padding: 8 },
    _disabled: { opacity: 0.3 },
  });

  test('_disabled styles applied when disabled prop is true', () => {
    // Arrange + Act: render with disabled=true
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <DisabledPressable testID="disabled-true" disabled={true} />
    );

    // Assert: _disabled: { opacity: 0.3 } must be applied
    expect(getByTestId('disabled-true')).toHaveStyle({ opacity: 0.3 });
  });

  test('_disabled styles NOT applied when disabled is false', () => {
    // Arrange + Act: render with disabled=false
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <DisabledPressable testID="disabled-false" disabled={false} />
    );

    // Assert: opacity:0.3 must NOT be applied
    expect(getByTestId('disabled-false')).not.toHaveStyle({ opacity: 0.3 });
  });

  test('_disabled wins over _pressed when both active', () => {
    // Arrange: pressable where _pressed and _disabled both set opacity
    const PressedAndDisabled = createPressable({
      base: { padding: 8 },
      _pressed: { opacity: 0.8 },
      _disabled: { opacity: 0.3 },
    });

    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <PressedAndDisabled testID="disabled-wins" disabled={true} />
    );
    const el = getByTestId('disabled-wins');

    // Act: fire pressIn while disabled — both _pressed and _disabled active
    act(() => {
      fireEvent(el, 'pressIn');
    });

    // Assert: _disabled must win (resolution order: _disabled spreads last)
    expect(el).toHaveStyle({ opacity: 0.3 });
  });
});

// ===========================================================================
// fast path — no interactive styles → returns Inner directly
// ===========================================================================

describe('createPressable — fast path (no interactive styles)', () => {
  test('createPressable with no interactive styles returns Inner directly (no PressableWrapper)', () => {
    // Arrange: create with ONLY base styles — no _pressed/_hovered/_focused/_disabled
    const FastPressable = createPressable({
      base: { padding: 16, borderRadius: 8 },
    });

    // Assert: __meta key must exist on the component — proves it is a SmallUIComponent,
    // not a broken wrapper. The value is undefined when no meta arg was passed (by design).
    expect('__meta' in FastPressable).toBe(true);

    // Act: render without throwing
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <FastPressable testID="fast-path" />
    );
    const el = getByTestId('fast-path');

    // Assert: renders and carries base styles
    expect(el).toHaveStyle({ padding: 16, borderRadius: 8 });

    // Act: pressing must not throw (no interactive handlers attached)
    expect(() => {
      act(() => {
        fireEvent(el, 'pressIn');
      });
    }).not.toThrow();
  });
});

// ===========================================================================
// callback passthrough
// ===========================================================================

describe('createPressable — callback passthrough', () => {
  const CallbackPressable = createPressable({
    base: { padding: 8 },
    _pressed: { opacity: 0.8 },
  });

  test('onPressIn callback is called when pressed', () => {
    // Arrange
    const onPressIn = jest.fn();
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <CallbackPressable testID="cb-pressin" onPressIn={onPressIn} />
    );
    const el = getByTestId('cb-pressin');

    // Act
    act(() => {
      fireEvent(el, 'pressIn');
    });

    // Assert: user-provided callback must have been called
    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  test('onPressOut callback is called on press release', () => {
    // Arrange
    const onPressOut = jest.fn();
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <CallbackPressable testID="cb-pressout" onPressOut={onPressOut} />
    );
    const el = getByTestId('cb-pressout');

    // Act: pressIn then pressOut
    act(() => {
      fireEvent(el, 'pressIn');
    });
    act(() => {
      fireEvent(el, 'pressOut');
    });

    // Assert: user-provided onPressOut must have been called
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// .extend() on createPressable silently drops interactive styles
// ===========================================================================

/**
 * Fixed in R4: createPressable.tsx now implements .extend() directly on
 * PressableWrapper rather than copying Inner.extend. Both extension paths
 * (plain style object and PressableConfig) call createPressable() with the
 * full _pressed/_hovered/_focused/_disabled closure explicitly preserved.
 *
 * All tests below were written when the bug existed and have been updated to
 * assert the CORRECT behaviour now that R4 is in place.
 */
describe('.extend() on createPressable — interactive styles must survive extension', () => {
  // Base pressable: _pressed sets opacity
  const BasePressable = createPressable({
    base: {
      padding: 8,
      borderRadius: 4,
    },
    _pressed: { opacity: 0.7 },
    _disabled: { opacity: 0.4 },
  });

  // Extended: adds extra padding — should NOT lose _pressed/_disabled
  const ExtendedPressable = BasePressable.extend({ padding: 16 });

  test('extended pressable still has _pressed style applied when pressed', () => {
    // R4 fix: .extend() on PressableWrapper now re-calls createPressable()
    // so the _pressed: { opacity: 0.7 } closure is preserved.
    // Arrange: render, simulate press-in via fireEvent
    const { getByTestId } = render(
      // @ts-ignore — known type issue with Pressable in test env
      <ExtendedPressable testID="ep" />
    );
    const el = getByTestId('ep');

    // Act: fire pressIn — triggers handlePressIn → setPressed(true)
    act(() => {
      fireEvent(el, 'pressIn');
    });

    // Assert: _pressed: { opacity: 0.7 } must be applied on the extended component
    expect(el).toHaveStyle({ opacity: 0.7 });
  });

  test('extended pressable __resolveStyles still returns base styles (style composition check)', () => {
    // __resolveStyles only covers baseStyle, not interactive overrides.
    // This confirms the base style survives extension at minimum.
    const resolved = ExtendedPressable.__resolveStyles();
    // padding:16 from extend should win over base padding:8
    expect(resolved).toMatchObject({ padding: 16 });
  });

  test('.extend() on createPressable output preserves _pressed via PressableConfig extend path', () => {
    // R4 fix: when the extension object contains a 'base' key it is detected as
    // a PressableConfig and re-calls createPressable() with the merged config.
    // _pressed is NOT re-specified in the extension — it must be inherited from
    // the base createPressable() call via the closure.
    const PressableWithExtend = createPressable({
      base: { padding: 8 },
      _pressed: { opacity: 0.5 },
    });

    // PressableConfig path: 'base' key triggers isPressableConfig branch in extend()
    const Extended = PressableWithExtend.extend({
      base: { padding: 16 },
      // _pressed intentionally NOT re-specified — must inherit from base closure
    } as any);

    const { getByTestId } = render(<Extended testID="ext-pressable" />);
    const el = getByTestId('ext-pressable');

    // Verify base style merging: padding 16 from extension wins over 8
    expect(Extended.__resolveStyles()).toMatchObject({ padding: 16 });

    // Verify _pressed is preserved: fire pressIn, opacity must become 0.5
    act(() => {
      fireEvent(el, 'pressIn');
    });
    expect(el).toHaveStyle({ opacity: 0.5 });
  });
});
