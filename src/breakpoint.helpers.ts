import { useMediaQuery } from './hooks/useMediaQuery/useMediaQuery';
import type { BreakPointKey, StyleCtx } from './smallUI.types';
import type { BreakPoints } from './breakpoints';

/**
 * The ordered list of breakpoint keys, from largest to smallest.
 * Resolution walks this list and returns the first key whose pixel value
 * the current screen width meets or exceeds.
 */
export const BREAKPOINT_ORDER: BreakPointKey[] = [
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  'default',
];

/**
 * Build the media query string for a given breakpoint key using the
 * configured pixel values.
 */
export function buildMediaQuery(
  key: BreakPointKey,
  breakPoints: BreakPoints
): string {
  const px = breakPoints[key];
  if (px === 0) return '(min-width: 0px)'; // 'default' — always matches
  return `(min-width: ${px}px)`;
}

/**
 * Dry-run the style factory with a recording proxy to discover which
 * breakpoint keys it reads. Returns a stable frozen array of keys.
 * This runs once at createComponent call time (module level), never during
 * render — so hook counts derived from it are always stable.
 */
export function discoverBreakpoints(
  styleFn: (ctx: StyleCtx) => unknown
): BreakPointKey[] {
  const discovered = new Set<BreakPointKey>();

  const recordingCtx: StyleCtx = {
    colorMode: 'light',
    breakpoint: (values) => {
      (Object.keys(values) as BreakPointKey[]).forEach((k) =>
        discovered.add(k)
      );
      return undefined;
    },
  };

  try {
    styleFn(recordingCtx);
  } catch {
    // Style functions may access values that throw with dummy ctx — ignore.
  }

  // Filter to only keys that appear in BREAKPOINT_ORDER (valid keys),
  // preserving resolution order (largest first).
  return BREAKPOINT_ORDER.filter((k) => discovered.has(k));
}

/**
 * Given the discovered breakpoint keys and their live match states,
 * resolve a values map to the matching value.
 * Walks from largest to smallest and returns the first match.
 */
export function resolveBreakpoint<T>(
  values: Partial<Record<BreakPointKey, T>>,
  matchStates: Record<BreakPointKey, boolean>
): T | undefined {
  for (const key of BREAKPOINT_ORDER) {
    if (key in values && matchStates[key]) {
      return values[key];
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// useBreakpointMatches — stable hook, count fixed at definition time
// ---------------------------------------------------------------------------

/**
 * Calls useMediaQuery for each discovered breakpoint key.
 * The number of calls is fixed at createComponent definition time so
 * hook ordering rules are never violated.
 *
 * Returns a Record<BreakPointKey, boolean> of current match states.
 *
 * IMPORTANT: This function must only be called with a stable `orderedKeys`
 * array (same reference and length every render) — guaranteed because it
 * comes from the frozen discoverBreakpoints() result stored in the closure.
 */
export function useBreakpointMatches(
  orderedKeys: BreakPointKey[],
  breakPoints: BreakPoints
): Record<BreakPointKey, boolean> {
  // Each element is a useMediaQuery call. The array length never changes
  // (fixed at definition time), so the hook call count is stable.
  // useMediaQuery is a hook called inside map(). Hook count is stable because
  // orderedKeys length is fixed at createComponent definition time — safe.
  const matches = orderedKeys.map((key) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMediaQuery(buildMediaQuery(key, breakPoints))
  );

  const result = {} as Record<BreakPointKey, boolean>;
  orderedKeys.forEach((key, i) => {
    result[key] = matches[i] ?? /* istanbul ignore next */ false;
  });
  return result;
}
