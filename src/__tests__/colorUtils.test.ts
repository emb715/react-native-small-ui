/**
 * Adversarial test suite — ColorUtils
 *
 * Functions covered (all 8 public members of ColorUtils):
 *   1. getHexAlpha     — existing tests cover 2 happy paths + warn; this suite
 *                        adds boundary, clamp, and shorthand cases
 *   2. getContrastColor — zero prior coverage
 *   3. getContrastMode  — zero prior coverage
 *   4. getContrastRatio — zero prior coverage
 *   5. toRgba           — zero prior coverage
 *   6. darken           — zero prior coverage
 *   7. lighten          — zero prior coverage
 *   8. mix              — zero prior coverage
 *
 * Strategy:
 *   - All expected values are pre-computed from the actual implementation
 *     logic (parseHex → toHex → hslToRgb / getLuminance / etc.) so a
 *     1-unit deviation in any intermediate step is caught immediately.
 *   - Boundary values: alpha/amount/weight = 0 and 1.
 *   - Clamp values: inputs outside [0,1] must be silently clamped, never
 *     produce hex digits > ff, rgba alpha > 1, or negative lightness.
 *   - 3-digit shorthand hex (#rgb) is exercised where the function accepts it.
 *   - Pure black (#000000), pure white (#ffffff), and mid-grey (#808080) are
 *     used as known anchors because their RGB, HSL, and luminance values are
 *     trivially verifiable by hand.
 *
 * NOTE — docstring discrepancy found (not a bug in code, bug in docs):
 *   The JSDoc example states getContrastRatio('#8b59a0', '#ffffff') // ~4.7
 *   The actual WCAG computation yields 5.21. The code is correct; the comment
 *   is wrong. See handoff at the bottom of this file.
 *
 * Import: ColorUtils is the named namespace export; individual functions are
 * also re-exported directly from colors.utils but we use the namespace to
 * match the public API contract documented in CLAUDE.md.
 */

import { ColorUtils } from '../utils/colors.utils';

// ---------------------------------------------------------------------------
// 1. getHexAlpha
// ---------------------------------------------------------------------------

describe('ColorUtils.getHexAlpha', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  // --- happy path ---

  test('should return correct 8-digit hex for #000000 at alpha 0.5', () => {
    // 0.5 * 255 = 127.5 → Math.round → 128 → 0x80
    expect(ColorUtils.getHexAlpha('#000000', 0.5)).toBe('#00000080');
  });

  test('should return correct 8-digit hex for #ff0000 at alpha 0.5', () => {
    expect(ColorUtils.getHexAlpha('#ff0000', 0.5)).toBe('#ff000080');
  });

  test('should expand 3-digit shorthand #fff to #ffffff before appending alpha', () => {
    // #fff → #ffffff, 0.1 * 255 = 25.5 → 26 → 0x1a
    expect(ColorUtils.getHexAlpha('#fff', 0.1)).toBe('#ffffff1a');
  });

  test('should expand 3-digit shorthand #000 at alpha 0.5', () => {
    expect(ColorUtils.getHexAlpha('#000', 0.5)).toBe('#00000080');
  });

  // --- boundary: alpha = 0 ---

  test('should produce #rrggbb00 when alpha is exactly 0 (fully transparent)', () => {
    // Math.round(0 * 255) = 0 → '00'
    expect(ColorUtils.getHexAlpha('#ff5500', 0)).toBe('#ff550000');
  });

  test('should produce #rrggbbff when alpha is exactly 1 (fully opaque)', () => {
    // Math.round(1 * 255) = 255 → 'ff'
    expect(ColorUtils.getHexAlpha('#ff5500', 1)).toBe('#ff5500ff');
  });

  // --- clamp: alpha outside [0, 1] ---

  test('should clamp alpha -0.5 to 0 — must not produce negative hex byte', () => {
    // Math.max(0, Math.min(1, -0.5)) = 0 → '00'
    expect(ColorUtils.getHexAlpha('#ff0000', -0.5)).toBe('#ff000000');
  });

  test('should clamp alpha 1.5 to 1 — must not overflow ff', () => {
    // Math.max(0, Math.min(1, 1.5)) = 1 → 'ff'
    expect(ColorUtils.getHexAlpha('#ff0000', 1.5)).toBe('#ff0000ff');
  });

  // --- missing # prefix ---

  test('should call console.warn when # prefix is missing', () => {
    ColorUtils.getHexAlpha('ff0000', 0.5);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'getHexAlpha: missing # in hex color.'
    );
  });

  test('should return the original string unchanged when # prefix is missing', () => {
    const input = 'ff0000';
    expect(ColorUtils.getHexAlpha(input, 0.5)).toBe(input);
  });

  test('should not mutate or process the input when # is absent', () => {
    // Ensures guard-return fires before any parseHex call
    const result = ColorUtils.getHexAlpha('not-a-hex', 0.9);
    expect(result).toBe('not-a-hex');
  });

  // --- edge: known colors ---

  test('pure white #ffffff at alpha 0 should be #ffffff00', () => {
    expect(ColorUtils.getHexAlpha('#ffffff', 0)).toBe('#ffffff00');
  });

  test('pure white #ffffff at alpha 1 should be #ffffffff', () => {
    expect(ColorUtils.getHexAlpha('#ffffff', 1)).toBe('#ffffffff');
  });

  test('mid-grey #808080 at alpha 0.5 should be #80808080', () => {
    // Math.round(0.5 * 255) = 128 → 0x80
    expect(ColorUtils.getHexAlpha('#808080', 0.5)).toBe('#80808080');
  });
});

// ---------------------------------------------------------------------------
// 2. getContrastColor
// ---------------------------------------------------------------------------

describe('ColorUtils.getContrastColor', () => {
  // --- known dark colors must return white ---

  test('dark purple #8b59a0 must return white (WCAG example from docs)', () => {
    expect(ColorUtils.getContrastColor('#8b59a0')).toBe('#ffffff');
  });

  test('pure black #000000 must return white', () => {
    expect(ColorUtils.getContrastColor('#000000')).toBe('#ffffff');
  });

  test('dark navy #1a237e must return white', () => {
    expect(ColorUtils.getContrastColor('#1a237e')).toBe('#ffffff');
  });

  // --- known light colors must return black ---

  test('pure white #ffffff must return black', () => {
    expect(ColorUtils.getContrastColor('#ffffff')).toBe('#000000');
  });

  test('near-white #f0f0f0 must return black', () => {
    expect(ColorUtils.getContrastColor('#f0f0f0')).toBe('#000000');
  });

  test('mid-grey #808080 must return black (luminance > 0.179 threshold)', () => {
    // #808080 luminance ≈ 0.2159 — closer to white, returns black
    expect(ColorUtils.getContrastColor('#808080')).toBe('#000000');
  });

  // --- return value is always one of two exact strings ---

  test('return value must always be exactly #ffffff or #000000', () => {
    const colors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff00',
      '#8b59a0',
      '#cccccc',
    ];
    for (const color of colors) {
      const result = ColorUtils.getContrastColor(color);
      expect(['#ffffff', '#000000']).toContain(result);
    }
  });

  // --- 3-digit shorthand input ---

  test('3-digit shorthand #fff (white) must return black', () => {
    expect(ColorUtils.getContrastColor('#fff')).toBe('#000000');
  });

  test('3-digit shorthand #000 (black) must return white', () => {
    expect(ColorUtils.getContrastColor('#000')).toBe('#ffffff');
  });
});

// ---------------------------------------------------------------------------
// 3. getContrastMode
// ---------------------------------------------------------------------------

describe('ColorUtils.getContrastMode', () => {
  // getContrastMode wraps getContrastColor:
  //   white result → 'light' (dark background needs light-colored text)
  //   black result → 'dark'  (light background needs dark-colored text)

  test('dark color #8b59a0 must return "light" (needs light text on top)', () => {
    expect(ColorUtils.getContrastMode('#8b59a0')).toBe('light');
  });

  test('pure black #000000 must return "light"', () => {
    expect(ColorUtils.getContrastMode('#000000')).toBe('light');
  });

  test('pure white #ffffff must return "dark"', () => {
    expect(ColorUtils.getContrastMode('#ffffff')).toBe('dark');
  });

  test('near-white #f0f0f0 must return "dark"', () => {
    expect(ColorUtils.getContrastMode('#f0f0f0')).toBe('dark');
  });

  test('mid-grey #808080 must return "dark"', () => {
    expect(ColorUtils.getContrastMode('#808080')).toBe('dark');
  });

  test('return value must always be exactly "light" or "dark"', () => {
    const samples = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffffff',
      '#000000',
      '#888888',
    ];
    for (const color of samples) {
      const result = ColorUtils.getContrastMode(color);
      expect(['light', 'dark']).toContain(result);
    }
  });

  test('3-digit shorthand #000 must return "light"', () => {
    expect(ColorUtils.getContrastMode('#000')).toBe('light');
  });

  test('3-digit shorthand #fff must return "dark"', () => {
    expect(ColorUtils.getContrastMode('#fff')).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// 4. getContrastRatio
// ---------------------------------------------------------------------------

describe('ColorUtils.getContrastRatio', () => {
  // All expected values verified via the same WCAG formula used in the impl.
  // Formula: (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05), rounded to 2dp.

  // --- WCAG anchor cases ---

  test('#ffffff vs #000000 must return 21 (maximum possible WCAG contrast)', () => {
    expect(ColorUtils.getContrastRatio('#ffffff', '#000000')).toBe(21);
  });

  test('#000000 vs #ffffff must also return 21 (order must not matter)', () => {
    expect(ColorUtils.getContrastRatio('#000000', '#ffffff')).toBe(21);
  });

  test('same color vs itself must return 1 (minimum possible contrast)', () => {
    expect(ColorUtils.getContrastRatio('#808080', '#808080')).toBe(1);
  });

  test('#000000 vs #000000 must return 1', () => {
    expect(ColorUtils.getContrastRatio('#000000', '#000000')).toBe(1);
  });

  test('#ffffff vs #ffffff must return 1', () => {
    expect(ColorUtils.getContrastRatio('#ffffff', '#ffffff')).toBe(1);
  });

  // --- WCAG AA compliance case ---

  test('#8b59a0 vs #ffffff must be 5.21 — passes WCAG AA (≥4.5) for normal text', () => {
    // IMPORTANT: The JSDoc says "~4.7" but the actual computation is 5.21.
    // The test asserts the mathematically correct value. See handoff note.
    const ratio = ColorUtils.getContrastRatio('#8b59a0', '#ffffff');
    expect(ratio).toBe(5.21);
    expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA normal text
  });

  // --- result is always in [1, 21] ---

  test('result must always be between 1 and 21 inclusive', () => {
    const pairs: [string, string][] = [
      ['#ff0000', '#00ff00'],
      ['#0000ff', '#ffff00'],
      ['#8b59a0', '#f0e6ff'],
      ['#1a237e', '#e8eaf6'],
    ];
    for (const [a, b] of pairs) {
      const ratio = ColorUtils.getContrastRatio(a, b);
      expect(ratio).toBeGreaterThanOrEqual(1);
      expect(ratio).toBeLessThanOrEqual(21);
    }
  });

  // --- commutative property ---

  test('must be commutative — ratio(a, b) === ratio(b, a)', () => {
    const ratio1 = ColorUtils.getContrastRatio('#8b59a0', '#f0f0f0');
    const ratio2 = ColorUtils.getContrastRatio('#f0f0f0', '#8b59a0');
    expect(ratio1).toBe(ratio2);
  });

  // --- 3-digit shorthand ---

  test('3-digit shorthand #fff vs #000 must equal 21', () => {
    expect(ColorUtils.getContrastRatio('#fff', '#000')).toBe(21);
  });
});

// ---------------------------------------------------------------------------
// 5. toRgba
// ---------------------------------------------------------------------------

describe('ColorUtils.toRgba', () => {
  // --- happy path ---

  test('#000 must produce rgba(0, 0, 0, 1) with default alpha', () => {
    expect(ColorUtils.toRgba('#000')).toBe('rgba(0, 0, 0, 1)');
  });

  test('#000000 must produce rgba(0, 0, 0, 1) with default alpha', () => {
    expect(ColorUtils.toRgba('#000000')).toBe('rgba(0, 0, 0, 1)');
  });

  test('#ffffff at alpha 0.5 must produce rgba(255, 255, 255, 0.5)', () => {
    expect(ColorUtils.toRgba('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  test('#8b59a0 at alpha 0.75 must produce rgba(139, 89, 160, 0.75)', () => {
    // parseHex('#8b59a0'): 0x8b=139, 0x59=89, 0xa0=160
    expect(ColorUtils.toRgba('#8b59a0', 0.75)).toBe('rgba(139, 89, 160, 0.75)');
  });

  // --- boundary: alpha = 0 ---

  test('alpha 0 must produce rgba with a=0', () => {
    expect(ColorUtils.toRgba('#ff0000', 0)).toBe('rgba(255, 0, 0, 0)');
  });

  // --- boundary: alpha = 1 ---

  test('alpha 1 must produce rgba with a=1', () => {
    expect(ColorUtils.toRgba('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
  });

  // --- clamp ---

  test('alpha -1 must be clamped to 0 — must not produce negative alpha', () => {
    expect(ColorUtils.toRgba('#000000', -1)).toBe('rgba(0, 0, 0, 0)');
  });

  test('alpha 2 must be clamped to 1 — must not exceed 1', () => {
    expect(ColorUtils.toRgba('#ffffff', 2)).toBe('rgba(255, 255, 255, 1)');
  });

  test('alpha -0.5 must clamp to 0', () => {
    expect(ColorUtils.toRgba('#808080', -0.5)).toBe('rgba(128, 128, 128, 0)');
  });

  test('alpha 1.5 must clamp to 1', () => {
    expect(ColorUtils.toRgba('#808080', 1.5)).toBe('rgba(128, 128, 128, 1)');
  });

  // --- 3-digit shorthand ---

  test('3-digit #abc must expand to rgba(170, 187, 204, 1)', () => {
    // #abc → #aabbcc: 0xaa=170, 0xbb=187, 0xcc=204
    expect(ColorUtils.toRgba('#abc')).toBe('rgba(170, 187, 204, 1)');
  });

  test('3-digit #fff must expand to rgba(255, 255, 255, 1)', () => {
    expect(ColorUtils.toRgba('#fff')).toBe('rgba(255, 255, 255, 1)');
  });

  // --- output format ---

  test('output must start with "rgba(" and end with ")"', () => {
    const result = ColorUtils.toRgba('#8b59a0', 0.3);
    expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/);
  });
});

// ---------------------------------------------------------------------------
// 6. darken
// ---------------------------------------------------------------------------

describe('ColorUtils.darken', () => {
  // darken operates in HSL space: newL = max(0, L - clamp(amount, 0, 1))

  // --- idempotent: amount = 0 ---

  test('amount 0 must return the original color unchanged', () => {
    expect(ColorUtils.darken('#ff0000', 0)).toBe('#ff0000');
  });

  test('amount 0 on #8b59a0 must return #8b59a0 unchanged', () => {
    expect(ColorUtils.darken('#8b59a0', 0)).toBe('#8b59a0');
  });

  // --- floor: darkening black stays black ---

  test('darkening pure black #000000 must stay #000000', () => {
    // L=0, newL = max(0, 0 - 0.5) = 0 → still black
    expect(ColorUtils.darken('#000000', 0.5)).toBe('#000000');
  });

  test('darkening pure black #000000 by 1 must stay #000000', () => {
    expect(ColorUtils.darken('#000000', 1)).toBe('#000000');
  });

  // --- darkening white ---

  test('darkening white #ffffff by 0.5 must produce mid-grey #808080', () => {
    // L=1, newL = max(0, 1 - 0.5) = 0.5, s=0, h=0 → RGB(128,128,128) = #808080
    expect(ColorUtils.darken('#ffffff', 0.5)).toBe('#808080');
  });

  // --- known intermediate result ---

  test('darken #8b59a0 by 0.2 must produce #52355e', () => {
    // Pre-computed: L(#8b59a0)≈0.38, newL≈0.18, same h/s → #52355e
    expect(ColorUtils.darken('#8b59a0', 0.2)).toBe('#52355e');
  });

  // --- amount = 1 → black ---

  test('darken #8b59a0 by 1 must produce black #000000', () => {
    // newL = max(0, L - 1) = 0 → hslToRgb(h, s, 0) = #000000
    expect(ColorUtils.darken('#8b59a0', 1)).toBe('#000000');
  });

  // --- clamp: negative amount treated as 0 ---

  test('negative amount -0.5 must be clamped to 0 — no change', () => {
    // max(0, min(1, -0.5)) = 0 → no lightness reduction
    expect(ColorUtils.darken('#8b59a0', -0.5)).toBe('#8b59a0');
  });

  // --- clamp: amount > 1 treated as 1 ---

  test('amount 1.5 must be clamped to 1 — same as amount=1', () => {
    expect(ColorUtils.darken('#8b59a0', 1.5)).toBe('#000000');
  });

  // --- result is always valid 6-digit hex ---

  test('result must always be a valid 6-digit hex string', () => {
    const colors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#8b59a0',
      '#ffffff',
      '#000000',
    ];
    for (const color of colors) {
      expect(ColorUtils.darken(color, 0.3)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // --- 3-digit shorthand input ---

  test('3-digit shorthand #fff darkened by 0.5 must produce #808080', () => {
    expect(ColorUtils.darken('#fff', 0.5)).toBe('#808080');
  });
});

// ---------------------------------------------------------------------------
// 7. lighten
// ---------------------------------------------------------------------------

describe('ColorUtils.lighten', () => {
  // lighten operates in HSL space: newL = min(1, L + clamp(amount, 0, 1))

  // --- idempotent: amount = 0 ---

  test('amount 0 must return the original color unchanged', () => {
    expect(ColorUtils.lighten('#ff0000', 0)).toBe('#ff0000');
  });

  test('amount 0 on #8b59a0 must return #8b59a0 unchanged', () => {
    expect(ColorUtils.lighten('#8b59a0', 0)).toBe('#8b59a0');
  });

  // --- ceiling: lightening white stays white ---

  test('lightening pure white #ffffff must stay #ffffff', () => {
    // L=1, newL = min(1, 1 + 0.5) = 1 → still white
    expect(ColorUtils.lighten('#ffffff', 0.5)).toBe('#ffffff');
  });

  test('lightening white by 1 must stay #ffffff', () => {
    expect(ColorUtils.lighten('#ffffff', 1)).toBe('#ffffff');
  });

  // --- lightening black ---

  test('lightening pure black #000000 by 0.5 must produce mid-grey #808080', () => {
    // L=0, newL = min(1, 0 + 0.5) = 0.5, s=0, h=0 → RGB(128,128,128) = #808080
    expect(ColorUtils.lighten('#000000', 0.5)).toBe('#808080');
  });

  // --- known intermediate result ---

  test('lighten #8b59a0 by 0.2 must produce #b999c6', () => {
    // Pre-computed: L(#8b59a0)≈0.49, newL≈0.49+0.2=0.69 → #b999c6
    expect(ColorUtils.lighten('#8b59a0', 0.2)).toBe('#b999c6');
  });

  // --- amount = 1 → white ---

  test('lighten #8b59a0 by 1 must produce white #ffffff', () => {
    // newL = min(1, L + 1) = 1 → hslToRgb(h, s, 1) = #ffffff
    expect(ColorUtils.lighten('#8b59a0', 1)).toBe('#ffffff');
  });

  // --- clamp: negative amount treated as 0 ---

  test('negative amount -0.5 must be clamped to 0 — no change', () => {
    // max(0, min(1, -0.5)) = 0 → no lightness increase
    expect(ColorUtils.lighten('#8b59a0', -0.5)).toBe('#8b59a0');
  });

  // --- clamp: amount > 1 treated as 1 ---

  test('amount 1.5 must be clamped to 1 — same as amount=1', () => {
    expect(ColorUtils.lighten('#8b59a0', 1.5)).toBe('#ffffff');
  });

  // --- result is always valid 6-digit hex ---

  test('result must always be a valid 6-digit hex string', () => {
    const colors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#8b59a0',
      '#ffffff',
      '#000000',
    ];
    for (const color of colors) {
      expect(ColorUtils.lighten(color, 0.2)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // --- 3-digit shorthand input ---

  test('3-digit shorthand #000 lightened by 0.5 must produce #808080', () => {
    expect(ColorUtils.lighten('#000', 0.5)).toBe('#808080');
  });
});

// ---------------------------------------------------------------------------
// GAP 10 — Internal branch coverage via public API
//   rgbToHsl lines 82-83: max===gn and max===bn branches
//   hslToRgb line 91-93: achromatic branch (s===0)
// ---------------------------------------------------------------------------

describe('ColorUtils — internal branch coverage via public API', () => {
  // ── rgbToHsl max===gn branch (line 82) ──────────────────────────────────

  test('darken with a green-dominant color hits rgbToHsl max===gn branch', () => {
    // Pure green #00ff00: r=0, g=255, b=0.
    // In rgbToHsl: rn=0, gn=1, bn=0 → max=gn=1.
    // Line 82: max===gn → h = ((bn - rn) / d + 2) / 6
    const result = ColorUtils.darken('#00ff00', 0.1);
    // Result must be a darker green — valid 6-digit hex
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // Must be darker than original (lower lightness) — green channel < 255
    const [, green] = result
      .match(/^#(..)(..)(..)$/)!
      .slice(1)
      .map((h) => parseInt(h, 16));
    expect(green).toBeLessThan(255);
  });

  test('lighten with a green-dominant color also hits rgbToHsl max===gn branch', () => {
    // A dim green #007700: g is max channel.
    const result = ColorUtils.lighten('#007700', 0.1);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  // ── rgbToHsl max===bn branch (line 83) ──────────────────────────────────

  test('darken with a blue-dominant color hits rgbToHsl max===bn branch', () => {
    // Pure blue #0000ff: r=0, g=0, b=255.
    // In rgbToHsl: rn=0, gn=0, bn=1 → max=bn=1.
    // Line 83: else (max===bn) → h = ((rn - gn) / d + 4) / 6
    const result = ColorUtils.darken('#0000ff', 0.1);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // Blue channel must have decreased
    const [, , blue] = result
      .match(/^#(..)(..)(..)$/)!
      .slice(1)
      .map((h) => parseInt(h, 16));
    expect(blue).toBeLessThan(255);
  });

  test('lighten with a blue-dominant color also hits rgbToHsl max===bn branch', () => {
    // A dim blue #000077: b is max channel.
    const result = ColorUtils.lighten('#000077', 0.1);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  // ── hslToRgb achromatic branch (lines 91-93, s===0) ─────────────────────

  test('lighten of a grey color hits hslToRgb achromatic branch (s=0)', () => {
    // Pure grey #808080: r=g=b=128 → after rgbToHsl, s=0.
    // hslToRgb: s===0 → line 91-93 achromatic path: v = Math.round(l*255), return [v,v,v]
    const result = ColorUtils.lighten('#808080', 0.1);
    // Must be a lighter grey — valid hex, brighter than #808080
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // All channels must be equal (still achromatic) and > 128
    const channels = result
      .match(/^#(..)(..)(..)$/)!
      .slice(1)
      .map((h) => parseInt(h, 16));
    expect(channels[0]).toBeGreaterThan(128);
    expect(channels[0]).toBe(channels[1]);
    expect(channels[1]).toBe(channels[2]);
  });

  test('darken of a grey color hits hslToRgb achromatic branch (s=0)', () => {
    // #808080: s=0 → darken reduces l → hslToRgb achromatic branch fires again
    const result = ColorUtils.darken('#808080', 0.1);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    const channels = result
      .match(/^#(..)(..)(..)$/)!
      .slice(1)
      .map((h) => parseInt(h, 16));
    // Darker grey — all channels equal and < 128
    expect(channels[0]).toBeLessThan(128);
    expect(channels[0]).toBe(channels[1]);
    expect(channels[1]).toBe(channels[2]);
  });

  test('pure white #ffffff retains hslToRgb achromatic branch (s=0, l=1→1)', () => {
    // White: r=g=b=255 → s=0 in HSL. Lightening keeps l=1 → still white.
    const result = ColorUtils.lighten('#ffffff', 0.1);
    expect(result).toBe('#ffffff');
  });
});

// ---------------------------------------------------------------------------
// 8. mix
// ---------------------------------------------------------------------------

describe('ColorUtils.mix', () => {
  // mix does linear interpolation of RGB channels:
  // result = hex1 + (hex2 - hex1) * w, where w = clamp(weight, 0, 1)

  // --- canonical 50/50 case ---

  test('mix #000000 and #ffffff at weight 0.5 must produce mid-grey #808080', () => {
    // R: 0 + (255-0)*0.5 = 127.5 → 128 = 0x80; same for G and B
    expect(ColorUtils.mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  // --- boundary: weight = 0 returns hex1 ---

  test('weight 0 must return hex1 exactly', () => {
    expect(ColorUtils.mix('#000000', '#ffffff', 0)).toBe('#000000');
  });

  test('weight 0 preserves hex1 for arbitrary colors', () => {
    expect(ColorUtils.mix('#8b59a0', '#ffffff', 0)).toBe('#8b59a0');
  });

  // --- boundary: weight = 1 returns hex2 ---

  test('weight 1 must return hex2 exactly', () => {
    expect(ColorUtils.mix('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  test('weight 1 preserves hex2 for arbitrary colors', () => {
    expect(ColorUtils.mix('#000000', '#8b59a0', 1)).toBe('#8b59a0');
  });

  // --- clamp: weight > 1 treated as 1 ---

  test('weight 2 must be clamped to 1 — same result as weight=1', () => {
    expect(ColorUtils.mix('#000000', '#ffffff', 2)).toBe('#ffffff');
  });

  // --- clamp: weight < 0 treated as 0 ---

  test('weight -1 must be clamped to 0 — same result as weight=0', () => {
    expect(ColorUtils.mix('#000000', '#ffffff', -1)).toBe('#000000');
  });

  // --- known intermediate mixes ---

  test('mix red #ff0000 and blue #0000ff at 0.5 must produce purple #800080', () => {
    // R: 255+(0-255)*0.5=127.5→128=0x80; G: 0; B: 0+(255-0)*0.5=127.5→128=0x80
    expect(ColorUtils.mix('#ff0000', '#0000ff', 0.5)).toBe('#800080');
  });

  test('mix #8b59a0 and #ffffff at weight 0.8 must produce #e8deec', () => {
    // Pre-computed: r=139+(255-139)*0.8=231.8→232=0xe8
    //               g=89+(255-89)*0.8=221.8→222=0xde
    //               b=160+(255-160)*0.8=236→0xec
    expect(ColorUtils.mix('#8b59a0', '#ffffff', 0.8)).toBe('#e8deec');
  });

  // --- idempotent: mixing a color with itself ---

  test('mixing same color with itself at any weight must return that color', () => {
    expect(ColorUtils.mix('#808080', '#808080', 0.5)).toBe('#808080');
    expect(ColorUtils.mix('#8b59a0', '#8b59a0', 0.3)).toBe('#8b59a0');
  });

  // --- result channel values must stay in [0, 255] ---

  test('result must always be a valid 6-digit hex string', () => {
    const tests: [string, string, number][] = [
      ['#ff0000', '#0000ff', 0.3],
      ['#ffffff', '#000000', 0.7],
      ['#8b59a0', '#f0f0f0', 0.5],
    ];
    for (const [a, b, w] of tests) {
      expect(ColorUtils.mix(a, b, w)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // --- 3-digit shorthand input ---

  test('3-digit shorthand #000 and #fff at 0.5 must produce #808080', () => {
    expect(ColorUtils.mix('#000', '#fff', 0.5)).toBe('#808080');
  });
});
