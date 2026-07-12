export interface MediaQueryDimensions {
  'width': number;
  'height': number;
  'device-width': number;
  'device-height': number;
  'orientation': 'landscape' | 'portrait';
  /**
   * Device pixel ratio (e.g. 2 for @2x screens).
   * Maps to `resolution` in dppx units: 1dppx = 96dpi = 1x pixel ratio.
   */
  'device-pixel-ratio': number;
  /**
   * Current color scheme as reported by the OS / app.
   * Used to evaluate `prefers-color-scheme: light | dark`.
   */
  'color-scheme': 'light' | 'dark';
}

/**
 * 1 rem / 1 em = 16px.
 * This constant is the canonical browser default font size used to convert
 * relative CSS units (rem, em) to absolute pixel values when no DOM context
 * is available (i.e. in React Native where there is no root element).
 */
const REM_PX = 16;

/** Convert a CSS value string (e.g. "768px", "48rem", "48em") to pixels. */
function toPx(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
    return parseFloat(trimmed) * REM_PX;
  }
  // Default unit is px (also handles explicit "px" suffix)
  return parseFloat(trimmed);
}

/**
 * Parse a CSS ratio value like "16/9" or "16 / 9" into a decimal number.
 * Returns NaN on malformed input.
 */
function toRatio(value: string): number {
  const parts = value.split('/');
  if (parts.length === 2) {
    const a = parseFloat(parts[0]!);
    const b = parseFloat(parts[1]!);
    if (!isNaN(a) && !isNaN(b) && b !== 0) return a / b;
  }
  // Single number (e.g. "1.777")
  const n = parseFloat(value);
  return isNaN(n) ? NaN : n;
}

/**
 * Convert a CSS resolution value to dppx (dots per CSS pixel = device pixel ratio).
 * Supported units: dppx (1:1), dpi (1dpi = 1/96 dppx), dpcm (1dpcm = 2.54/96 dppx).
 * Returns NaN for unknown units.
 */
function toDppx(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('dppx') || trimmed.endsWith('x')) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith('dpi')) {
    return parseFloat(trimmed) / 96;
  }
  if (trimmed.endsWith('dpcm')) {
    return parseFloat(trimmed) / (96 / 2.54);
  }
  return NaN;
}

/**
 * Evaluate a single media feature expression such as "(min-width: 768px)".
 *
 * Features that can be evaluated on native (via Dimensions + PixelRatio + Appearance):
 *   width, height, device-width, device-height (with min/max)
 *   aspect-ratio, device-aspect-ratio (with min/max)
 *   resolution (with min/max) — expressed as dppx/dpi/dpcm
 *   orientation
 *   prefers-color-scheme
 *   color (always true on native — all RN screens are color)
 *   hover, pointer — always 'none'/'coarse' on touch; useful for web-targeted queries
 *
 * Features that are always false on native (no RN API, or meaningless on mobile):
 *   prefers-reduced-motion, prefers-contrast, prefers-reduced-transparency,
 *   forced-colors, inverted-colors — AccessibilityInfo is async, not sync-queryable
 *   color-index, monochrome — not applicable to mobile screens
 *   scan, grid, update — print/TTY concepts
 *   color-gamut, dynamic-range, video-dynamic-range — no RN API
 *   scripting, overflow-block, overflow-inline — not applicable
 *   display-mode (except 'browser'/'standalone' which are indeterminate without Expo)
 *   any-hover, any-pointer — same as hover/pointer in pure RN
 *
 * Returns false for unsupported or unrecognised features (fail-safe — never throws).
 */
function matchExpression(expr: string, dims: MediaQueryDimensions): boolean {
  // Strip surrounding parentheses
  const inner = expr
    .replace(/^\s*\(\s*/, '')
    .replace(/\s*\)\s*$/, '')
    .trim();

  const colonIndex = inner.indexOf(':');
  if (colonIndex === -1) {
    // No colon → boolean feature (e.g. bare "color", "grid")
    const boolFeature = inner.toLowerCase();
    switch (boolFeature) {
      // color: true means the device has a color screen.
      // All React Native targets are color screens.
      case 'color':
        return true;
      case 'grid':
      case 'monochrome':
        return false;
      default:
        return false;
    }
  }

  const feature = inner.slice(0, colonIndex).trim().toLowerCase();
  const rawValue = inner.slice(colonIndex + 1).trim();

  switch (feature) {
    // ── Viewport width ───────────────────────────────────────────────────────
    case 'min-width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.width >= px;
    }
    case 'max-width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.width <= px;
    }
    case 'width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.width === px;
    }

    // ── Viewport height ──────────────────────────────────────────────────────
    case 'min-height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.height >= px;
    }
    case 'max-height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.height <= px;
    }
    case 'height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims.height === px;
    }

    // ── Device dimensions (deprecated in MQ4 but still widely used) ─────────
    case 'min-device-width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-width'] >= px;
    }
    case 'max-device-width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-width'] <= px;
    }
    case 'device-width': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-width'] === px;
    }
    case 'min-device-height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-height'] >= px;
    }
    case 'max-device-height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-height'] <= px;
    }
    case 'device-height': {
      const px = toPx(rawValue);
      return !isNaN(px) && dims['device-height'] === px;
    }

    // ── Aspect ratio ─────────────────────────────────────────────────────────
    case 'aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims.height === 0) return false;
      return dims.width / dims.height === target;
    }
    case 'min-aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims.height === 0) return false;
      return dims.width / dims.height >= target;
    }
    case 'max-aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims.height === 0) return false;
      return dims.width / dims.height <= target;
    }
    case 'device-aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims['device-height'] === 0) return false;
      return dims['device-width'] / dims['device-height'] === target;
    }
    case 'min-device-aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims['device-height'] === 0) return false;
      return dims['device-width'] / dims['device-height'] >= target;
    }
    case 'max-device-aspect-ratio': {
      const target = toRatio(rawValue);
      if (isNaN(target) || dims['device-height'] === 0) return false;
      return dims['device-width'] / dims['device-height'] <= target;
    }

    // ── Resolution ───────────────────────────────────────────────────────────
    // React Native's PixelRatio maps directly to dppx (1x = 1dppx = 96dpi).
    case 'resolution': {
      const dppx = toDppx(rawValue);
      return !isNaN(dppx) && dims['device-pixel-ratio'] === dppx;
    }
    case 'min-resolution': {
      const dppx = toDppx(rawValue);
      return !isNaN(dppx) && dims['device-pixel-ratio'] >= dppx;
    }
    case 'max-resolution': {
      const dppx = toDppx(rawValue);
      return !isNaN(dppx) && dims['device-pixel-ratio'] <= dppx;
    }

    // ── Orientation ──────────────────────────────────────────────────────────
    case 'orientation':
      return rawValue.toLowerCase() === dims.orientation;

    // ── Color ────────────────────────────────────────────────────────────────
    // All React Native screens are color. `color` with a value is the number
    // of bits per color component. Mobile screens are typically 8bpc.
    case 'color': {
      const bits = parseFloat(rawValue);
      return !isNaN(bits) && bits > 0 && bits <= 8;
    }
    case 'min-color': {
      const bits = parseFloat(rawValue);
      return !isNaN(bits) && bits <= 8;
    }
    case 'max-color': {
      const bits = parseFloat(rawValue);
      return !isNaN(bits) && bits >= 8;
    }

    // ── User preference ──────────────────────────────────────────────────────
    case 'prefers-color-scheme':
      return rawValue.toLowerCase() === dims['color-scheme'];

    // ── Interaction ──────────────────────────────────────────────────────────
    // Touch devices: primary input has no hover, pointer is coarse.
    case 'hover':
    case 'any-hover':
      return rawValue.toLowerCase() === 'none';
    case 'pointer':
    case 'any-pointer':
      return rawValue.toLowerCase() === 'coarse';

    // ── Always false on native ────────────────────────────────────────────────
    // AccessibilityInfo APIs are async — not sync-queryable at render time.
    case 'prefers-reduced-motion':
    case 'prefers-contrast':
    case 'prefers-reduced-transparency':
    case 'forced-colors':
    case 'inverted-colors':
    // Not applicable to mobile hardware.
    case 'color-index':
    case 'min-color-index':
    case 'max-color-index':
    case 'monochrome':
    case 'min-monochrome':
    case 'max-monochrome':
    // Print / TTY concepts with no mobile equivalent.
    case 'scan':
    case 'grid':
    case 'update':
    case 'overflow-block':
    case 'overflow-inline':
    // No RN API for display quality features.
    case 'color-gamut':
    case 'dynamic-range':
    case 'video-dynamic-range':
    // Indeterminate without Expo or a known shell.
    case 'display-mode':
    case 'scripting':
      return false;

    default:
      // Unknown feature — fail-safe
      return false;
  }
}

/**
 * Evaluate a single comma-free query segment (may start with "not").
 * Handles the `and` keyword to AND multiple expressions together.
 */
function matchSegment(segment: string, dims: MediaQueryDimensions): boolean {
  let s = segment.trim();

  // Detect and strip "not" modifier
  let negate = false;
  if (/^not\s/i.test(s)) {
    negate = true;
    s = s.slice(s.indexOf(' ') + 1).trim();
  }

  // Strip optional leading media type (e.g. "screen", "all", "print")
  // A media type is a bare word before the first "and" or opening paren.
  // We only care about feature expressions in parens.
  // Split on " and " (case-insensitive)
  const parts = s.split(/\s+and\s+/i);

  let result = true;
  for (const part of parts) {
    const trimmedPart = part.trim();
    // Skip bare media types (no parens), treat as matching (don't fail-safe on them)
    if (!trimmedPart.startsWith('(')) {
      // Bare media type word — skip (treat as passing so `and` chain continues)
      continue;
    }
    if (!matchExpression(trimmedPart, dims)) {
      result = false;
      break;
    }
  }

  return negate ? !result : result;
}

/**
 * Match a CSS media query string against a set of dimensions.
 *
 * On web: this function is never called — `useMediaQuery` delegates to the
 * browser's native `window.matchMedia` which supports the full spec.
 *
 * On native (iOS/Android): evaluates against React Native's Dimensions,
 * PixelRatio, and Appearance APIs. Features that cannot be evaluated
 * synchronously on native (e.g. prefers-reduced-motion) always return false —
 * consistent with a conservative, non-throwing fail-safe contract.
 *
 * Supported: width/height (with min/max), device-width/height (with min/max),
 *   aspect-ratio / device-aspect-ratio (with min/max),
 *   resolution (dppx/dpi/dpcm, with min/max),
 *   orientation, color (constant 8bpc), prefers-color-scheme,
 *   hover/any-hover (always 'none'), pointer/any-pointer (always 'coarse').
 *
 * Comma-separated queries are ORed. `not` modifier inverts the result.
 * Returns false for unsupported features (fail-safe — never throws).
 */
export function matchMediaQuery(
  query: string,
  dims: MediaQueryDimensions
): boolean {
  if (!query.trim()) return false;
  // Comma-separated segments = OR logic
  const segments = query.split(',');
  for (const segment of segments) {
    if (matchSegment(segment, dims)) {
      return true;
    }
  }
  return false;
}
