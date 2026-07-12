/**
 * Tests for Component Metadata (#16).
 *
 * Coverage:
 *  __meta:
 *  1.  __meta is undefined when no meta argument passed
 *  2.  __meta contains the passed descriptor object
 *  3.  __meta is accessible without rendering
 *
 *  __variants:
 *  4.  __variants is undefined when component has no variants
 *  5.  __variants maps group names to their value key arrays
 *  6.  __variants reflects multiple variant groups
 *  7.  __variants is undefined for a plain style (no config)
 *
 *  __resolveStyles:
 *  8.  __resolveStyles returns empty object for undefined base style
 *  9.  __resolveStyles resolves static style object
 *  10. __resolveStyles resolves ctx function with colorMode: dark
 *  11. __resolveStyles resolves ctx function with breakpointWidth: 768
 *  12. __resolveStyles uses defaults (light, width 0) when ctx omitted
 *
 *  integration:
 *  13. all three properties are present on a single component
 *  14. __resolveStyles is callable multiple times with different contexts
 *  15. .extend() forwards __meta from parent to extended component
 */

import { View, TouchableOpacity } from 'react-native';
import { createComponent } from '../smallUI';

// ---------------------------------------------------------------------------
// __meta
// ---------------------------------------------------------------------------

describe('__meta', () => {
  test('1. undefined when no meta argument passed', () => {
    const Box = createComponent(View, { padding: 8 });
    expect(Box.__meta).toBeUndefined();
  });

  test('2. contains passed descriptor', () => {
    const Button = createComponent(
      TouchableOpacity,
      { borderRadius: 8 },
      { name: 'Button', description: 'Primary action button', tags: ['action'] }
    );
    expect(Button.__meta).toBeDefined();
    expect(Button.__meta?.name).toBe('Button');
    expect(Button.__meta?.description).toBe('Primary action button');
    expect(Button.__meta?.tags).toEqual(['action']);
  });

  test('3. accessible without rendering the component', () => {
    const Card = createComponent(
      View,
      { borderRadius: 12 },
      {
        name: 'Card',
      }
    );
    // No render() call — static property read directly
    expect(Card.__meta?.name).toBe('Card');
  });

  test('3b. supports arbitrary extra fields in meta', () => {
    const Widget = createComponent(
      View,
      {},
      {
        name: 'Widget',
        category: 'layout',
        version: 2,
        internal: true,
      }
    );
    expect(Widget.__meta?.category).toBe('layout');
    expect(Widget.__meta?.version).toBe(2);
    expect(Widget.__meta?.internal).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// __variants
// ---------------------------------------------------------------------------

describe('__variants', () => {
  test('4. undefined when component has no variants', () => {
    const Box = createComponent(View, { padding: 8 });
    expect(Box.__variants).toBeUndefined();
  });

  test('5. maps group names to value key arrays', () => {
    const Button = createComponent(View, {
      variants: {
        size: {
          sm: { padding: 4 },
          md: { padding: 8 },
          lg: { padding: 16 },
        },
      },
    });
    expect(Button.__variants).toBeDefined();
    expect(Button.__variants?.size).toEqual(['sm', 'md', 'lg']);
  });

  test('6. reflects multiple variant groups', () => {
    const Button = createComponent(View, {
      variants: {
        size: { sm: {}, md: {}, lg: {} },
        intent: { primary: {}, danger: {}, ghost: {} },
      },
    });
    expect(Button.__variants?.size).toEqual(['sm', 'md', 'lg']);
    expect(Button.__variants?.intent).toEqual(['primary', 'danger', 'ghost']);
    expect(Object.keys(Button.__variants ?? {})).toHaveLength(2);
  });

  test('7. undefined for a plain style (not a ComponentConfig)', () => {
    const Box = createComponent(View, { margin: 8, padding: 4 });
    expect(Box.__variants).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// __resolveStyles
// ---------------------------------------------------------------------------

describe('__resolveStyles', () => {
  test('8. returns empty object when component has no base style', () => {
    const Box = createComponent(View);
    const result = Box.__resolveStyles();
    expect(result).toEqual({});
  });

  test('9. resolves static style object', () => {
    const Box = createComponent(View, { padding: 16, borderRadius: 8 });
    const result = Box.__resolveStyles();
    expect(result).toMatchObject({ padding: 16, borderRadius: 8 });
  });

  test('10. resolves ctx function — colorMode dark', () => {
    const Box = createComponent(
      View,
      (ctx) =>
        ({
          backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
        }) as any
    ); // any: test helper for plain object return
    const result = Box.__resolveStyles({ colorMode: 'dark' });
    expect(result).toMatchObject({ backgroundColor: '#000' });
  });

  test('11. resolves ctx function — breakpointWidth 768 → md', () => {
    const Box = createComponent(
      View,
      (ctx) =>
        ({
          padding: ctx.breakpoint({ default: 8, md: 16, lg: 24 }),
        }) as any
    );
    const result = Box.__resolveStyles({ breakpointWidth: 768 });
    expect(result).toMatchObject({ padding: 16 });
  });

  test('12. uses defaults when ctx omitted — light, width 0', () => {
    const Box = createComponent(
      View,
      (ctx) =>
        ({
          backgroundColor: ctx.colorMode === 'dark' ? '#000' : '#fff',
          padding: ctx.breakpoint({ default: 4, lg: 16 }),
        }) as any
    );
    const result = Box.__resolveStyles();
    expect(result).toMatchObject({ backgroundColor: '#fff', padding: 4 });
  });
});

// ---------------------------------------------------------------------------
// integration
// ---------------------------------------------------------------------------

describe('metadata integration', () => {
  test('13. all three properties present on one component', () => {
    const Card = createComponent(
      View,
      {
        base: { borderRadius: 12 },
        variants: {
          elevated: { yes: { margin: 4 }, no: { margin: 0 } },
        },
        defaultVariants: { elevated: 'no' },
      },
      { name: 'Card', tags: ['layout'] }
    );

    expect(Card.__meta?.name).toBe('Card');
    expect(Card.__variants?.elevated).toEqual(['yes', 'no']);
    expect(typeof Card.__resolveStyles).toBe('function');
    const resolved = Card.__resolveStyles();
    expect(resolved).toMatchObject({ borderRadius: 12 });
  });

  test('14. __resolveStyles is callable multiple times with different contexts', () => {
    const Box = createComponent(
      View,
      (ctx) =>
        ({
          padding: ctx.breakpoint({ default: 8, md: 16 }),
        }) as any
    );

    const atDefault = Box.__resolveStyles({ breakpointWidth: 0 });
    const atMd = Box.__resolveStyles({ breakpointWidth: 768 });

    expect(atDefault).toMatchObject({ padding: 8 });
    expect(atMd).toMatchObject({ padding: 16 });
  });

  test('15. .extend() forwards __meta from parent to extended component', () => {
    const Base = createComponent(
      View,
      { padding: 8 },
      {
        name: 'Base',
        description: 'Base component',
        tags: ['layout'],
      }
    );
    const Extended = Base.extend({ padding: 16 });

    // Extended component carries parent meta forward
    expect(Extended.__meta?.name).toBe('Base');
    expect(Extended.__meta?.description).toBe('Base component');
    expect(Extended.__meta?.tags).toEqual(['layout']);
  });
});
