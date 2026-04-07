/**
 * react-native-small-ui/testing
 *
 * Test utilities for components built with createComponent.
 *
 * Import in test files only — this module has a peer dependency on
 * @testing-library/react-native which must be installed as a devDependency.
 *
 * @example
 * import { renderWithSmallUI, assertStyles } from 'react-native-small-ui/testing';
 *
 * const Box = createComponent(View, {
 *   padding: 8,
 *   _light: { backgroundColor: '#fff' },
 *   _dark:  { backgroundColor: '#000' },
 * });
 *
 * test('dark mode background', async () => {
 *   const { getByTestId } = renderWithSmallUI(<Box testID="box" />, {
 *     colorMode: 'dark',
 *   });
 *   expect(getByTestId('box')).toHaveStyle({ backgroundColor: '#000' });
 * });
 *
 * test('resolved styles at md breakpoint in dark mode', () => {
 *   const resolved = assertStyles(
 *     (ctx) => ({
 *       padding: ctx.breakpoint({ default: 8, md: 16 }),
 *       backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
 *     }),
 *     { colorMode: 'dark', breakpointWidth: 800 }
 *   );
 *   expect(resolved).toMatchObject({ padding: 16, backgroundColor: '#000' });
 * });
 */

import React from 'react';
import { act, render } from '@testing-library/react-native';

import { useColorModeStore } from './hooks/useColorMode/colorMode.store';
import { getResolvedStyles } from './utils/helpers';
import type { ComponentStyle } from './smallUI.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RenderOptions = {
  /**
   * Override the active color mode for this render.
   * Defaults to the current store value (usually 'light' in tests).
   */
  colorMode?: 'light' | 'dark';

  /**
   * Simulated screen width in pixels, used to resolve breakpoint-dependent
   * styles. Sets window.innerWidth before rendering.
   * Defaults to 0 (only the 'default' breakpoint matches).
   */
  breakpointWidth?: number;
};

export type AssertStylesCtx = {
  colorMode?: 'light' | 'dark';
  breakpointWidth?: number;
  breakpoints?: Record<string, number>;
};

// ---------------------------------------------------------------------------
// renderWithSmallUI
// ---------------------------------------------------------------------------

/**
 * Renders a React element with SmallUI context overrides applied before
 * the render. Wraps @testing-library/react-native's `render`.
 *
 * Context overrides:
 * - `colorMode` — sets the Zustand colorMode store before rendering
 * - `breakpointWidth` — sets window.innerWidth to simulate a screen width
 *   (drives useMediaQuery and therefore breakpoint resolution in createComponent)
 *
 * Cleanup is automatic via RNTL's cleanup mechanism.
 *
 * ⚠️  Store overrides are applied via `act()` to flush React state updates.
 *     The Zustand store mock in `src/__mocks__/zustand.ts` resets all stores
 *     after each test — colorMode overrides are automatically cleaned up.
 *
 * @example
 * const { getByTestId } = renderWithSmallUI(
 *   <MyComponent testID="root" />,
 *   { colorMode: 'dark', breakpointWidth: 1024 }
 * );
 */
export function renderWithSmallUI(
  element: React.ReactElement,
  options: RenderOptions = {}
) {
  const { colorMode, breakpointWidth } = options;

  // Override colorMode store synchronously before render.
  if (colorMode !== undefined) {
    act(() => {
      useColorModeStore.setState({ colorMode });
    });
  }

  // Override window.innerWidth to drive matchMedia breakpoint resolution.
  // The matchMedia polyfill used by useMediaQuery reads window.innerWidth
  // when evaluating min-width queries.
  let previousWidth: number | undefined;
  if (breakpointWidth !== undefined) {
    previousWidth = (global as any).window?.innerWidth;
    if (typeof (global as any).window !== 'undefined') {
      Object.defineProperty((global as any).window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: breakpointWidth,
      });
    }
  }

  const result = render(element);

  return {
    ...result,
    /**
     * Restore any window.innerWidth override applied during this render.
     * Called automatically when the test file uses afterEach cleanup,
     * but exposed here for explicit teardown when needed.
     */
    restoreWidth() {
      if (
        breakpointWidth !== undefined &&
        typeof (global as any).window !== 'undefined'
      ) {
        Object.defineProperty((global as any).window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: previousWidth ?? 0,
        });
      }
    },
  };
}

// ---------------------------------------------------------------------------
// assertStyles
// ---------------------------------------------------------------------------

/**
 * Pure-function style assertion helper. Resolves a ComponentStyle to a flat
 * style object given a context — no rendering required.
 *
 * Built on top of `getResolvedStyles()`. Returns the resolved object directly
 * so you can chain `.toMatchObject()`, `.toEqual()`, etc.
 *
 * Useful for testing ctx factory functions in isolation, without needing to
 * render a component and inspect DOM/native elements.
 *
 * @param styleDef  - A ComponentStyle (static object or ctx factory function)
 * @param ctx       - The resolution context
 * @returns         Resolved flat style object
 *
 * @example
 * const resolved = assertStyles(
 *   (ctx) => ({
 *     padding: ctx.breakpoint({ default: 8, md: 16 }),
 *     backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
 *   }),
 *   { colorMode: 'dark', breakpointWidth: 800 }
 * );
 * expect(resolved).toMatchObject({ padding: 16, backgroundColor: '#000' });
 *
 * @example
 * // Static style — just identity, useful for uniformity in test suites
 * const resolved = assertStyles({ padding: 8, borderRadius: 4 } as any);
 * expect(resolved.padding).toBe(8);
 */
export function assertStyles<T extends { style?: unknown }>(
  styleDef: ComponentStyle<T>,
  ctx: AssertStylesCtx = {}
): Record<string, unknown> {
  return getResolvedStyles(styleDef, ctx);
}
