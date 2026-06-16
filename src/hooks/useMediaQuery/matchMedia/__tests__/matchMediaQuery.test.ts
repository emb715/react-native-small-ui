/**
 * Adversarial tests for matchMediaQuery.
 *
 * Implementation notes confirmed before writing:
 *  - The zero guard was changed from `px === 0` to `isNaN(px)`.
 *    `(min-width: 0px)` now returns true when dims.width >= 0.
 *    `(max-width: 0px)` now returns true when dims.width <= 0.
 *  - Bare media type word (e.g. "screen" with no parens) is skipped in the
 *    parts loop; result stays true — so bare `screen` alone evaluates to true.
 *  - `not` is stripped from the segment, then the remaining AND chain is
 *    evaluated; the final boolean is negated. Applies to the full compound.
 *  - Comma = OR: first true segment short-circuits.
 *  - Unsupported features and malformed expressions → false (no throw).
 *  - Empty string query → false (guarded at entry).
 *  - New in v2: aspect-ratio, device-aspect-ratio, resolution (dppx/dpi/dpcm),
 *    color, prefers-color-scheme, hover, pointer, and named always-false features.
 */

import { matchMediaQuery } from '../matchMediaQuery';
import type { MediaQueryDimensions } from '../matchMediaQuery';

// ---------------------------------------------------------------------------
// Shared dimension fixtures
// ---------------------------------------------------------------------------

const BASE: MediaQueryDimensions = {
  'width': 800,
  'height': 600,
  'device-width': 1024,
  'device-height': 768,
  'orientation': 'landscape',
  'device-pixel-ratio': 2,
  'color-scheme': 'light',
};

function dims(
  overrides: Partial<MediaQueryDimensions> = {}
): MediaQueryDimensions {
  return { ...BASE, ...overrides };
}

// ---------------------------------------------------------------------------
// min-width
// ---------------------------------------------------------------------------

describe('matchMediaQuery — min-width', () => {
  test('exact boundary: width === threshold → true (≥ is inclusive)', () => {
    expect(matchMediaQuery('(min-width: 800px)', dims({ width: 800 }))).toBe(
      true
    );
  });

  test('just below boundary: width < threshold → false', () => {
    expect(matchMediaQuery('(min-width: 800px)', dims({ width: 799 }))).toBe(
      false
    );
  });

  test('well above boundary → true', () => {
    expect(matchMediaQuery('(min-width: 800px)', dims({ width: 1200 }))).toBe(
      true
    );
  });

  test('threshold 0px, dims.width > 0 → true (0 is valid threshold, 500 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0px)', dims({ width: 500 }))).toBe(
      true
    );
  });

  test('threshold 0px, dims.width = 0 → true (0 >= 0 is true)', () => {
    expect(matchMediaQuery('(min-width: 0px)', dims({ width: 0 }))).toBe(true);
  });

  test('non-zero threshold, dims.width is 0 → false (normal range check: 0 >= 1 = false)', () => {
    expect(matchMediaQuery('(min-width: 1px)', dims({ width: 0 }))).toBe(false);
  });

  test('threshold 1px, dims.width exactly 1 → true', () => {
    expect(matchMediaQuery('(min-width: 1px)', dims({ width: 1 }))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// max-width
// ---------------------------------------------------------------------------

describe('matchMediaQuery — max-width', () => {
  test('exact boundary: width === threshold → true (≤ is inclusive)', () => {
    expect(matchMediaQuery('(max-width: 800px)', dims({ width: 800 }))).toBe(
      true
    );
  });

  test('just above boundary: width > threshold → false', () => {
    expect(matchMediaQuery('(max-width: 800px)', dims({ width: 801 }))).toBe(
      false
    );
  });

  test('well below boundary → true', () => {
    expect(matchMediaQuery('(max-width: 800px)', dims({ width: 320 }))).toBe(
      true
    );
  });

  test('threshold 0px, dims.width = 0 → true (0 <= 0 is true)', () => {
    expect(matchMediaQuery('(max-width: 0px)', dims({ width: 0 }))).toBe(true);
  });

  test('threshold 0px, dims.width > 0 → false (1 <= 0 = false)', () => {
    expect(matchMediaQuery('(max-width: 0px)', dims({ width: 1 }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// min-height / max-height
// ---------------------------------------------------------------------------

describe('matchMediaQuery — min-height', () => {
  test('exact boundary → true', () => {
    expect(matchMediaQuery('(min-height: 600px)', dims({ height: 600 }))).toBe(
      true
    );
  });

  test('just below boundary → false', () => {
    expect(matchMediaQuery('(min-height: 600px)', dims({ height: 599 }))).toBe(
      false
    );
  });

  test('threshold 0px, dims.height > 0 → true (400 >= 0)', () => {
    expect(matchMediaQuery('(min-height: 0px)', dims({ height: 400 }))).toBe(
      true
    );
  });
});

describe('matchMediaQuery — max-height', () => {
  test('exact boundary → true', () => {
    expect(matchMediaQuery('(max-height: 600px)', dims({ height: 600 }))).toBe(
      true
    );
  });

  test('just above boundary → false', () => {
    expect(matchMediaQuery('(max-height: 600px)', dims({ height: 601 }))).toBe(
      false
    );
  });

  test('threshold 0px, dims.height = 0 → true (0 <= 0)', () => {
    expect(matchMediaQuery('(max-height: 0px)', dims({ height: 0 }))).toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// device-width / device-height
// ---------------------------------------------------------------------------

describe('matchMediaQuery — min/max-device-width', () => {
  test('min-device-width: exact boundary → true', () => {
    expect(
      matchMediaQuery(
        '(min-device-width: 1024px)',
        dims({ 'device-width': 1024 })
      )
    ).toBe(true);
  });

  test('min-device-width: just below → false', () => {
    expect(
      matchMediaQuery(
        '(min-device-width: 1024px)',
        dims({ 'device-width': 1023 })
      )
    ).toBe(false);
  });

  test('max-device-width: exact boundary → true', () => {
    expect(
      matchMediaQuery(
        '(max-device-width: 1024px)',
        dims({ 'device-width': 1024 })
      )
    ).toBe(true);
  });

  test('max-device-width: just above → false', () => {
    expect(
      matchMediaQuery(
        '(max-device-width: 1024px)',
        dims({ 'device-width': 1025 })
      )
    ).toBe(false);
  });

  test('threshold 0px on device-width: large device-width → true (1024 >= 0)', () => {
    expect(
      matchMediaQuery('(min-device-width: 0px)', dims({ 'device-width': 1024 }))
    ).toBe(true);
  });
});

describe('matchMediaQuery — min/max-device-height', () => {
  test('min-device-height: exact boundary → true', () => {
    expect(
      matchMediaQuery(
        '(min-device-height: 768px)',
        dims({ 'device-height': 768 })
      )
    ).toBe(true);
  });

  test('min-device-height: just below → false', () => {
    expect(
      matchMediaQuery(
        '(min-device-height: 768px)',
        dims({ 'device-height': 767 })
      )
    ).toBe(false);
  });

  test('max-device-height: exact boundary → true', () => {
    expect(
      matchMediaQuery(
        '(max-device-height: 768px)',
        dims({ 'device-height': 768 })
      )
    ).toBe(true);
  });

  test('max-device-height: just above → false', () => {
    expect(
      matchMediaQuery(
        '(max-device-height: 768px)',
        dims({ 'device-height': 769 })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit conversion: rem and em → px (REM_PX = 16)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — unit conversion', () => {
  test('48rem converts to exactly 768px — exact boundary match', () => {
    expect(matchMediaQuery('(min-width: 48rem)', dims({ width: 768 }))).toBe(
      true
    );
  });

  test('48rem: one pixel below 768 → false', () => {
    expect(matchMediaQuery('(min-width: 48rem)', dims({ width: 767 }))).toBe(
      false
    );
  });

  test('48em converts to exactly 768px — same as rem', () => {
    expect(matchMediaQuery('(min-width: 48em)', dims({ width: 768 }))).toBe(
      true
    );
  });

  test('48em: one pixel below 768 → false', () => {
    expect(matchMediaQuery('(min-width: 48em)', dims({ width: 767 }))).toBe(
      false
    );
  });

  test('0rem converts to 0px: threshold=0, dims.width=1000 → true (1000 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0rem)', dims({ width: 1000 }))).toBe(
      true
    );
  });

  test('0em converts to 0px: threshold=0, dims.width=1000 → true (1000 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0em)', dims({ width: 1000 }))).toBe(
      true
    );
  });

  test('1rem = 16px: exact boundary → true', () => {
    expect(matchMediaQuery('(min-width: 1rem)', dims({ width: 16 }))).toBe(
      true
    );
  });

  test('1rem = 16px: one below (15px) → false', () => {
    expect(matchMediaQuery('(min-width: 1rem)', dims({ width: 15 }))).toBe(
      false
    );
  });

  test('px unit works without rem/em suffix', () => {
    expect(matchMediaQuery('(min-width: 320px)', dims({ width: 320 }))).toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// Orientation
// ---------------------------------------------------------------------------

describe('matchMediaQuery — orientation', () => {
  test('landscape query matches landscape dims', () => {
    expect(
      matchMediaQuery(
        '(orientation: landscape)',
        dims({ orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('portrait query matches portrait dims', () => {
    expect(
      matchMediaQuery(
        '(orientation: portrait)',
        dims({ orientation: 'portrait' })
      )
    ).toBe(true);
  });

  test('landscape query does NOT match portrait dims', () => {
    expect(
      matchMediaQuery(
        '(orientation: landscape)',
        dims({ orientation: 'portrait' })
      )
    ).toBe(false);
  });

  test('portrait query does NOT match landscape dims', () => {
    expect(
      matchMediaQuery(
        '(orientation: portrait)',
        dims({ orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('case-insensitive: "Landscape" in query matches "landscape" in dims', () => {
    // rawValue.toLowerCase() === dims.orientation
    expect(
      matchMediaQuery(
        '(orientation: Landscape)',
        dims({ orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('case-insensitive: "PORTRAIT" in query matches "portrait" in dims', () => {
    expect(
      matchMediaQuery(
        '(orientation: PORTRAIT)',
        dims({ orientation: 'portrait' })
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Logic: comma = OR
// ---------------------------------------------------------------------------

describe('matchMediaQuery — comma OR logic', () => {
  test('first segment matches, second does not → true', () => {
    // 800 >= 768 = true, 800 >= 1200 = false → OR → true
    expect(
      matchMediaQuery(
        '(min-width: 768px), (min-width: 1200px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });

  test('first segment does not match, second does → true', () => {
    // 800 >= 1200 = false, 800 >= 600 = true → OR → true
    expect(
      matchMediaQuery(
        '(min-width: 1200px), (min-width: 600px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });

  test('neither segment matches → false', () => {
    // 400 >= 768 = false, 400 >= 1200 = false → OR → false
    expect(
      matchMediaQuery(
        '(min-width: 768px), (min-width: 1200px)',
        dims({ width: 400 })
      )
    ).toBe(false);
  });

  test('both segments match → true', () => {
    expect(
      matchMediaQuery(
        '(min-width: 400px), (min-width: 600px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Logic: and
// ---------------------------------------------------------------------------

describe('matchMediaQuery — and logic', () => {
  test('both expressions in and chain match → true', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px) and (orientation: landscape)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('first expression fails in and chain → false', () => {
    expect(
      matchMediaQuery(
        '(min-width: 900px) and (orientation: landscape)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('second expression fails in and chain → false', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px) and (orientation: portrait)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('three-way and chain: all match → true', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px) and (max-width: 1200px) and (orientation: landscape)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('three-way and chain: middle fails → false', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px) and (max-width: 700px) and (orientation: landscape)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Logic: not
// ---------------------------------------------------------------------------

describe('matchMediaQuery — not modifier', () => {
  test('not: negates a true expression → false', () => {
    // (min-width: 600px) with width=800 → true → not → false
    expect(
      matchMediaQuery('not (min-width: 600px)', dims({ width: 800 }))
    ).toBe(false);
  });

  test('not: negates a false expression → true', () => {
    // (min-width: 900px) with width=800 → false → not → true
    expect(
      matchMediaQuery('not (min-width: 900px)', dims({ width: 800 }))
    ).toBe(true);
  });

  test('not + and: not applies to the FULL compound expression', () => {
    // Compound: (min-width: 600px) AND (orientation: landscape) with width=800, landscape
    // Compound result = true → not → false
    expect(
      matchMediaQuery(
        'not (min-width: 600px) and (orientation: landscape)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('not + and: compound is false, not makes it true', () => {
    // (min-width: 600px)=true AND (orientation: portrait)=false → compound=false → not → true
    expect(
      matchMediaQuery(
        'not (min-width: 600px) and (orientation: portrait)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('not + and: both conditions false → compound=false → not → true', () => {
    expect(
      matchMediaQuery(
        'not (min-width: 900px) and (orientation: portrait)',
        dims({ width: 800, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('not in OR query: only first segment is negated, second evaluates normally', () => {
    // Segment 1: not (min-width: 900px) with width=800 → not false → true → OR short-circuits
    expect(
      matchMediaQuery(
        'not (min-width: 900px), (min-width: 9999px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bare media type prefix (screen, all, print)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — bare media type prefix', () => {
  test('bare "screen" alone (no parens, no features) → true', () => {
    // Implementation: splits on " and ", finds no part starting with "(",
    // loop never sets result=false, returns negate ? false : true → true.
    // This is the actual implementation behavior.
    expect(matchMediaQuery('screen', dims())).toBe(true);
  });

  test('bare "all" alone → true', () => {
    expect(matchMediaQuery('all', dims())).toBe(true);
  });

  test('"screen and (min-width: 600px)" — media type prefix + feature: feature drives result', () => {
    // "screen" part is skipped (no parens), (min-width: 600px) with width=800 → true
    expect(
      matchMediaQuery('screen and (min-width: 600px)', dims({ width: 800 }))
    ).toBe(true);
  });

  test('"screen and (min-width: 900px)" with width=800 → false', () => {
    expect(
      matchMediaQuery('screen and (min-width: 900px)', dims({ width: 800 }))
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fail-safe: unsupported features and malformed input
// ---------------------------------------------------------------------------

describe('matchMediaQuery — fail-safe (no throw, returns false)', () => {
  test('unsupported feature "color-gamut: p3" → false, no throw', () => {
    expect(() => matchMediaQuery('(color-gamut: p3)', dims())).not.toThrow();
    expect(matchMediaQuery('(color-gamut: p3)', dims())).toBe(false);
  });

  test('malformed: "(min-width)" — no colon → false, no throw', () => {
    expect(() => matchMediaQuery('(min-width)', dims())).not.toThrow();
    expect(matchMediaQuery('(min-width)', dims())).toBe(false);
  });

  test('empty string → false, no throw', () => {
    expect(() => matchMediaQuery('', dims())).not.toThrow();
    expect(matchMediaQuery('', dims())).toBe(false);
  });

  test('prefers-color-scheme is now supported — dark query with light scheme → false, no throw', () => {
    expect(() =>
      matchMediaQuery(
        '(prefers-color-scheme: dark)',
        dims({ 'color-scheme': 'light' })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: dark)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(false);
  });

  test('resolution is now supported — (resolution: 2dppx) with dpr=2 → true, no throw', () => {
    expect(() =>
      matchMediaQuery('(resolution: 2dppx)', dims({ 'device-pixel-ratio': 2 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(resolution: 2dppx)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });

  test('whitespace-only query → false, no throw', () => {
    expect(() => matchMediaQuery('   ', dims())).not.toThrow();
    expect(matchMediaQuery('   ', dims())).toBe(false);
  });

  test('unsupported feature in AND chain: still evaluates correctly', () => {
    // (color-gamut: p3) → false → AND short-circuits → overall false
    expect(
      matchMediaQuery(
        '(min-width: 600px) and (color-gamut: p3)',
        dims({ width: 800 })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Zero-threshold correctness (isNaN guard — Bug 1 fix)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — zero threshold correctness (isNaN guard)', () => {
  test('(min-width: 0px) with width=1 → true (1 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0px)', dims({ width: 1 }))).toBe(true);
  });

  test('(min-width: 0px) with width=0 → true (0 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0px)', dims({ width: 0 }))).toBe(true);
  });

  test('(max-width: 0px) with width=0 → true (0 <= 0)', () => {
    expect(matchMediaQuery('(max-width: 0px)', dims({ width: 0 }))).toBe(true);
  });

  test('(min-width: 0px) with large width → true (9999 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0px)', dims({ width: 9999 }))).toBe(
      true
    );
  });

  test('(min-width: 1px) with width=1 → true (threshold non-zero, passes range check)', () => {
    expect(matchMediaQuery('(min-width: 1px)', dims({ width: 1 }))).toBe(true);
  });

  test('(min-width: 1px) with width=0 → false (not NaN guard — just 0 >= 1 = false)', () => {
    expect(matchMediaQuery('(min-width: 1px)', dims({ width: 0 }))).toBe(false);
  });

  test('(max-width: 0px) with width=1 → false (1 <= 0 = false)', () => {
    expect(matchMediaQuery('(max-width: 0px)', dims({ width: 1 }))).toBe(false);
  });

  test('(min-height: 0px) with height > 0 → true', () => {
    expect(matchMediaQuery('(min-height: 0px)', dims({ height: 400 }))).toBe(
      true
    );
  });

  test('(max-height: 0px) with height=0 → true (0 <= 0)', () => {
    expect(matchMediaQuery('(max-height: 0px)', dims({ height: 0 }))).toBe(
      true
    );
  });

  test('(min-device-width: 0px) with large device-width → true', () => {
    expect(
      matchMediaQuery('(min-device-width: 0px)', dims({ 'device-width': 1024 }))
    ).toBe(true);
  });

  test('0rem threshold (= 0px): dims.width=1000 → true (1000 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0rem)', dims({ width: 1000 }))).toBe(
      true
    );
  });

  test('0em threshold (= 0px): dims.width=1000 → true (1000 >= 0)', () => {
    expect(matchMediaQuery('(min-width: 0em)', dims({ width: 1000 }))).toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// Edge: combined OR + not
// ---------------------------------------------------------------------------

describe('matchMediaQuery — combined adversarial patterns', () => {
  test('OR: first segment is "not" true → true, skips second segment entirely', () => {
    // First: not (min-width: 900px) with width=800 → not false → true → OR done
    // Second: (min-width: 9999px) would be false but is never evaluated
    const result = matchMediaQuery(
      'not (min-width: 900px), (min-width: 9999px)',
      dims({ width: 800 })
    );
    expect(result).toBe(true);
  });

  test('AND with rem unit and orientation: all must pass', () => {
    // 48rem = 768px; width=768 satisfies min-width; dims is landscape
    expect(
      matchMediaQuery(
        '(min-width: 48rem) and (orientation: landscape)',
        dims({ width: 768, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('AND with rem unit and orientation: width below rem threshold → false', () => {
    expect(
      matchMediaQuery(
        '(min-width: 48rem) and (orientation: landscape)',
        dims({ width: 767, orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('feature with extra whitespace in query string is handled', () => {
    // Whitespace around colon / value — toPx trims, feature trims
    expect(
      matchMediaQuery('(  min-width  :  800px  )', dims({ width: 800 }))
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Media type identity (bare words) and not-screen
// ---------------------------------------------------------------------------

describe('matchMediaQuery — media type identity (bare words)', () => {
  test('"all" alone → true (bare word, no parens, loop skips it, result stays true)', () => {
    expect(matchMediaQuery('all', dims())).toBe(true);
  });

  test('"screen" alone → true (bare word skipped, result stays true)', () => {
    expect(matchMediaQuery('screen', dims())).toBe(true);
  });

  test('"print" alone → true (known limitation: media types not filtered, bare word skipped)', () => {
    expect(matchMediaQuery('print', dims())).toBe(true);
  });

  test('"speech" alone → true (known limitation: media types not filtered, bare word skipped)', () => {
    expect(matchMediaQuery('speech', dims())).toBe(true);
  });

  test('"not screen" → false (negate=true, bare "screen" skipped → result=true → !true = false)', () => {
    expect(matchMediaQuery('not screen', dims())).toBe(false);
  });

  test('"not screen and (min-width: 600px)" with width=800 → false (negate=true, feature passes → result=true → !true = false)', () => {
    expect(
      matchMediaQuery('not screen and (min-width: 600px)', {
        ...dims(),
        width: 800,
      })
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toPx unknown unit stripping
// ---------------------------------------------------------------------------

describe('matchMediaQuery — toPx unknown unit stripping', () => {
  test('"(min-width: 600vw)" with width=800 → true (parseFloat strips "vw", treats as 600px; 800 >= 600)', () => {
    // JS parseFloat('600vw') = 600 — the unknown unit is stripped, value is used as-is.
    // This is a known limitation: unsupported CSS units are silently coerced.
    expect(matchMediaQuery('(min-width: 600vw)', dims({ width: 800 }))).toBe(
      true
    );
  });

  test('"(min-width: 900vw)" with width=800 → false (parseFloat("900vw")=900; 800 >= 900 = false)', () => {
    expect(matchMediaQuery('(min-width: 900vw)', dims({ width: 800 }))).toBe(
      false
    );
  });
});

// ---------------------------------------------------------------------------
// Exact width/height/device-width/device-height
// ---------------------------------------------------------------------------

describe('matchMediaQuery — exact width/height', () => {
  test('(width: 800px) with width=800 → true', () => {
    expect(matchMediaQuery('(width: 800px)', dims({ width: 800 }))).toBe(true);
  });
  test('(width: 800px) with width=801 → false', () => {
    expect(matchMediaQuery('(width: 800px)', dims({ width: 801 }))).toBe(false);
  });
  test('(height: 600px) with height=600 → true', () => {
    expect(matchMediaQuery('(height: 600px)', dims({ height: 600 }))).toBe(
      true
    );
  });
  test('(device-width: 1024px) with device-width=1024 → true', () => {
    expect(matchMediaQuery('(device-width: 1024px)', dims())).toBe(true);
  });
  test('(device-height: 768px) with device-height=768 → true', () => {
    expect(matchMediaQuery('(device-height: 768px)', dims())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Aspect ratio
// ---------------------------------------------------------------------------

describe('matchMediaQuery — aspect-ratio', () => {
  test('(aspect-ratio: 4/3) with 800x600 → true (800/600 = 1.333 = 4/3)', () => {
    expect(
      matchMediaQuery('(aspect-ratio: 4/3)', dims({ width: 800, height: 600 }))
    ).toBe(true);
  });
  test('(aspect-ratio: 16/9) with 800x600 → false', () => {
    expect(
      matchMediaQuery('(aspect-ratio: 16/9)', dims({ width: 800, height: 600 }))
    ).toBe(false);
  });
  test('(min-aspect-ratio: 1/1) with 800x600 → true (800/600 > 1)', () => {
    expect(
      matchMediaQuery(
        '(min-aspect-ratio: 1/1)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });
  test('(min-aspect-ratio: 2/1) with 800x600 → false (800/600 < 2)', () => {
    expect(
      matchMediaQuery(
        '(min-aspect-ratio: 2/1)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(false);
  });
  test('(max-aspect-ratio: 2/1) with 800x600 → true (800/600 < 2)', () => {
    expect(
      matchMediaQuery(
        '(max-aspect-ratio: 2/1)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });
  test('(max-aspect-ratio: 1/1) with 800x600 → false (800/600 > 1)', () => {
    expect(
      matchMediaQuery(
        '(max-aspect-ratio: 1/1)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(false);
  });
  test('device-aspect-ratio: 4/3 with device 1024x768 → true', () => {
    expect(matchMediaQuery('(device-aspect-ratio: 4/3)', dims())).toBe(true);
  });
  test('height=0: aspect-ratio → false (division by zero guard)', () => {
    expect(matchMediaQuery('(aspect-ratio: 1/1)', dims({ height: 0 }))).toBe(
      false
    );
  });
  test('malformed ratio value → false', () => {
    expect(matchMediaQuery('(aspect-ratio: bad)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

describe('matchMediaQuery — resolution', () => {
  test('(resolution: 2dppx) with device-pixel-ratio=2 → true', () => {
    expect(
      matchMediaQuery('(resolution: 2dppx)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });
  test('(resolution: 2dppx) with device-pixel-ratio=3 → false', () => {
    expect(
      matchMediaQuery('(resolution: 2dppx)', dims({ 'device-pixel-ratio': 3 }))
    ).toBe(false);
  });
  test('(min-resolution: 2dppx) with device-pixel-ratio=2 → true', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 2dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });
  test('(min-resolution: 2dppx) with device-pixel-ratio=1 → false', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 2dppx)',
        dims({ 'device-pixel-ratio': 1 })
      )
    ).toBe(false);
  });
  test('(max-resolution: 3dppx) with device-pixel-ratio=2 → true', () => {
    expect(
      matchMediaQuery(
        '(max-resolution: 3dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });
  test('(resolution: 192dpi) with device-pixel-ratio=2 → true (192/96 = 2dppx)', () => {
    expect(
      matchMediaQuery('(resolution: 192dpi)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });
  test('(min-resolution: 1dppx) with device-pixel-ratio=2 → true', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 1dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });
  test('(resolution: 2x) with device-pixel-ratio=2 → true (x suffix = dppx)', () => {
    expect(
      matchMediaQuery('(resolution: 2x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });
  test('unknown resolution unit → false, no throw', () => {
    expect(() =>
      matchMediaQuery('(resolution: 2something)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(resolution: 2something)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('matchMediaQuery — color', () => {
  test('bare (color) — boolean form → true (all RN screens are color)', () => {
    expect(matchMediaQuery('(color)', dims())).toBe(true);
  });
  test('(color: 8) → true (8bpc is standard mobile screen depth)', () => {
    expect(matchMediaQuery('(color: 8)', dims())).toBe(true);
  });
  test('(color: 24) → false (we report 8bpc max)', () => {
    expect(matchMediaQuery('(color: 24)', dims())).toBe(false);
  });
  test('(min-color: 1) → true (8 >= 1)', () => {
    expect(matchMediaQuery('(min-color: 1)', dims())).toBe(true);
  });
  test('(min-color: 8) → true (8 >= 8)', () => {
    expect(matchMediaQuery('(min-color: 8)', dims())).toBe(true);
  });
  test('(min-color: 9) → false (8 < 9)', () => {
    expect(matchMediaQuery('(min-color: 9)', dims())).toBe(false);
  });
  test('(max-color: 8) → true (8 <= 8)', () => {
    expect(matchMediaQuery('(max-color: 8)', dims())).toBe(true);
  });
  test('(max-color: 7) → false (8 > 7)', () => {
    expect(matchMediaQuery('(max-color: 7)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prefers-color-scheme
// ---------------------------------------------------------------------------

describe('matchMediaQuery — prefers-color-scheme', () => {
  test('(prefers-color-scheme: light) with color-scheme=light → true', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: light)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(true);
  });
  test('(prefers-color-scheme: dark) with color-scheme=dark → true', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: dark)',
        dims({ 'color-scheme': 'dark' })
      )
    ).toBe(true);
  });
  test('(prefers-color-scheme: dark) with color-scheme=light → false', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: dark)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(false);
  });
  test('(prefers-color-scheme: light) with color-scheme=dark → false', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: light)',
        dims({ 'color-scheme': 'dark' })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hover / pointer
// ---------------------------------------------------------------------------

describe('matchMediaQuery — hover and pointer', () => {
  test('(hover: none) → true (touch devices have no hover)', () => {
    expect(matchMediaQuery('(hover: none)', dims())).toBe(true);
  });
  test('(hover: hover) → false (touch devices cannot hover)', () => {
    expect(matchMediaQuery('(hover: hover)', dims())).toBe(false);
  });
  test('(any-hover: none) → true', () => {
    expect(matchMediaQuery('(any-hover: none)', dims())).toBe(true);
  });
  test('(any-hover: hover) → false', () => {
    expect(matchMediaQuery('(any-hover: hover)', dims())).toBe(false);
  });
  test('(pointer: coarse) → true (touch is coarse)', () => {
    expect(matchMediaQuery('(pointer: coarse)', dims())).toBe(true);
  });
  test('(pointer: fine) → false', () => {
    expect(matchMediaQuery('(pointer: fine)', dims())).toBe(false);
  });
  test('(pointer: none) → false', () => {
    expect(matchMediaQuery('(pointer: none)', dims())).toBe(false);
  });
  test('(any-pointer: coarse) → true', () => {
    expect(matchMediaQuery('(any-pointer: coarse)', dims())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Always-false features on native
// ---------------------------------------------------------------------------

describe('matchMediaQuery — always false on native', () => {
  const alwaysFalse = [
    '(prefers-reduced-motion: reduce)',
    '(prefers-contrast: more)',
    '(prefers-reduced-transparency: reduce)',
    '(forced-colors: active)',
    '(inverted-colors: inverted)',
    '(color-index: 256)',
    '(min-color-index: 1)',
    '(max-color-index: 256)',
    '(monochrome: 0)',
    '(min-monochrome: 0)',
    '(max-monochrome: 1)',
    '(scan: progressive)',
    '(grid: 0)',
    '(update: fast)',
    '(overflow-block: scroll)',
    '(overflow-inline: scroll)',
    '(color-gamut: p3)',
    '(dynamic-range: high)',
    '(video-dynamic-range: high)',
    '(display-mode: standalone)',
    '(scripting: enabled)',
  ];

  test.each(alwaysFalse)('%s → false, no throw', (query) => {
    expect(() => matchMediaQuery(query, dims())).not.toThrow();
    expect(matchMediaQuery(query, dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 1: toDppx — unit coverage gaps
// ---------------------------------------------------------------------------

describe('matchMediaQuery — toDppx dpcm unit', () => {
  // 96dpcm = 96 / (96/2.54) = 2.54dppx exactly
  test('(resolution: 96dpcm) with device-pixel-ratio=2.54 → true (96dpcm = 2.54dppx, exact match)', () => {
    const dpr = 96 / (96 / 2.54); // = 2.54
    expect(
      matchMediaQuery(
        '(resolution: 96dpcm)',
        dims({ 'device-pixel-ratio': dpr })
      )
    ).toBe(true);
  });

  test('(resolution: 96dpcm) with device-pixel-ratio=2 → false (2.54dppx ≠ 2dppx)', () => {
    expect(() =>
      matchMediaQuery('(resolution: 96dpcm)', dims({ 'device-pixel-ratio': 2 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(resolution: 96dpcm)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(false);
  });

  test('(min-resolution: 2x) with device-pixel-ratio=2 → true (x suffix treated as dppx, 2 >= 2)', () => {
    expect(
      matchMediaQuery('(min-resolution: 2x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });

  test('(min-resolution: 3x) with device-pixel-ratio=2 → false (x suffix = dppx, 2 >= 3 = false)', () => {
    expect(() =>
      matchMediaQuery('(min-resolution: 3x)', dims({ 'device-pixel-ratio': 2 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(min-resolution: 3x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(false);
  });

  test('(max-resolution: 2x) with device-pixel-ratio=2 → true (x suffix = dppx, 2 <= 2)', () => {
    expect(
      matchMediaQuery('(max-resolution: 2x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });

  test('(max-resolution: 1x) with device-pixel-ratio=2 → false (x suffix = dppx, 2 <= 1 = false)', () => {
    expect(() =>
      matchMediaQuery('(max-resolution: 1x)', dims({ 'device-pixel-ratio': 2 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(max-resolution: 1x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(false);
  });

  test('(min-resolution: 2unknown) with any dpr → false (unknown unit → NaN guard → false, no throw)', () => {
    expect(() =>
      matchMediaQuery('(min-resolution: 2unknown)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(min-resolution: 2unknown)', dims())).toBe(false);
  });

  test('(max-resolution: 99bananas) with any dpr → false (unknown unit → NaN guard → false, no throw)', () => {
    expect(() =>
      matchMediaQuery('(max-resolution: 99bananas)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(max-resolution: 99bananas)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 2: toRatio — edge cases
// ---------------------------------------------------------------------------

describe('matchMediaQuery — toRatio edge cases', () => {
  // toRatio('1.3333') should parse as single float 1.3333
  // width/height that produces 1.3333: e.g. 13333/10000 but easier: 4/3 = 1.3333...
  // Use an explicit irrational: 800/600 = 1.3333... but that doesn't equal 1.3333 exactly.
  // Use exact: 13333/10000 = 1.3333. Or just 4000/3000 and query "1.3333"
  // 4000/3000 = 1.3333... which will not === 1.3333 exactly.
  // Let's pick a cleaner case: 3/2 = 1.5, query "(aspect-ratio: 1.5)" with 1500x1000
  test('(aspect-ratio: 1.5) with dims 1500x1000 → true (single float form, 1500/1000 = 1.5 exactly)', () => {
    expect(
      matchMediaQuery(
        '(aspect-ratio: 1.5)',
        dims({ width: 1500, height: 1000 })
      )
    ).toBe(true);
  });

  test('(aspect-ratio: 1.5) with dims 1600x1000 → false (1.6 ≠ 1.5)', () => {
    expect(() =>
      matchMediaQuery(
        '(aspect-ratio: 1.5)',
        dims({ width: 1600, height: 1000 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(aspect-ratio: 1.5)',
        dims({ width: 1600, height: 1000 })
      )
    ).toBe(false);
  });

  test('(aspect-ratio: 4/0) → false (zero denominator in toRatio returns NaN, NaN guard fires)', () => {
    expect(() => matchMediaQuery('(aspect-ratio: 4/0)', dims())).not.toThrow();
    expect(matchMediaQuery('(aspect-ratio: 4/0)', dims())).toBe(false);
  });

  test('(aspect-ratio: -1/1) → false (negative ratio cannot match a positive dimension ratio)', () => {
    expect(() =>
      matchMediaQuery('(aspect-ratio: -1/1)', dims({ width: 800, height: 600 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(aspect-ratio: -1/1)', dims({ width: 800, height: 600 }))
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 3: Boolean feature form (no colon)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — boolean feature form (no colon)', () => {
  test('(grid) boolean form → false (grid=0 means grid device; native is not a grid device)', () => {
    expect(() => matchMediaQuery('(grid)', dims())).not.toThrow();
    expect(matchMediaQuery('(grid)', dims())).toBe(false);
  });

  test('(monochrome) boolean form → false (native screens are not monochrome)', () => {
    expect(() => matchMediaQuery('(monochrome)', dims())).not.toThrow();
    expect(matchMediaQuery('(monochrome)', dims())).toBe(false);
  });

  test('(unknown-feature) bare unknown feature → false, no throw', () => {
    expect(() => matchMediaQuery('(unknown-feature)', dims())).not.toThrow();
    expect(matchMediaQuery('(unknown-feature)', dims())).toBe(false);
  });

  test('(totally-made-up) another unknown bare feature → false, no throw', () => {
    expect(() => matchMediaQuery('(totally-made-up)', dims())).not.toThrow();
    expect(matchMediaQuery('(totally-made-up)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 4: Aspect ratio — floating point precision
// ---------------------------------------------------------------------------

describe('matchMediaQuery — aspect-ratio floating point precision', () => {
  // 1920/1080 = 16/9 exactly in integer division: 1920/1080 = 1.77777... = 16/9
  test('(aspect-ratio: 16/9) with dims 1920x1080 → true (1920/1080 === 16/9 exactly in JS float)', () => {
    // Verify: 1920/1080 === 16/9 in JS
    expect(1920 / 1080 === 16 / 9).toBe(true);
    expect(
      matchMediaQuery(
        '(aspect-ratio: 16/9)',
        dims({ width: 1920, height: 1080 })
      )
    ).toBe(true);
  });

  test('(aspect-ratio: 16/9) with dims 1921x1080 → false (slightly above 16/9)', () => {
    expect(() =>
      matchMediaQuery(
        '(aspect-ratio: 16/9)',
        dims({ width: 1921, height: 1080 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(aspect-ratio: 16/9)',
        dims({ width: 1921, height: 1080 })
      )
    ).toBe(false);
  });

  test('(min-aspect-ratio: 16/9) with dims 1920x1080 → true (exact boundary, 16/9 >= 16/9)', () => {
    expect(
      matchMediaQuery(
        '(min-aspect-ratio: 16/9)',
        dims({ width: 1920, height: 1080 })
      )
    ).toBe(true);
  });

  test('(max-aspect-ratio: 16/9) with dims 1920x1080 → true (exact boundary, 16/9 <= 16/9)', () => {
    expect(
      matchMediaQuery(
        '(max-aspect-ratio: 16/9)',
        dims({ width: 1920, height: 1080 })
      )
    ).toBe(true);
  });

  test('(min-aspect-ratio: 16/9) with dims 1280x1080 → false (1280/1080 ≈ 1.185 < 16/9 ≈ 1.778)', () => {
    expect(() =>
      matchMediaQuery(
        '(min-aspect-ratio: 16/9)',
        dims({ width: 1280, height: 1080 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(min-aspect-ratio: 16/9)',
        dims({ width: 1280, height: 1080 })
      )
    ).toBe(false);
  });

  test('(max-aspect-ratio: 16/9) with dims 2560x1080 → false (2560/1080 ≈ 2.37 > 16/9 ≈ 1.778)', () => {
    expect(() =>
      matchMediaQuery(
        '(max-aspect-ratio: 16/9)',
        dims({ width: 2560, height: 1080 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(max-aspect-ratio: 16/9)',
        dims({ width: 2560, height: 1080 })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 5: `not` combined with new features
// ---------------------------------------------------------------------------

describe('matchMediaQuery — not combined with new features', () => {
  test('not (prefers-color-scheme: dark) with color-scheme=light → true (dark=false, negated → true)', () => {
    expect(
      matchMediaQuery(
        'not (prefers-color-scheme: dark)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(true);
  });

  test('not (prefers-color-scheme: light) with color-scheme=light → false (light=true, negated → false)', () => {
    expect(() =>
      matchMediaQuery(
        'not (prefers-color-scheme: light)',
        dims({ 'color-scheme': 'light' })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        'not (prefers-color-scheme: light)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(false);
  });

  test('not (min-resolution: 1dppx) with device-pixel-ratio=2 → false (2>=1=true, negated → false)', () => {
    expect(() =>
      matchMediaQuery(
        'not (min-resolution: 1dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        'not (min-resolution: 1dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(false);
  });

  test('not (resolution: 3dppx) with device-pixel-ratio=2 → true (2===3=false, negated → true)', () => {
    expect(
      matchMediaQuery(
        'not (resolution: 3dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });

  test('not (orientation: landscape) with landscape dims → false (true negated → false)', () => {
    expect(() =>
      matchMediaQuery(
        'not (orientation: landscape)',
        dims({ orientation: 'landscape' })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        'not (orientation: landscape)',
        dims({ orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('not (orientation: portrait) with landscape dims → true (false negated → true)', () => {
    expect(
      matchMediaQuery(
        'not (orientation: portrait)',
        dims({ orientation: 'landscape' })
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gap 6: `color: 0` spec correctness bug (fixed: bits > 0 && bits <= 8)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — color: 0 spec correctness (bug fix: bits must be > 0)', () => {
  test('(color: 0) → false (CSS color:0 means monochrome device; 0 fails the bits > 0 guard)', () => {
    expect(() => matchMediaQuery('(color: 0)', dims())).not.toThrow();
    expect(matchMediaQuery('(color: 0)', dims())).toBe(false);
  });

  test('(color: 1) → true (1 > 0 and 1 <= 8; valid color depth)', () => {
    expect(matchMediaQuery('(color: 1)', dims())).toBe(true);
  });

  test('(color: 8) → true (8 > 0 and 8 <= 8; standard mobile depth)', () => {
    expect(matchMediaQuery('(color: 8)', dims())).toBe(true);
  });

  test('(color: 9) → false (9 > 8; above reported depth)', () => {
    expect(() => matchMediaQuery('(color: 9)', dims())).not.toThrow();
    expect(matchMediaQuery('(color: 9)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 7: prefers-color-scheme unknown value
// ---------------------------------------------------------------------------

describe('matchMediaQuery — prefers-color-scheme unknown / empty value', () => {
  test('(prefers-color-scheme: auto) → false (only light and dark are valid)', () => {
    expect(() =>
      matchMediaQuery('(prefers-color-scheme: auto)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(prefers-color-scheme: auto)', dims())).toBe(false);
  });

  test('(prefers-color-scheme: ) empty value → false (empty string cannot equal light or dark)', () => {
    expect(() =>
      matchMediaQuery('(prefers-color-scheme: )', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(prefers-color-scheme: )', dims())).toBe(false);
  });

  test('(prefers-color-scheme: Light) case-insensitive → true with color-scheme=light (rawValue.toLowerCase())', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: Light)',
        dims({ 'color-scheme': 'light' })
      )
    ).toBe(true);
  });

  test('(prefers-color-scheme: DARK) case-insensitive → true with color-scheme=dark', () => {
    expect(
      matchMediaQuery(
        '(prefers-color-scheme: DARK)',
        dims({ 'color-scheme': 'dark' })
      )
    ).toBe(true);
  });

  test('(prefers-color-scheme: none) → false (not a valid scheme value)', () => {
    expect(() =>
      matchMediaQuery('(prefers-color-scheme: none)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(prefers-color-scheme: none)', dims())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 8: min/max-resolution with dpcm
// ---------------------------------------------------------------------------

describe('matchMediaQuery — min/max-resolution with dpcm unit', () => {
  // 192dpcm = 192 / (96/2.54) ≈ 5.08dppx. dpr=2 < 5.08 → false
  test('(min-resolution: 192dpcm) with dpr=2 → false (192dpcm ≈ 5.08dppx, 2 >= 5.08 = false)', () => {
    expect(() =>
      matchMediaQuery(
        '(min-resolution: 192dpcm)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(min-resolution: 192dpcm)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(false);
  });

  // 48dpcm = 48 / (96/2.54) ≈ 1.27dppx. dpr=2 >= 1.27 → true
  test('(min-resolution: 48dpcm) with dpr=2 → true (48dpcm ≈ 1.27dppx, 2 >= 1.27 = true)', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 48dpcm)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });

  // 96dpcm = 2.54dppx. dpr=2 <= 2.54 → true for max-resolution
  test('(max-resolution: 96dpcm) with dpr=2 → true (96dpcm ≈ 2.54dppx, 2 <= 2.54 = true)', () => {
    expect(
      matchMediaQuery(
        '(max-resolution: 96dpcm)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });

  // 96dpcm = 2.54dppx. dpr=3 <= 2.54 → false for max-resolution
  test('(max-resolution: 96dpcm) with dpr=3 → false (96dpcm ≈ 2.54dppx, 3 <= 2.54 = false)', () => {
    expect(() =>
      matchMediaQuery(
        '(max-resolution: 96dpcm)',
        dims({ 'device-pixel-ratio': 3 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(max-resolution: 96dpcm)',
        dims({ 'device-pixel-ratio': 3 })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gap 9: Combinator stress tests
// ---------------------------------------------------------------------------

describe('matchMediaQuery — combinator stress tests', () => {
  test('OR with 3 segments: first false, second false, third true → true', () => {
    // width=800: 800>=2000=false, 800>=1500=false, 800>=600=true
    expect(
      matchMediaQuery(
        '(min-width: 2000px), (min-width: 1500px), (min-width: 600px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });

  test('OR with 3 segments: all false → false', () => {
    // width=100: all thresholds above 100
    expect(
      matchMediaQuery(
        '(min-width: 500px), (min-width: 800px), (min-width: 1200px)',
        dims({ width: 100 })
      )
    ).toBe(false);
  });

  test('AND chain of 4 conditions: all true → true', () => {
    // width=800 >= 200, <= 1200, height=600 >= 200, orientation=landscape
    expect(
      matchMediaQuery(
        '(min-width: 200px) and (max-width: 1200px) and (min-height: 200px) and (orientation: landscape)',
        dims({ width: 800, height: 600, orientation: 'landscape' })
      )
    ).toBe(true);
  });

  test('AND chain of 4 conditions: last condition false → false', () => {
    // width=800 >= 200=true, <= 1200=true, height=600 >= 200=true, orientation=portrait FAILS
    expect(
      matchMediaQuery(
        '(min-width: 200px) and (max-width: 1200px) and (min-height: 200px) and (orientation: portrait)',
        dims({ width: 800, height: 600, orientation: 'landscape' })
      )
    ).toBe(false);
  });

  test('OR of two not segments: not (min-width: 9999px) → true (false negated), short-circuits', () => {
    // First: not (min-width: 9999px) with width=800 → not false → true → OR done
    // Second: not (min-height: 9999px) never evaluated
    expect(
      matchMediaQuery(
        'not (min-width: 9999px), not (min-height: 9999px)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });

  test('OR of two not segments: both negations true → true', () => {
    // Both: not (min-width: 9999px) = true, not (min-height: 9999px) = true
    // First short-circuits to true
    expect(
      matchMediaQuery(
        'not (min-width: 9999px), not (min-height: 9999px)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });

  test('not at OR segment level: only the segment it prefixes is negated, not the whole query', () => {
    // Segment 1: not (min-width: 600px) with width=800 → not true → false
    // Segment 2: (min-height: 100px) with height=600 → true
    // OR: false OR true → true
    expect(
      matchMediaQuery(
        'not (min-width: 600px), (min-height: 100px)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });

  test('OR with 3 not segments: first two false (negating true), third true (negating false) → true', () => {
    // not (min-width: 600px) with width=800 → not true → false
    // not (min-height: 500px) with height=600 → not true → false
    // not (min-width: 9999px) with width=800 → not false → true
    expect(
      matchMediaQuery(
        'not (min-width: 600px), not (min-height: 500px), not (min-width: 9999px)',
        dims({ width: 800, height: 600 })
      )
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gap 10: Whitespace extremes
// ---------------------------------------------------------------------------

describe('matchMediaQuery — whitespace extremes', () => {
  test('multiple spaces between "and": "(min-width: 600px)  and  (max-width: 1200px)" with width=800 → true', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px)  and  (max-width: 1200px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });

  test('tabs between "and": split regex \\s+ handles tabs — width=800 → true', () => {
    expect(
      matchMediaQuery(
        '(min-width: 600px)\tand\t(max-width: 1200px)',
        dims({ width: 800 })
      )
    ).toBe(true);
  });

  test('tabs between "and": width=1300 fails max-width → false', () => {
    expect(() =>
      matchMediaQuery(
        '(min-width: 600px)\tand\t(max-width: 1200px)',
        dims({ width: 1300 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(min-width: 600px)\tand\t(max-width: 1200px)',
        dims({ width: 1300 })
      )
    ).toBe(false);
  });

  test('leading/trailing whitespace on full query: "  (min-width: 600px)  " with width=800 → true', () => {
    expect(
      matchMediaQuery('  (min-width: 600px)  ', dims({ width: 800 }))
    ).toBe(true);
  });

  test('leading/trailing whitespace on full query: width=500 fails min-width → false', () => {
    expect(() =>
      matchMediaQuery('  (min-width: 600px)  ', dims({ width: 500 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('  (min-width: 600px)  ', dims({ width: 500 }))
    ).toBe(false);
  });

  test('multiple spaces inside parens around colon: "(  min-width  :  800px  )" with width=800 → true', () => {
    expect(
      matchMediaQuery('(  min-width  :  800px  )', dims({ width: 800 }))
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gap 11: Resolution zero edge
// ---------------------------------------------------------------------------

describe('matchMediaQuery — resolution zero edge cases', () => {
  test('(min-resolution: 0dppx) with dpr=2 → true (0 is lowest possible threshold, 2 >= 0)', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 0dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(true);
  });

  test('(min-resolution: 0dppx) with dpr=0 → true (0 >= 0 is the absolute boundary)', () => {
    expect(
      matchMediaQuery(
        '(min-resolution: 0dppx)',
        dims({ 'device-pixel-ratio': 0 })
      )
    ).toBe(true);
  });

  test('(resolution: 0dppx) with dpr=2 → false (exact match 2 === 0 = false)', () => {
    expect(() =>
      matchMediaQuery('(resolution: 0dppx)', dims({ 'device-pixel-ratio': 2 }))
    ).not.toThrow();
    expect(
      matchMediaQuery('(resolution: 0dppx)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(false);
  });

  test('(resolution: 0dppx) with dpr=0 → true (exact match 0 === 0 = true)', () => {
    expect(
      matchMediaQuery('(resolution: 0dppx)', dims({ 'device-pixel-ratio': 0 }))
    ).toBe(true);
  });

  test('(max-resolution: 0dppx) with dpr=2 → false (2 <= 0 = false)', () => {
    expect(() =>
      matchMediaQuery(
        '(max-resolution: 0dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).not.toThrow();
    expect(
      matchMediaQuery(
        '(max-resolution: 0dppx)',
        dims({ 'device-pixel-ratio': 2 })
      )
    ).toBe(false);
  });

  test('(max-resolution: 0dppx) with dpr=0 → true (0 <= 0 = true, zero-resolution edge device)', () => {
    expect(
      matchMediaQuery(
        '(max-resolution: 0dppx)',
        dims({ 'device-pixel-ratio': 0 })
      )
    ).toBe(true);
  });

  test('(min-resolution: 0x) with dpr=2 → true (x suffix = dppx, 2 >= 0 = true)', () => {
    expect(
      matchMediaQuery('(min-resolution: 0x)', dims({ 'device-pixel-ratio': 2 }))
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gap 12: Exact device-width/height equality (never previously tested)
// ---------------------------------------------------------------------------

describe('matchMediaQuery — exact device-width and device-height equality', () => {
  test('(device-width: 1024px) → true (BASE has device-width=1024)', () => {
    expect(matchMediaQuery('(device-width: 1024px)', dims())).toBe(true);
  });

  test('(device-width: 1023px) → false (1024 !== 1023)', () => {
    expect(() =>
      matchMediaQuery('(device-width: 1023px)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(device-width: 1023px)', dims())).toBe(false);
  });

  test('(device-width: 1025px) → false (1024 !== 1025)', () => {
    expect(() =>
      matchMediaQuery('(device-width: 1025px)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(device-width: 1025px)', dims())).toBe(false);
  });

  test('(device-height: 768px) → true (BASE has device-height=768)', () => {
    expect(matchMediaQuery('(device-height: 768px)', dims())).toBe(true);
  });

  test('(device-height: 769px) → false (768 !== 769)', () => {
    expect(() =>
      matchMediaQuery('(device-height: 769px)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(device-height: 769px)', dims())).toBe(false);
  });

  test('(device-height: 767px) → false (768 !== 767)', () => {
    expect(() =>
      matchMediaQuery('(device-height: 767px)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(device-height: 767px)', dims())).toBe(false);
  });

  test('(device-width: 800px) with custom device-width=800 → true', () => {
    expect(
      matchMediaQuery('(device-width: 800px)', dims({ 'device-width': 800 }))
    ).toBe(true);
  });

  test('(device-height: 600px) with custom device-height=600 → true', () => {
    expect(
      matchMediaQuery('(device-height: 600px)', dims({ 'device-height': 600 }))
    ).toBe(true);
  });
});
