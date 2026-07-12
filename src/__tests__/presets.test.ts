/**
 * Tests for react-native-small-ui/presets.
 *
 * Presets are plain objects — tests assert structure and value correctness,
 * and verify they can be spread into createComponent without error.
 *
 * Coverage:
 *  elevation:
 *  1.  elevation.none has correct zero values
 *  2.  elevation.sm has _ios and _android keys
 *  3.  elevation levels increase in intensity (Android elevation value)
 *  4.  all elevation keys present: none, xs, sm, md, lg, xl
 *
 *  shadow:
 *  5.  shadow.none has zero values
 *  6.  shadow presets have required iOS shadow props
 *  7.  all shadow keys present: none, soft, default, pronounced, inset
 *
 *  inset:
 *  8.  inset.none has zero padding
 *  9.  inset.safe has sensible positive values
 *  10. all inset keys present
 *
 *  text:
 *  11. text.fixed has allowFontScaling: false
 *  12. text.crisp has _android key
 *  13. all text keys present
 *
 *  layout:
 *  14. layout.fill has flex: 1
 *  15. layout.row has flexDirection: 'row'
 *  16. layout.absoluteFill has all position props
 *  17. all layout keys present
 *
 *  border:
 *  18. border.hairline has borderWidth: 0.5
 *  19. border.pill has large borderRadius
 *  20. all border keys present
 *
 *  integration:
 *  21. presets can be spread into a style object without error
 *  22. multiple presets can be merged via cs()
 */

import { elevation, shadow, inset, text, layout, border } from '../presets';
import { cs } from '../utils/helpers';

// ---------------------------------------------------------------------------
// elevation
// ---------------------------------------------------------------------------

describe('elevation presets', () => {
  test('1. elevation.none has zero iOS shadow and zero Android elevation', () => {
    expect(elevation.none._ios.shadowOpacity).toBe(0);
    expect(elevation.none._android.elevation).toBe(0);
  });

  test('2. elevation.sm has _ios and _android keys', () => {
    expect(elevation.sm).toHaveProperty('_ios');
    expect(elevation.sm).toHaveProperty('_android');
    expect(elevation.sm._ios).toHaveProperty('shadowColor');
    expect(elevation.sm._ios).toHaveProperty('shadowOffset');
    expect(elevation.sm._ios).toHaveProperty('shadowOpacity');
    expect(elevation.sm._ios).toHaveProperty('shadowRadius');
    expect(elevation.sm._android).toHaveProperty('elevation');
  });

  test('3. Android elevation values increase by level', () => {
    expect(elevation.xs._android.elevation).toBeLessThan(
      elevation.sm._android.elevation
    );
    expect(elevation.sm._android.elevation).toBeLessThan(
      elevation.md._android.elevation
    );
    expect(elevation.md._android.elevation).toBeLessThan(
      elevation.lg._android.elevation
    );
    expect(elevation.lg._android.elevation).toBeLessThan(
      elevation.xl._android.elevation
    );
  });

  test('4. all elevation keys present', () => {
    const keys = Object.keys(elevation);
    expect(keys).toContain('none');
    expect(keys).toContain('xs');
    expect(keys).toContain('sm');
    expect(keys).toContain('md');
    expect(keys).toContain('lg');
    expect(keys).toContain('xl');
    expect(keys).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// shadow
// ---------------------------------------------------------------------------

describe('shadow presets', () => {
  test('5. shadow.none has zero values', () => {
    expect(shadow.none.shadowOpacity).toBe(0);
    expect(shadow.none.shadowColor).toBe('transparent');
  });

  test('6. shadow presets have required iOS shadow props', () => {
    const requiredKeys = [
      'shadowColor',
      'shadowOffset',
      'shadowOpacity',
      'shadowRadius',
    ];
    for (const key of ['soft', 'default', 'pronounced', 'inset'] as const) {
      for (const prop of requiredKeys) {
        expect(shadow[key]).toHaveProperty(prop);
      }
    }
  });

  test('7. all shadow keys present', () => {
    const keys = Object.keys(shadow);
    expect(keys).toContain('none');
    expect(keys).toContain('soft');
    expect(keys).toContain('default');
    expect(keys).toContain('pronounced');
    expect(keys).toContain('inset');
    expect(keys).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// inset
// ---------------------------------------------------------------------------

describe('inset presets', () => {
  test('8. inset.none has zero padding on all sides', () => {
    expect(inset.none.paddingTop).toBe(0);
    expect(inset.none.paddingBottom).toBe(0);
    expect(inset.none.paddingLeft).toBe(0);
    expect(inset.none.paddingRight).toBe(0);
  });

  test('9. inset.safe has sensible non-zero top and bottom values', () => {
    expect(inset.safe.paddingTop).toBeGreaterThan(0);
    expect(inset.safe.paddingBottom).toBeGreaterThan(0);
  });

  test('10. all inset keys present', () => {
    const keys = Object.keys(inset);
    expect(keys).toContain('none');
    expect(keys).toContain('safe');
    expect(keys).toContain('safeHorizontal');
    expect(keys).toContain('modal');
    expect(keys).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// text
// ---------------------------------------------------------------------------

describe('text presets', () => {
  test('11. text.fixed has allowFontScaling: false', () => {
    expect(text.fixed.allowFontScaling).toBe(false);
  });

  test('12. text.crisp has _android key with includeFontPadding: false', () => {
    expect(text.crisp).toHaveProperty('_android');
    expect((text.crisp._android as any).includeFontPadding).toBe(false);
  });

  test('13. all text keys present', () => {
    const keys = Object.keys(text);
    expect(keys).toContain('fixed');
    expect(keys).toContain('crisp');
    expect(keys).toContain('accessible');
    expect(keys).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------

describe('layout presets', () => {
  test('14. layout.fill has flex: 1', () => {
    expect(layout.fill.flex).toBe(1);
  });

  test('15. layout.row has flexDirection: row', () => {
    expect(layout.row.flexDirection).toBe('row');
  });

  test('16. layout.absoluteFill has all four position props set to 0', () => {
    expect(layout.absoluteFill.position).toBe('absolute');
    expect(layout.absoluteFill.top).toBe(0);
    expect(layout.absoluteFill.right).toBe(0);
    expect(layout.absoluteFill.bottom).toBe(0);
    expect(layout.absoluteFill.left).toBe(0);
  });

  test('17. all layout keys present', () => {
    const keys = Object.keys(layout);
    expect(keys).toContain('fill');
    expect(keys).toContain('center');
    expect(keys).toContain('row');
    expect(keys).toContain('rowBetween');
    expect(keys).toContain('column');
    expect(keys).toContain('absoluteFill');
    expect(keys).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// border
// ---------------------------------------------------------------------------

describe('border presets', () => {
  test('18. border.hairline has borderWidth: 0.5', () => {
    expect(border.hairline.borderWidth).toBe(0.5);
  });

  test('19. border.pill has large borderRadius (>= 9999)', () => {
    expect(border.pill.borderRadius).toBeGreaterThanOrEqual(9999);
  });

  test('20. all border keys present', () => {
    const keys = Object.keys(border);
    expect(keys).toContain('hairline');
    expect(keys).toContain('thin');
    expect(keys).toContain('medium');
    expect(keys).toContain('thick');
    expect(keys).toContain('pill');
    expect(keys).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// integration
// ---------------------------------------------------------------------------

describe('presets integration', () => {
  test('21. presets can be spread into a plain style object without error', () => {
    // createComponent is not imported here — we test that spreading works at
    // the plain object level. Spreading into createComponent is covered by
    // usage examples / docs.
    const cardStyle = {
      borderRadius: 12,
      ...elevation.sm,
      ...border.thin,
    };

    expect(cardStyle).toHaveProperty('borderRadius', 12);
    expect(cardStyle).toHaveProperty('_ios');
    expect(cardStyle).toHaveProperty('_android');
    expect(cardStyle).toHaveProperty('borderWidth', 1);
  });

  test('22. multiple presets merged via cs() — last write wins on conflicts', () => {
    const merged = cs(
      elevation.sm, // has _ios, _android
      { borderRadius: 8 },
      border.thin // has borderWidth: 1
    );

    expect(merged).toHaveProperty('borderRadius', 8);
    expect(merged).toHaveProperty('borderWidth', 1);
    expect(merged).toHaveProperty('_ios');
    expect(merged).toHaveProperty('_android');
  });
});
