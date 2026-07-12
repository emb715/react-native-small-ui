// ---------------------------------------------------------------------------
// Internal helpers — not exported, not part of the public API
// ---------------------------------------------------------------------------

/**
 * Parse any hex color string (#rgb or #rrggbb) into [r, g, b] channels [0–255].
 * Normalizes 3-digit shorthand: #f0a → #ff00aa.
 * This is the single entry point for hex → channels; all public utilities use it.
 */
function parseHex(hex: string): [number, number, number] {
  /* istanbul ignore next */
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/**
 * Convert [r, g, b] channels [0–255] to a 6-digit hex string (#rrggbb).
 */
function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

/**
 * Linear sRGB component → luminance contribution (IEC 61966-2-1).
 */
function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * WCAG relative luminance of a hex color (0 = black, 1 = white).
 */
function getLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * WCAG contrast ratio between two hex colors (1–21).
 */
function getContrast(f: string, b: string): number {
  const L1 = getLuminance(f);
  const L2 = getLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

/**
 * Convert [r, g, b] [0–255] to [h, s, l] where h ∈ [0,360), s,l ∈ [0,1].
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s, l];
}

/**
 * Convert [h, s, l] (h ∈ [0,360), s,l ∈ [0,1]) to [r, g, b] [0–255].
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number): number => {
    const tn = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hue + 1 / 3) * 255),
    Math.round(hue2rgb(hue) * 255),
    Math.round(hue2rgb(hue - 1 / 3) * 255),
  ];
}

const _COLOR_CONTRAST = {
  white: '#ffffff',
  black: '#000000',
} as const;

// ---------------------------------------------------------------------------
// Public utilities
// ---------------------------------------------------------------------------

/**
 * Determine whether a color's luminance makes it a "dark" or "light" color.
 * Returns 'light' when the color is dark (needs light-colored text on top),
 * 'dark' when the color is light (needs dark-colored text on top).
 */
export const getContrastMode = (color: string): 'light' | 'dark' => {
  const contrastColor = getContrastColor(color);
  return contrastColor === _COLOR_CONTRAST.white ? 'light' : 'dark';
};

/**
 * Return the highest-contrast text color (black or white) for a given background.
 * Uses WCAG relative luminance.
 *
 * @example
 * getContrastColor('#8b59a0') // '#ffffff'
 * getContrastColor('#f0f0f0') // '#000000'
 */
export const getContrastColor = (color: string): string => {
  const lightContrast = getContrast(color, _COLOR_CONTRAST.white);
  const darkContrast = getContrast(color, _COLOR_CONTRAST.black);
  return lightContrast > darkContrast
    ? _COLOR_CONTRAST.white
    : _COLOR_CONTRAST.black;
};

/**
 * Add alpha transparency to a hex color. Returns an 8-digit hex string (#rrggbbaa).
 * Accepts both 3-digit (#rgb) and 6-digit (#rrggbb) input.
 *
 * @param hexColor - Hex color string (#fff or #ffffff)
 * @param alpha    - Alpha value 0–1 (0 = transparent, 1 = opaque)
 *
 * @example
 * getHexAlpha('#000000', 0.5)  // '#00000080'
 * getHexAlpha('#fff', 0.1)     // '#ffffff1a'
 */
export function getHexAlpha(hexColor: string, alpha: number): string {
  if (!hexColor.startsWith('#')) {
    console.warn('getHexAlpha: missing # in hex color.');
    return hexColor;
  }
  const [r, g, b] = parseHex(hexColor);
  const hexAlpha = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return toHex(r, g, b) + hexAlpha;
}

/**
 * Convert a hex color to an rgba() CSS string.
 * Useful when rgba() is needed directly (e.g. boxShadow, web styles).
 *
 * @param hexColor - Hex color string (#rgb or #rrggbb)
 * @param alpha    - Alpha value 0–1 (default 1)
 *
 * @example
 * toRgba('#8b59a0', 0.5)  // 'rgba(139, 89, 160, 0.5)'
 * toRgba('#000')           // 'rgba(0, 0, 0, 1)'
 */
export function toRgba(hexColor: string, alpha = 1): string {
  const [r, g, b] = parseHex(hexColor);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Return the WCAG contrast ratio between two hex colors (range 1–21).
 * Use to verify accessibility compliance:
 *   ≥ 4.5 → WCAG AA (normal text)
 *   ≥ 3.0 → WCAG AA (large text / UI components)
 *   ≥ 7.0 → WCAG AAA
 *
 * @example
 * getContrastRatio('#ffffff', '#000000') // 21
 * getContrastRatio('#8b59a0', '#ffffff') // ~5.21 — passes AA
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  return Math.round(getContrast(hex1, hex2) * 100) / 100;
}

/**
 * Darken a hex color by reducing its HSL lightness.
 * Preserves hue and saturation — produces visually predictable shades.
 *
 * @param hexColor - Hex color string (#rgb or #rrggbb)
 * @param amount   - Lightness reduction 0–1 (0 = no change, 1 = black)
 *
 * @example
 * darken('#8b59a0', 0.1)  // darker purple, same hue
 * darken('#8b59a0', 0.3)  // pressed/active state shade
 */
export function darken(hexColor: string, amount: number): string {
  const [r, g, b] = parseHex(hexColor);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.max(0, l - Math.max(0, Math.min(1, amount)));
  return toHex(...hslToRgb(h, s, newL));
}

/**
 * Lighten a hex color by increasing its HSL lightness.
 * Preserves hue and saturation — produces visually predictable tints.
 *
 * @param hexColor - Hex color string (#rgb or #rrggbb)
 * @param amount   - Lightness increase 0–1 (0 = no change, 1 = white)
 *
 * @example
 * lighten('#8b59a0', 0.1)  // lighter purple, same hue
 * lighten('#8b59a0', 0.4)  // badge background / subtle tint
 */
export function lighten(hexColor: string, amount: number): string {
  const [r, g, b] = parseHex(hexColor);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.min(1, l + Math.max(0, Math.min(1, amount)));
  return toHex(...hslToRgb(h, s, newL));
}

/**
 * Mix two hex colors by linear interpolation of their RGB channels.
 * weight=0 → hex1, weight=1 → hex2.
 *
 * @example
 * mix('#000000', '#ffffff', 0.5)  // '#808080' (50% grey)
 * mix('#8b59a0', '#ffffff', 0.8)  // very light tint of purple
 */
export function mix(hex1: string, hex2: string, weight: number): string {
  const [r1, g1, b1] = parseHex(hex1);
  const [r2, g2, b2] = parseHex(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return toHex(r1 + (r2 - r1) * w, g1 + (g2 - g1) * w, b1 + (b2 - b1) * w);
}

export const ColorUtils = {
  getHexAlpha,
  getContrastColor,
  getContrastMode,
  getContrastRatio,
  toRgba,
  darken,
  lighten,
  mix,
};
