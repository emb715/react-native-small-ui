/**
 * Tests for getResolvedStyles() — Style Introspection API.
 *
 * Coverage:
 *  1.  Static style object — returned as-is (flattened)
 *  2.  Ctx function — colorMode: 'light' resolution
 *  3.  Ctx function — colorMode: 'dark' resolution
 *  4.  Ctx function — breakpoint resolution at default width (0px)
 *  5.  Ctx function — breakpoint resolution at md width (768px)
 *  6.  Ctx function — breakpoint resolution at lg width (1024px)
 *  7.  Default ctx — colorMode defaults to 'light', breakpointWidth to 0
 *  8.  Custom breakpoints — respects overridden breakpoint map
 */

import { getResolvedStyles } from '../utils/helpers';
import type { StyleCtx } from '../smallUI.types';

// Helper to cast a plain ctx function for test use (bypasses generic TProps constraint)
const fn = (f: (ctx: StyleCtx) => Record<string, unknown>) => f as any; // any: test helper only

describe('getResolvedStyles()', () => {
  test('static style object — returned flattened', () => {
    const result = getResolvedStyles({ padding: 16, borderRadius: 8 } as any); // any: test with plain object
    expect(result).toMatchObject({ padding: 16, borderRadius: 8 });
  });

  test('ctx function — resolves colorMode: light', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
      })),
      { colorMode: 'light' }
    );
    expect(result).toMatchObject({ backgroundColor: '#fff' });
  });

  test('ctx function — resolves colorMode: dark', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
      })),
      { colorMode: 'dark' }
    );
    expect(result).toMatchObject({ backgroundColor: '#000' });
  });

  test('ctx function — breakpoint at width 0 resolves to default', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({ padding: ctx.breakpoint({ default: 8, md: 16 }) })),
      { breakpointWidth: 0 }
    );
    expect(result).toMatchObject({ padding: 8 });
  });

  test('ctx function — breakpoint at width 768 resolves to md', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { breakpointWidth: 768 }
    );
    expect(result).toMatchObject({ padding: 16 });
  });

  test('ctx function — breakpoint at width 1024 resolves to lg', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { breakpointWidth: 1024 }
    );
    expect(result).toMatchObject({ padding: 24 });
  });

  test('default ctx — colorMode defaults to light, breakpointWidth to 0', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
        padding: ctx.breakpoint({ default: 4, lg: 16 }),
      }))
    );
    expect(result).toMatchObject({ backgroundColor: '#fff', padding: 4 });
  });

  test('custom breakpoints — respects overridden breakpoint map', () => {
    // Custom md starts at 900px instead of default 768px.
    // At width 800px, md should NOT match.
    const result = getResolvedStyles(
      fn((ctx) => ({ padding: ctx.breakpoint({ default: 8, md: 16 }) })),
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
});
