/**
 * Direct unit tests for exported functions in variant.helpers.ts.
 *
 * Coverage targets:
 *   mergeStyles — line 17: both args undefined → return {}
 *   mergeStyles — line 18: a undefined → return b
 *   mergeStyles — line 19: b undefined → return a
 *   mergeStyles — line 20: both defined → shallow merge, b wins on conflict
 *   resolveVariantStyles — line 70: variant group has no style for the active
 *                          value (undefined lookup), style is skipped
 *   resolveVariantStyles — no variants key → returns {}
 *   extractVariantProps — splits variant keys from remaining props correctly
 *   extractVariantProps — empty variantKeys → everything goes to remainingProps
 */

import {
  mergeStyles,
  resolveVariantStyles,
  extractVariantProps,
} from '../variant.helpers';

// ---------------------------------------------------------------------------
// mergeStyles
// ---------------------------------------------------------------------------

describe('mergeStyles', () => {
  // Line 17: if (!a && !b) return {} as ExtendedProps<TProps>
  test('both undefined returns empty object', () => {
    const result = mergeStyles(undefined, undefined);
    expect(result).toEqual({});
  });

  // Line 18: if (!a) return b as ExtendedProps<TProps>
  test('a undefined returns b', () => {
    const b = { padding: 8 } as any;
    const result = mergeStyles(undefined, b);
    expect(result).toEqual({ padding: 8 });
  });

  // Line 19: if (!b) return a
  test('b undefined returns a', () => {
    const a = { padding: 8 } as any;
    const result = mergeStyles(a, undefined);
    expect(result).toEqual({ padding: 8 });
  });

  // Line 20: return { ...a, ...b } — shallow merge, b wins on conflict
  test('both defined merges shallowly, b wins on key conflict', () => {
    const a = { padding: 4, margin: 2 } as any;
    const b = { padding: 8 } as any;
    const result = mergeStyles(a, b);
    expect(result).toEqual({ padding: 8, margin: 2 });
  });
});

// ---------------------------------------------------------------------------
// resolveVariantStyles
// ---------------------------------------------------------------------------

describe('resolveVariantStyles', () => {
  // Line 56: if (!variants) return merged — no variants key at all
  test('no variants key returns empty object', () => {
    const result = resolveVariantStyles({}, {});
    expect(result).toEqual({});
  });

  // Line 70: groupStyles?.[activeValue as string] — the lookup resolves to
  // undefined because the variant group does not have a style for 'ghost'.
  // The `if (style)` guard on line 70 must skip it silently.
  test('variant group has no style for active value — undefined lookup skipped, returns empty', () => {
    const config = {
      variants: {
        intent: {
          primary: { borderRadius: 4 },
          // 'ghost' is NOT defined
        },
      },
    } as any;

    const result = resolveVariantStyles(config, { intent: 'ghost' } as any);
    // Nothing from 'ghost' — it doesn't exist in the intent group.
    expect(result).toEqual({});
  });

  // Verify the normal path still works after the undefined-lookup case.
  test('variant group with matching active value applies the style', () => {
    const config = {
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 },
        },
      },
    } as any;

    const result = resolveVariantStyles(config, { size: 'lg' } as any);
    expect(result).toEqual({ padding: 16 });
  });

  // Verify that activeValue === undefined causes the group to be skipped
  // (line 67: if (activeValue === undefined) continue).
  test('no variant prop and no default — group skipped, returns empty', () => {
    const config = {
      variants: {
        size: { sm: { padding: 4 } },
      },
    } as any;

    const result = resolveVariantStyles(config, {});
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// extractVariantProps
// ---------------------------------------------------------------------------

describe('extractVariantProps', () => {
  // Splits a known variant key from the rest of the props.
  test('splits variant keys from remaining props', () => {
    const onPress = jest.fn();
    const { variantProps, remainingProps } = extractVariantProps(
      { size: 'sm', color: 'red', onPress },
      ['size']
    );

    expect(variantProps).toEqual({ size: 'sm' });
    expect(remainingProps).toEqual({ color: 'red', onPress });
  });

  // When variantKeys is empty every prop ends up in remainingProps.
  test('empty variantKeys puts everything in remainingProps', () => {
    const { variantProps, remainingProps } = extractVariantProps(
      { padding: 8, margin: 4 },
      []
    );

    expect(variantProps).toEqual({});
    expect(remainingProps).toEqual({ padding: 8, margin: 4 });
  });
});
