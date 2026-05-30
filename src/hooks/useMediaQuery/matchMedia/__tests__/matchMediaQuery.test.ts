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

  test('unsupported "prefers-color-scheme: dark" → false, no throw', () => {
    expect(() =>
      matchMediaQuery('(prefers-color-scheme: dark)', dims())
    ).not.toThrow();
    expect(matchMediaQuery('(prefers-color-scheme: dark)', dims())).toBe(false);
  });

  test('unsupported "resolution: 2dppx" → false, no throw', () => {
    expect(() => matchMediaQuery('(resolution: 2dppx)', dims())).not.toThrow();
    expect(matchMediaQuery('(resolution: 2dppx)', dims())).toBe(false);
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
