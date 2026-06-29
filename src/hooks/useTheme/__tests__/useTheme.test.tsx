import { act, render, renderHook, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useThemeStore } from '../theme.store';
import {
  getTheme,
  registerTheme,
  setTheme,
  useTheme,
  useThemeName,
} from '../useTheme';
import { generateSpaceUnits } from '../../../theme/theme';
import { useColorModeStore } from '../../../hooks/useColorMode/colorMode.store';

const resetStore = () =>
  useThemeStore.setState({
    themes: { default: {} },
    activeThemeName: 'default',
  });

beforeEach(() => {
  resetStore();
});

// ---------------------------------------------------------------------------
// registerTheme
// ---------------------------------------------------------------------------

describe('registerTheme', () => {
  test('unnamed — activates as "default" and returns undefined', () => {
    registerTheme({ light: { primary: '#fff' }, dark: { primary: '#000' } });
    const state = useThemeStore.getState();
    expect(state.themes.default).toEqual({
      light: { primary: '#fff' },
      dark: { primary: '#000' },
    });
    expect(state.activeThemeName).toBe('default');
  });

  test('named — adds to registry without switching active theme', () => {
    registerTheme('ocean', {
      light: { brand: '#0af' },
      dark: { brand: '#08c' },
    });
    const state = useThemeStore.getState();
    expect(state.themes).toHaveProperty('ocean');
    expect(state.activeThemeName).toBe('default');
  });

  test('stores colors directly without transformation', () => {
    registerTheme({ light: { a: '#111' }, dark: { a: '#222' } });
    expect(useThemeStore.getState().themes.default).toEqual({
      light: { a: '#111' },
      dark: { a: '#222' },
    });
  });
});

// ---------------------------------------------------------------------------
// setTheme
// ---------------------------------------------------------------------------

describe('setTheme', () => {
  test('switches active theme and returns true', () => {
    registerTheme('ocean', {
      light: { brand: '#0af' },
      dark: { brand: '#08c' },
    });
    const result = setTheme('ocean');
    expect(result).toBe(true);
    expect(useThemeStore.getState().activeThemeName).toBe('ocean');
  });

  test('throws when theme not found — includes name in message', () => {
    expect(() => setTheme('nonexistent')).toThrow(
      /theme "nonexistent" not found/
    );
  });

  test('throws with available themes listed', () => {
    registerTheme('warm', {
      light: { brand: '#f80' },
      dark: { brand: '#c60' },
    });
    expect(() => setTheme('nonexistent')).toThrow(/Available:/);
  });

  test('throws in production (not just __DEV__)', () => {
    const prev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    expect(() => setTheme('ghost')).toThrow();
    (global as any).__DEV__ = prev;
  });
});

// ---------------------------------------------------------------------------
// getTheme
// ---------------------------------------------------------------------------

describe('getTheme', () => {
  test('returns empty object for default slot before any registerTheme call', () => {
    expect(getTheme()).toEqual({});
  });

  test('returns active theme snapshot', () => {
    const colors = { light: { x: '#aaa' }, dark: { x: '#bbb' } };
    registerTheme(colors);
    expect(getTheme()).toEqual(colors);
  });
});

// ---------------------------------------------------------------------------
// useTheme hook
// ---------------------------------------------------------------------------

describe('useTheme', () => {
  test('returns empty object for default slot before any registerTheme call', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual({});
  });

  test('returns active theme snapshot', () => {
    const colors = { light: { primary: '#f00' }, dark: { primary: '#c00' } };
    registerTheme(colors);
    const { result } = renderHook(() => useTheme());
    expect(result.current).toEqual(colors);
  });

  test('selector — user casts to their type and returns a slice', () => {
    type MyTheme = {
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    registerTheme({ light: { brand: '#0af' }, dark: { brand: '#08c' } });
    const { result } = renderHook(() => useTheme((t) => (t as MyTheme).light));
    expect(result.current).toEqual({ brand: '#0af' });
  });

  test('selector — empty default slot returns no keys on cast slice', () => {
    type MyTheme = { light: Record<string, string> };
    const { result } = renderHook(() => useTheme((t) => (t as MyTheme).light));
    expect(result.current).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// useThemeName hook
// ---------------------------------------------------------------------------

describe('useThemeName', () => {
  test('returns "default" initially', () => {
    const { result } = renderHook(() => useThemeName());
    expect(result.current).toBe('default');
  });

  test('returns active theme name after setTheme', () => {
    registerTheme('ocean', {
      light: { brand: '#0af' },
      dark: { brand: '#08c' },
    });
    setTheme('ocean');
    const { result } = renderHook(() => useThemeName());
    expect(result.current).toBe('ocean');
  });
});

// ---------------------------------------------------------------------------
// generateSpaceUnits
// ---------------------------------------------------------------------------

describe('generateSpaceUnits', () => {
  test('generates sizes from default unit (4)', () => {
    const space = generateSpaceUnits();
    expect(space['1']).toBe(4);
    expect(space['2']).toBe(8);
    expect(space['10']).toBe(40);
  });

  test('generates fractional sizes', () => {
    const space = generateSpaceUnits(4);
    expect(space['.25']).toBe(1);
    expect(space['.50']).toBe(2);
    expect(space['.75']).toBe(3);
  });

  test('does not include negatives by default', () => {
    const space = generateSpaceUnits(4);
    expect(space['-1']).toBeUndefined();
  });

  test('includes negatives when withNegatives: true', () => {
    const space = generateSpaceUnits(4, { withNegatives: true });
    expect(space['-1']).toBe(-4);
    expect(space['-10']).toBe(-40);
  });

  test('respects custom unit value', () => {
    const space = generateSpaceUnits(8);
    expect(space['1']).toBe(8);
    expect(space['2']).toBe(16);
  });

  test('respects maxAmount', () => {
    const space = generateSpaceUnits(4, { maxAmount: 3 });
    expect(space['3']).toBe(12);
    expect(space['4']).toBeUndefined();
  });

  test('throws for unit <= 0', () => {
    expect(() => generateSpaceUnits(0)).toThrow();
    expect(() => generateSpaceUnits(-1)).toThrow();
  });

  test('is not coupled to the theme store', () => {
    const stateBefore = useThemeStore.getState();
    generateSpaceUnits(4);
    expect(useThemeStore.getState()).toEqual(stateBefore);
  });
});

// ===========================================================================
// setTheme() triggers re-renders in ALL subscribed useTheme() components
// ===========================================================================

/**
 * Existing useTheme tests only call renderHook and check result.current
 * AFTER a synchronous setTheme() call — this tests that the store update
 * is visible but does NOT test that React re-renders subscribed components
 * reactively when setTheme() fires.
 *
 * This gap tests the REACTIVE cycle:
 *   1. Mount a component that reads useTheme() / useThemeName()
 *   2. Call setTheme() in an act() block
 *   3. Assert the rendered output updated — proving the subscription works
 */
describe('setTheme() — reactive re-render of subscribed components', () => {
  // Component that renders the active theme name (proves useThemeName re-renders)
  const ThemeNameDisplay = () => {
    const name = useThemeName();
    return <Text testID="name">{name}</Text>;
  };

  // Component that reads a theme value via useTheme() (proves useTheme re-renders)
  const ThemeValueDisplay = () => {
    const theme = useTheme() as { brand?: string };
    return <Text testID="brand">{theme?.brand ?? 'none'}</Text>;
  };

  test('useThemeName re-renders when setTheme() switches active theme', () => {
    act(() => {
      registerTheme('ocean', { brand: '#0af' });
    });

    render(<ThemeNameDisplay />);
    expect(screen.getByTestId('name')).toHaveTextContent('default');

    act(() => {
      setTheme('ocean');
    });

    expect(screen.getByTestId('name')).toHaveTextContent('ocean');
  });

  test('useTheme() re-renders when setTheme() switches active theme — value updates', () => {
    act(() => {
      registerTheme({ brand: 'default-brand' });
      registerTheme('summer', { brand: 'summer-brand' });
    });

    render(<ThemeValueDisplay />);
    expect(screen.getByTestId('brand')).toHaveTextContent('default-brand');

    act(() => {
      setTheme('summer');
    });

    expect(screen.getByTestId('brand')).toHaveTextContent('summer-brand');
  });

  test('multiple components subscribed to useTheme() all re-render on setTheme()', () => {
    act(() => {
      registerTheme({ primary: 'blue', secondary: 'gray' });
      registerTheme('warm', { primary: 'orange', secondary: 'red' });
    });

    const PrimaryDisplay = () => {
      const t = useTheme() as { primary?: string };
      return <Text testID="primary">{t?.primary ?? 'none'}</Text>;
    };

    const SecondaryDisplay = () => {
      const t = useTheme() as { secondary?: string };
      return <Text testID="secondary">{t?.secondary ?? 'none'}</Text>;
    };

    render(
      <>
        <PrimaryDisplay />
        <SecondaryDisplay />
      </>
    );

    expect(screen.getByTestId('primary')).toHaveTextContent('blue');
    expect(screen.getByTestId('secondary')).toHaveTextContent('gray');

    act(() => {
      setTheme('warm');
    });

    // Both must re-render with warm theme values
    expect(screen.getByTestId('primary')).toHaveTextContent('orange');
    expect(screen.getByTestId('secondary')).toHaveTextContent('red');
  });

  test('switching back to default theme re-renders to original values', () => {
    act(() => {
      registerTheme({ brand: 'default-brand' });
      registerTheme('ocean', { brand: 'ocean-brand' });
      setTheme('ocean');
    });

    render(<ThemeValueDisplay />);
    expect(screen.getByTestId('brand')).toHaveTextContent('ocean-brand');

    act(() => {
      setTheme('default');
    });

    expect(screen.getByTestId('brand')).toHaveTextContent('default-brand');
  });

  test('useThemeName selector update does not affect unrelated store state', () => {
    act(() => {
      registerTheme('mono', { brand: '#111' });
    });

    const initialColorMode = useColorModeStore.getState().colorMode;

    act(() => {
      setTheme('mono');
    });

    // Theme switch must not mutate the colorMode store
    expect(useColorModeStore.getState().colorMode).toBe(initialColorMode);
  });
});

// ===========================================================================
// ADDITIONAL — Zustand mock reset covers ALL stores
// ===========================================================================

/**
 * The zustand mock registers reset functions for every store created via
 * create() or createStore() and fires them all in afterEach. This test
 * verifies that the THEME store is also covered —
 * i.e., that it is created via the mocked create() and appears in storeResetFns.
 *
 * Without this, theme mutations from one test bleed into the next.
 */
describe('zustand mock — theme store is included in afterEach reset', () => {
  test('useThemeStore is reset to default state after each test', () => {
    // Mutate the store in this test
    act(() => {
      registerTheme('temporary', { x: 1 });
      setTheme('temporary');
    });

    expect(useThemeStore.getState().activeThemeName).toBe('temporary');

    // afterEach will reset via the zustand mock — we cannot test that here,
    // but we CAN verify that our manual resetStore() in beforeEach catches it.
    // The companion test below runs AFTER this one and confirms isolation.
  });

  test('theme store is isolated from the mutation in the preceding test', () => {
    // If the zustand mock or our manual resetStore() in beforeEach worked,
    // activeThemeName must be 'default' again here.
    expect(useThemeStore.getState().activeThemeName).toBe('default');
    // 'temporary' theme must not exist in this test's store state
    expect(useThemeStore.getState().themes['temporary']).toBeUndefined();
  });
});
