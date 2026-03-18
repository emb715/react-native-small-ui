import { renderHook } from '@testing-library/react-native';
import { useThemeStore } from '../theme.store';
import {
  getTheme,
  registerTheme,
  setTheme,
  useTheme,
  useThemeName,
} from '../useTheme';
import { generateSpaceUnits } from '../../../theme/theme';

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
