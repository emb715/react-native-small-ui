import { StyleSheet } from 'react-native';

import { getContrastMode } from './colors.utils';

export function getStatusBarStyle(bgColor: string) {
  const contrast = getContrastMode(bgColor);
  return contrast === 'light' ? 'light-content' : 'dark-content';
}

// ---------------------------------------------------------------------------
// cs() — Style merge utility
// ---------------------------------------------------------------------------

type StyleInput = object | null | undefined | false | 0 | '';

/**
 * Merges multiple style objects into one, filtering out falsy values.
 * Last-write-wins on key conflicts — identical to how StyleSheet.flatten
 * behaves, but works with any plain object (including ExtendedProps shapes
 * with _light, _dark, _ios, etc.).
 *
 * The RN equivalent of `cn()` from the web ecosystem.
 *
 * @example
 * const style = cs(
 *   { padding: 8, borderRadius: 4 },
 *   isActive && { backgroundColor: '#007AFF' },
 *   disabled && { opacity: 0.5 },
 * );
 *
 * @example
 * // Works with _light/_dark variants too
 * const style = cs(
 *   baseStyles,
 *   { _light: { color: '#000' }, _dark: { color: '#fff' } },
 * );
 */
export function cs(...styles: StyleInput[]): Record<string, unknown> {
  let result: Record<string, unknown> = {};
  for (const style of styles) {
    if (!style) continue;
    result = { ...result, ...(style as Record<string, unknown>) };
  }
  return result;
}

// ---------------------------------------------------------------------------
// getResolvedStyles() — Style Introspection API
// ---------------------------------------------------------------------------

import type { ComponentStyle, StyleCtx, BreakPointKey } from '../smallUI.types';

type IntrospectionCtx = {
  colorMode?: 'light' | 'dark';
  breakpointWidth?: number;
  breakpoints?: Record<string, number>;
};

const DEFAULT_BREAKPOINTS: Record<BreakPointKey, number> = {
  'default': 0,
  'xs': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

const BREAKPOINT_ORDER: BreakPointKey[] = [
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  'default',
];

/**
 * Pure-function style resolver. Returns the fully resolved flat style object
 * for a given style definition and context — no rendering required.
 *
 * Useful for:
 * - Testing: assert exact styles without a renderer
 * - Documentation / design handoff: export resolved styles per mode/platform
 * - Tooling: inspect what a component would render under specific conditions
 *
 * @param styleDef  - A ComponentStyle (static object or ctx factory function)
 * @param ctx       - The context to resolve against
 *
 * @example
 * const Box = createComponent(View, (ctx) => ({
 *   padding: ctx.breakpoint({ default: 8, md: 16 }),
 *   backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
 * }));
 *
 * // Inspect what Box would look like at md breakpoint in dark mode:
 * const styles = getResolvedStyles(Box.__styleDef, {
 *   colorMode: 'dark',
 *   breakpointWidth: 800,
 * });
 * // => { padding: 16, backgroundColor: '#000' }
 */
export function getResolvedStyles<T extends { style?: unknown }>(
  styleDef: ComponentStyle<T>,
  ctx: IntrospectionCtx = {}
): Record<string, unknown> {
  const {
    colorMode = 'light',
    breakpointWidth = 0,
    breakpoints = DEFAULT_BREAKPOINTS,
  } = ctx;

  // Build match states from breakpointWidth
  const matchStates = {} as Record<BreakPointKey, boolean>;
  for (const key of BREAKPOINT_ORDER) {
    const px = (breakpoints as Record<string, number>)[key] ?? 0;
    matchStates[key] = breakpointWidth >= px;
  }

  // Build the synthetic ctx
  const syntheticCtx: StyleCtx = {
    colorMode,
    breakpoint: <V>(
      values: Partial<Record<BreakPointKey, V>>
    ): V | undefined => {
      for (const key of BREAKPOINT_ORDER) {
        if (key in values && matchStates[key]) {
          return values[key];
        }
      }
      return undefined;
    },
  };

  // Resolve the style definition
  const resolved =
    typeof styleDef === 'function' ? styleDef(syntheticCtx) : styleDef;

  if (!resolved) return {} as Record<string, unknown>;

  // Flatten using StyleSheet to normalize (handles arrays, nested objects)
  const flat = StyleSheet.flatten(
    resolved as Parameters<typeof StyleSheet.flatten>[0]
  );
  return (flat ?? {}) as Record<string, unknown>;
}
