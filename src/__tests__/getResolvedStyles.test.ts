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

// ===========================================================================
// ctx.breakpoint returns undefined when no key matches
//   Covers helpers.ts line 132: return undefined
// ===========================================================================

describe('getResolvedStyles — ctx.breakpoint returns undefined when no key matches', () => {
  test('breakpoint() returns undefined when passed an empty values object', () => {
    // An empty values object has no keys → the for-loop in breakpoint() never
    // finds a match → falls through to `return undefined` (line 132).
    const result = getResolvedStyles(
      fn((ctx) => ({ padding: ctx.breakpoint({}) })),
      { breakpointWidth: 768 }
    );
    // ctx.breakpoint({}) → undefined → padding: undefined in the resolved object
    expect(result.padding).toBeUndefined();
  });

  test('breakpoint() returns undefined when values object has no matching breakpoint key', () => {
    // Values only has '2xl' key; at width 0 only 'default' and lower breakpoints
    // match — '2xl' requires width ≥ 1920. At width=0, no key ever matches → undefined.
    const result = getResolvedStyles(
      fn((ctx) => ({ padding: ctx.breakpoint({ '2xl': 99 }) })),
      { breakpointWidth: 0 }
    );
    expect(result.padding).toBeUndefined();
  });
});

// ===========================================================================
// GAP 4 — getResolvedStyles() with simultaneous platform + colorMode combinations
// ===========================================================================

/**
 * All existing getResolvedStyles tests vary exactly ONE dimension at a time:
 *   - colorMode only, OR
 *   - breakpointWidth only.
 *
 * Real-world style functions combine BOTH. The known insertion-order bug in
 * useBreakPointValue (Object.entries(...).findLast) is NOT exercised because
 * getResolvedStyles uses BREAKPOINT_ORDER directly — but this tests the
 * combined resolution path thoroughly.
 *
 * **Handoff → ndv-diagnose (root cause):** useBreakPointValue.tsx —
 *   Object.entries(...).findLast depends on insertion order, not pixel-value
 *   sort order. Custom breakpoints with out-of-order registration will resolve
 *   to wrong breakpoint values.
 */
describe('getResolvedStyles() — simultaneous colorMode + breakpointWidth combinations', () => {
  // Helper to bypass generic TProps constraint (same pattern as other test files)
  const fn = (f: (ctx: StyleCtx) => Record<string, unknown>) => f as any;

  test('dark mode + md breakpoint — both dimensions resolved in one call', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { colorMode: 'dark', breakpointWidth: 768 }
    );
    expect(result).toMatchObject({
      backgroundColor: '#000',
      padding: 16,
    });
  });

  test('light mode + lg breakpoint — both dimensions resolved correctly', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
        padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
      })),
      { colorMode: 'light', breakpointWidth: 1024 }
    );
    expect(result).toMatchObject({
      backgroundColor: '#fff',
      padding: 24,
    });
  });

  test('dark mode + xs breakpoint — xs is narrower than md, must NOT resolve to md', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        color: ctx.colorMode === 'dark' ? 'white' : 'black',
        fontSize: ctx.breakpoint({ default: 12, xs: 13, md: 16 }),
      })),
      { colorMode: 'dark', breakpointWidth: 480 } // xs=480, md=768 — should resolve xs not md
    );
    expect(result).toMatchObject({
      color: 'white',
      fontSize: 13,
    });
  });

  test('light mode + 2xl breakpoint — highest breakpoint wins', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        opacity: ctx.colorMode === 'dark' ? 0.9 : 1,
        padding: ctx.breakpoint({ 'default': 4, 'md': 8, 'xl': 12, '2xl': 16 }),
      })),
      { colorMode: 'light', breakpointWidth: 1536 }
    );
    expect(result).toMatchObject({
      opacity: 1,
      padding: 16,
    });
  });

  test('dark mode + default breakpoint (width=0) — only default matches', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        margin: ctx.colorMode === 'dark' ? 2 : 4,
        padding: ctx.breakpoint({ default: 8, lg: 24 }),
      })),
      { colorMode: 'dark', breakpointWidth: 0 }
    );
    expect(result).toMatchObject({
      margin: 2,
      padding: 8,
    });
  });

  test('style fn with no breakpoint reads — colorMode still resolves independently', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        backgroundColor: ctx.colorMode === 'dark' ? '#111' : '#eee',
        borderRadius: 8, // static — not breakpoint-dependent
      })),
      { colorMode: 'dark', breakpointWidth: 1200 }
    );
    expect(result).toMatchObject({
      backgroundColor: '#111',
      borderRadius: 8,
    });
  });

  test('style fn with no colorMode reads — breakpoint still resolves independently', () => {
    const result = getResolvedStyles(
      fn((ctx) => ({
        padding: ctx.breakpoint({ default: 4, sm: 8, lg: 20 }),
        borderWidth: 1, // static
      })),
      { colorMode: 'light', breakpointWidth: 640 } // sm=640
    );
    expect(result).toMatchObject({
      padding: 8,
      borderWidth: 1,
    });
  });
});
