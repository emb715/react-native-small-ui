/**
 * Tests for Extended Color Mode Registry (#3).
 *
 * Coverage:
 *  1.  Custom mode — _<key> style applied when setCustomColorMode(key) called
 *  2.  Custom mode — style NOT applied before setCustomColorMode is called
 *  3.  Custom mode — style NOT applied after clearCustomColorMode()
 *  4.  Custom mode — only the active mode's style applied (not others)
 *  5.  Custom mode — built-in _light/_dark unaffected by custom modes
 *  6.  Custom mode — unregistered key has no effect even if setCustomColorMode called
 *  7.  useCustomColorMode — returns null before activation, key after
 */

import { act, render, renderHook, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { configure, createComponent } from '../smallUI';
import {
  setCustomColorMode,
  clearCustomColorMode,
  useCustomColorMode,
} from '../hooks/useColorMode/useColorMode';
import { useCustomColorModeStore } from '../hooks/useColorMode/customColorMode.store';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';

beforeEach(() => {
  jest.useFakeTimers();
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
    useCustomColorModeStore.setState({ activeMode: null });
  });
  configure({ colorModes: {} });
});

afterEach(() => {
  jest.clearAllMocks();
  act(() => {
    useCustomColorModeStore.setState({ activeMode: null });
  });
  configure({ colorModes: {} });
});

// ---------------------------------------------------------------------------
// 1. Custom mode style applied when setCustomColorMode called
// ---------------------------------------------------------------------------
describe('custom color mode — style applied on activation', () => {
  test('_highContrast style applied after setCustomColorMode("highContrast")', () => {
    configure({ colorModes: { highContrast: true } });

    const Box = createComponent(View, {
      backgroundColor: '#fff',
      _highContrast: { backgroundColor: '#000' },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);
    // Before activation — base style
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#fff' });

    act(() => setCustomColorMode('highContrast'));
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#000' });
  });
});

// ---------------------------------------------------------------------------
// 2. Custom mode style NOT applied before activation
// ---------------------------------------------------------------------------
describe('custom color mode — no style before activation', () => {
  test('_sepia style not applied when no custom mode is active', () => {
    configure({ colorModes: { sepia: true } });

    const Box = createComponent(View, {
      backgroundColor: '#fff',
      _sepia: { backgroundColor: '#f4e4c1' },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 3. Custom mode cleared after clearCustomColorMode()
// ---------------------------------------------------------------------------
describe('custom color mode — cleared after clearCustomColorMode()', () => {
  test('style reverts to base after clearCustomColorMode()', () => {
    configure({ colorModes: { highContrast: true } });

    const Box = createComponent(View, {
      backgroundColor: '#fff',
      _highContrast: { backgroundColor: '#000' },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);

    act(() => setCustomColorMode('highContrast'));
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#000' });

    act(() => clearCustomColorMode());
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 4. Only the active mode's style applied
// ---------------------------------------------------------------------------
describe('custom color mode — only active mode applied', () => {
  test('only sepia style applied when sepia is active, not highContrast', () => {
    configure({ colorModes: { highContrast: true, sepia: true } });

    const Box = createComponent(View, {
      opacity: 1,
      _highContrast: { opacity: 0.5 },
      _sepia: { opacity: 0.8 },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);

    act(() => setCustomColorMode('sepia'));
    expect(screen.getByTestId('box')).toHaveStyle({ opacity: 0.8 });
  });
});

// ---------------------------------------------------------------------------
// 5. Built-in _light/_dark unaffected by custom modes
// ---------------------------------------------------------------------------
describe('custom color mode — built-in light/dark unaffected', () => {
  test('_light and _dark resolve correctly while a custom mode is active', () => {
    configure({ colorModes: { dim: true } });

    const Box = createComponent(View, {
      _light: { backgroundColor: '#fff' },
      _dark: { backgroundColor: '#000' },
      _dim: { opacity: 0.6 },
    } as Parameters<typeof createComponent>[1]);

    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
      setCustomColorMode('dim');
    });

    render(<Box testID="box" />);
    // Light mode color AND dim opacity both applied
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#fff',
      opacity: 0.6,
    });
  });
});

// ---------------------------------------------------------------------------
// 6. Unregistered key has no effect
// ---------------------------------------------------------------------------
describe('custom color mode — unregistered key ignored', () => {
  test('setCustomColorMode with unregistered key does not apply any style', () => {
    // colorModes is empty — 'mystery' is not registered
    configure({ colorModes: {} });

    const Box = createComponent(View, {
      backgroundColor: '#fff',
      _mystery: { backgroundColor: '#f00' },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);
    act(() => setCustomColorMode('mystery'));

    // _mystery style must not apply — not in registry
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 7. useCustomColorMode hook
// ---------------------------------------------------------------------------
describe('useCustomColorMode hook', () => {
  test('returns null when no custom mode is active', () => {
    const { result } = renderHook(() => useCustomColorMode());
    expect(result.current.activeMode).toBeNull();
  });

  test('returns the active mode name after setCustomColorMode', () => {
    configure({ colorModes: { sepia: true } });
    const { result } = renderHook(() => useCustomColorMode());

    act(() => setCustomColorMode('sepia'));
    expect(result.current.activeMode).toBe('sepia');
  });

  test('returns null after clearCustomColorMode', () => {
    configure({ colorModes: { sepia: true } });
    const { result } = renderHook(() => useCustomColorMode());

    act(() => setCustomColorMode('sepia'));
    act(() => clearCustomColorMode());
    expect(result.current.activeMode).toBeNull();
  });
});
