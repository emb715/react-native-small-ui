/**
 * Tests for react-native-small-ui/testing utilities.
 *
 * Coverage:
 *  renderWithSmallUI():
 *  1.  No options — renders normally, defaulting to current store colorMode
 *  2.  colorMode: 'dark' — component receives dark mode styles
 *  3.  colorMode: 'light' — component receives light mode styles
 *  4.  colorMode override does not leak between tests (store resets via mock)
 *  5.  Returns standard RNTL render result (getByTestId, etc.)
 *
 *  assertStyles():
 *  6.  Static style object — returned as-is (flat)
 *  7.  Ctx function — colorMode: 'dark' resolved correctly
 *  8.  Ctx function — colorMode: 'light' resolved correctly
 *  9.  Ctx function — breakpointWidth 0 resolves to 'default'
 *  10. Ctx function — breakpointWidth 768 resolves to 'md'
 *  11. Ctx function — breakpointWidth 1024 resolves to 'lg'
 *  12. Custom breakpoints — respects override map
 *  13. Default ctx — colorMode defaults to 'light', breakpointWidth to 0
 */

import { act } from '@testing-library/react-native';
import { View } from 'react-native';

import { createComponent } from '../smallUI';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';
import { renderWithSmallUI, assertStyles } from '../testing';

// Helper to cast a plain ctx function for test use (bypasses generic TProps constraint)
const fn = (f: (ctx: any) => Record<string, unknown>) => f as any; // any: test helper

beforeEach(() => {
  jest.useFakeTimers();
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// renderWithSmallUI
// ---------------------------------------------------------------------------

describe('renderWithSmallUI()', () => {
  // Defined at module level — correct pattern
  const ThemedBox = createComponent(View, {
    _light: { backgroundColor: '#ffffff' },
    _dark: { backgroundColor: '#000000' },
  });

  test('1. no options — renders without error, defaults to current store mode', () => {
    const { getByTestId } = renderWithSmallUI(<ThemedBox testID="box" />);
    expect(getByTestId('box')).toBeOnTheScreen();
  });

  test('2. colorMode: dark — component receives dark mode background', () => {
    const { getByTestId } = renderWithSmallUI(<ThemedBox testID="box" />, {
      colorMode: 'dark',
    });
    expect(getByTestId('box')).toHaveStyle({ backgroundColor: '#000000' });
  });

  test('3. colorMode: light — component receives light mode background', () => {
    const { getByTestId } = renderWithSmallUI(<ThemedBox testID="box" />, {
      colorMode: 'light',
    });
    expect(getByTestId('box')).toHaveStyle({ backgroundColor: '#ffffff' });
  });

  test('4. colorMode override does not leak between tests — store reset via mock', () => {
    // This test runs AFTER test 2 which set dark mode.
    // The zustand mock in __mocks__/zustand.ts resets all stores after each test.
    // beforeEach explicitly sets light too — confirming no leak.
    const { getByTestId } = renderWithSmallUI(<ThemedBox testID="box" />);
    // No override given → uses store state set by beforeEach ('light')
    expect(getByTestId('box')).toHaveStyle({ backgroundColor: '#ffffff' });
  });

  test('5. returns standard RNTL render result', () => {
    const result = renderWithSmallUI(<ThemedBox testID="box" />);
    // Standard RNTL queries must be available
    expect(typeof result.getByTestId).toBe('function');
    expect(typeof result.queryByTestId).toBe('function');
    expect(typeof result.findByTestId).toBe('function');
    expect(typeof result.unmount).toBe('function');
    // restoreWidth must be available (always present even when not used)
    expect(typeof result.restoreWidth).toBe('function');
  });

  test('6. variant components — dark mode variant resolved correctly', () => {
    const Button = createComponent(View, {
      variants: {
        intent: {
          primary: {
            _light: { backgroundColor: '#007AFF' },
            _dark: { backgroundColor: '#0A84FF' },
          },
        },
      },
      defaultVariants: { intent: 'primary' },
    });

    const { getByTestId } = renderWithSmallUI(<Button testID="btn" />, {
      colorMode: 'dark',
    });
    expect(getByTestId('btn')).toHaveStyle({ backgroundColor: '#0A84FF' });
  });
});

// ---------------------------------------------------------------------------
// assertStyles
// ---------------------------------------------------------------------------

describe('assertStyles()', () => {
  test('7. static style object — returned flat', () => {
    const result = assertStyles({ padding: 16, borderRadius: 8 } as any);
    expect(result).toMatchObject({ padding: 16, borderRadius: 8 });
  });

  test('8. ctx function — colorMode dark resolved', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
      })),
      { colorMode: 'dark' }
    );
    expect(result).toMatchObject({ backgroundColor: '#000' });
  });

  test('9. ctx function — colorMode light resolved', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
      })),
      { colorMode: 'light' }
    );
    expect(result).toMatchObject({ backgroundColor: '#fff' });
  });

  test('10. breakpointWidth 0 — resolves to default', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        padding: ctx.breakpoint({ default: 8, md: 16 }),
      })),
      { breakpointWidth: 0 }
    );
    expect(result).toMatchObject({ padding: 8 });
  });

  test('11. breakpointWidth 768 — resolves to md', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { breakpointWidth: 768 }
    );
    expect(result).toMatchObject({ padding: 16 });
  });

  test('12. breakpointWidth 1024 — resolves to lg', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { breakpointWidth: 1024 }
    );
    expect(result).toMatchObject({ padding: 24 });
  });

  test('13. custom breakpoints — respects override', () => {
    // Custom md starts at 900px. Width 800 should NOT match md.
    const result = assertStyles(
      fn((ctx: any) => ({
        padding: ctx.breakpoint({ default: 8, md: 16 }),
      })),
      {
        breakpointWidth: 800,
        breakpoints: {
          'default': 0,
          'xs': 480,
          'sm': 640,
          'md': 900,
          'lg': 1200,
          'xl': 1440,
          '2xl': 1920,
        },
      }
    );
    expect(result).toMatchObject({ padding: 8 });
  });

  test('14. default ctx — colorMode defaults to light, breakpointWidth to 0', () => {
    const result = assertStyles(
      fn((ctx: any) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
        padding: ctx.breakpoint({ default: 4, lg: 16 }),
      }))
    );
    expect(result).toMatchObject({ backgroundColor: '#fff', padding: 4 });
  });

  test('15. works with createComponent ctx factory directly', () => {
    // Simulates the __styleDef pattern: getResolvedStyles is the foundation.
    const styleFn = fn((ctx: any) => ({
      borderRadius: 8,
      padding: ctx.breakpoint({ default: 8, md: 16 }),
      backgroundColor: ctx.colorMode === 'dark' ? '#111' : '#fff',
    }));

    const dark800 = assertStyles(styleFn, {
      colorMode: 'dark',
      breakpointWidth: 800,
    });
    expect(dark800).toMatchObject({
      borderRadius: 8,
      padding: 16,
      backgroundColor: '#111',
    });

    const light0 = assertStyles(styleFn, {
      colorMode: 'light',
      breakpointWidth: 0,
    });
    expect(light0).toMatchObject({
      borderRadius: 8,
      padding: 8,
      backgroundColor: '#fff',
    });
  });
});
