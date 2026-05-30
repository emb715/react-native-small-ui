export interface MediaQueryDimensions {
  'width': number;
  'height': number;
  'device-width': number;
  'device-height': number;
  'orientation': 'landscape' | 'portrait';
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
 * Evaluate a single media feature expression such as "(min-width: 768px)".
 * Returns false for unsupported features (fail-safe — does not throw).
 */
function matchExpression(expr: string, dims: MediaQueryDimensions): boolean {
  // Strip surrounding parentheses
  const inner = expr
    .replace(/^\s*\(\s*/, '')
    .replace(/\s*\)\s*$/, '')
    .trim();

  const colonIndex = inner.indexOf(':');
  if (colonIndex === -1) {
    // No colon → not a feature we support (e.g. bare "screen", "print")
    return false;
  }

  const feature = inner.slice(0, colonIndex).trim().toLowerCase();
  const rawValue = inner.slice(colonIndex + 1).trim();

  switch (feature) {
    case 'min-width': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims.width >= px;
    }
    case 'max-width': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims.width <= px;
    }
    case 'min-height': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims.height >= px;
    }
    case 'max-height': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims.height <= px;
    }
    case 'min-device-width': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims['device-width'] >= px;
    }
    case 'max-device-width': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims['device-width'] <= px;
    }
    case 'min-device-height': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims['device-height'] >= px;
    }
    case 'max-device-height': {
      const px = toPx(rawValue);
      if (isNaN(px)) return false;
      return dims['device-height'] <= px;
    }
    case 'orientation': {
      return rawValue.toLowerCase() === dims.orientation;
    }
    default:
      // Unsupported feature — fail-safe
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
 * Supports: min-width, max-width, min-height, max-height,
 *           device-width, device-height (with min/max), and orientation.
 * Unit support: px (default), rem and em (converted at REM_PX = 16).
 * Comma-separated queries are ORed. `not` modifier inverts the result.
 * Returns false for unsupported features (fail-safe).
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
