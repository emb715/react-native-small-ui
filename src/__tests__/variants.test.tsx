/**
 * Tests for the variant system and .extend() method on createComponent.
 *
 * Coverage:
 *  1.  variants — applies correct variant style when prop is passed
 *  2.  variants — applies no extra style when no variant prop passed and no default
 *  3.  defaultVariants — applied when no explicit variant prop is given
 *  4.  defaultVariants — overridden by explicit prop
 *  5.  compoundVariants — applied only when ALL specified variants match
 *  6.  compoundVariants — NOT applied when only one of the specified variants matches
 *  7.  resolution order — compound variant wins over individual variant on conflict
 *  8.  variants + _light/_dark — variant styles with color mode variants resolve correctly
 *  9.  multiple variant groups — all active groups applied and merged
 *  10. .extend() with static style — base styles preserved, extension wins on conflict
 *  11. .extend() with ComponentConfig — variants merged, extension variants available
 *  12. .extend() — defaultVariants merged, extension defaults override base defaults
 *  13. base style in config + variants — both applied simultaneously
 *  14. direct props override variant styles
 */

import { act, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { createComponent } from '../smallUI';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';

beforeEach(() => {
  jest.useFakeTimers();
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// 1. Variant prop applies correct style
// ---------------------------------------------------------------------------
describe('variants — prop applies correct style', () => {
  const Button = createComponent(View, {
    base: { borderRadius: 8 },
    variants: {
      size: {
        sm: { padding: 4 },
        md: { padding: 8 },
        lg: { padding: 16 },
      },
    },
  });

  test('size="sm" applies padding 4', () => {
    render(<Button testID="btn" size="sm" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 4 });
  });

  test('size="lg" applies padding 16', () => {
    render(<Button testID="btn" size="lg" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 16 });
  });
});

// ---------------------------------------------------------------------------
// 2. No variant prop and no default — no variant style applied
// ---------------------------------------------------------------------------
describe('variants — no prop and no default', () => {
  test('renders without variant style when no prop and no defaultVariants', () => {
    const Box = createComponent(View, {
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 },
        },
      },
    });
    render(<Box testID="box" />);
    // Should render without error — no variant style applied
    expect(screen.getByTestId('box')).toBeOnTheScreen();
  });
});

// ---------------------------------------------------------------------------
// 3. defaultVariants — applied when no explicit prop
// ---------------------------------------------------------------------------
describe('defaultVariants — applied when no explicit prop', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        md: { padding: 8 },
        lg: { padding: 16 },
      },
    },
    defaultVariants: { size: 'md' },
  });

  test('default size="md" applies padding 8 when no size prop given', () => {
    render(<Button testID="btn" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 8 });
  });
});

// ---------------------------------------------------------------------------
// 4. defaultVariants — overridden by explicit prop
// ---------------------------------------------------------------------------
describe('defaultVariants — overridden by explicit prop', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        md: { padding: 8 },
        lg: { padding: 16 },
      },
    },
    defaultVariants: { size: 'md' },
  });

  test('explicit size="lg" overrides default size="md"', () => {
    render(<Button testID="btn" size="lg" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 16 });
  });
});

// ---------------------------------------------------------------------------
// 5. compoundVariants — applied when ALL specified variants match
// ---------------------------------------------------------------------------
describe('compoundVariants — all specified variants match', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        lg: { padding: 16 },
      },
      intent: {
        primary: { borderRadius: 4 },
        danger: { borderRadius: 0 },
      },
    },
    compoundVariants: [
      {
        variants: { size: 'sm', intent: 'danger' },
        style: { borderWidth: 2 },
      },
    ],
  });

  test('compound style applied when size="sm" AND intent="danger"', () => {
    render(<Button testID="btn" size="sm" intent="danger" />);
    expect(screen.getByTestId('btn')).toHaveStyle({
      padding: 4,
      borderRadius: 0,
      borderWidth: 2,
    });
  });
});

// ---------------------------------------------------------------------------
// 6. compoundVariants — NOT applied when only partial match
// ---------------------------------------------------------------------------
describe('compoundVariants — partial match does not apply', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        lg: { padding: 16 },
      },
      intent: {
        primary: { borderRadius: 4 },
        danger: { borderRadius: 0 },
      },
    },
    compoundVariants: [
      {
        variants: { size: 'sm', intent: 'danger' },
        style: { borderWidth: 2 },
      },
    ],
  });

  test('compound style NOT applied when size="sm" but intent="primary"', () => {
    render(<Button testID="btn" size="sm" intent="primary" />);
    // borderWidth: 2 must not be applied
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 4 });
    expect(screen.getByTestId('btn')).not.toHaveStyle({ borderWidth: 2 });
  });
});

// ---------------------------------------------------------------------------
// 7. Resolution order — compound variant wins over individual on conflict
// ---------------------------------------------------------------------------
describe('resolution order — compound wins over individual variant', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4, margin: 2 },
      },
      intent: {
        danger: { padding: 0 },
      },
    },
    compoundVariants: [
      {
        variants: { size: 'sm', intent: 'danger' },
        style: { padding: 99 }, // should win
      },
    ],
  });

  test('compound variant padding=99 wins over individual variant padding values', () => {
    render(<Button testID="btn" size="sm" intent="danger" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 99, margin: 2 });
  });
});

// ---------------------------------------------------------------------------
// 8. Variant styles with _light/_dark — color mode aware variants
// ---------------------------------------------------------------------------
describe('variants — color mode aware styles', () => {
  const Button = createComponent(View, {
    variants: {
      intent: {
        primary: {
          _light: { backgroundColor: '#007AFF' },
          _dark: { backgroundColor: '#0A84FF' },
        },
      },
    },
    defaultVariants: { intent: 'primary' },
  });

  test('applies light backgroundColor in light mode', () => {
    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
    });
    render(<Button testID="btn" />);
    expect(screen.getByTestId('btn')).toHaveStyle({
      backgroundColor: '#007AFF',
    });
  });

  test('applies dark backgroundColor in dark mode', () => {
    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    render(<Button testID="btn" />);
    expect(screen.getByTestId('btn')).toHaveStyle({
      backgroundColor: '#0A84FF',
    });
  });
});

// ---------------------------------------------------------------------------
// 9. Multiple variant groups — all applied and merged
// ---------------------------------------------------------------------------
describe('variants — multiple groups merged', () => {
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        lg: { padding: 16 },
      },
      rounded: {
        yes: { borderRadius: 999 },
        no: { borderRadius: 0 },
      },
    },
  });

  test('both size and rounded variants applied simultaneously', () => {
    render(<Button testID="btn" size="lg" rounded="yes" />);
    expect(screen.getByTestId('btn')).toHaveStyle({
      padding: 16,
      borderRadius: 999,
    });
  });
});

// ---------------------------------------------------------------------------
// 10. .extend() with static style
// ---------------------------------------------------------------------------
describe('.extend() — static style', () => {
  test('base styles preserved, extension wins on conflict', () => {
    const Base = createComponent(View, { padding: 8, borderRadius: 4 });
    const Extended = Base.extend({ padding: 16, margin: 8 });
    render(<Extended testID="ext" />);
    expect(screen.getByTestId('ext')).toHaveStyle({
      padding: 16, // extension wins
      borderRadius: 4, // inherited from base
      margin: 8, // added by extension
    });
  });

  test('extended component does not affect original base component', () => {
    const Base = createComponent(View, { padding: 8 });
    Base.extend({ padding: 16 });
    render(<Base testID="base" />);
    expect(screen.getByTestId('base')).toHaveStyle({ padding: 8 });
  });
});

// ---------------------------------------------------------------------------
// 11. .extend() with ComponentConfig — variants merged
// ---------------------------------------------------------------------------
describe('.extend() — ComponentConfig merges variants', () => {
  test('extended component has both base and extension variants', () => {
    const Base = createComponent(View, {
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 },
        },
      },
    });

    const Extended = Base.extend({
      variants: {
        intent: {
          danger: { borderColor: 'red' },
        },
      },
    });

    // Extended merges variants from both base and extension.
    // Cast needed: .extend() return type doesn't re-infer merged V generics.
    const E = Extended as React.ComponentType<{
      testID?: string;
      size?: string;
      intent?: string;
    }>;
    render(<E testID="ext" size="lg" intent="danger" />);
    expect(screen.getByTestId('ext')).toHaveStyle({
      padding: 16,
      borderColor: 'red',
    });
  });
});

// ---------------------------------------------------------------------------
// 12. .extend() — defaultVariants merged, extension overrides base defaults
// ---------------------------------------------------------------------------
describe('.extend() — defaultVariants merged', () => {
  test('extension defaultVariants override base defaultVariants', () => {
    const Base = createComponent(View, {
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 },
        },
      },
      defaultVariants: { size: 'sm' },
    });

    const Extended = Base.extend({
      defaultVariants: { size: 'lg' },
    });

    render(<Extended testID="ext" />);
    // Extension default (lg = padding 16) overrides base default (sm = padding 4)
    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 16 });
  });
});

// ---------------------------------------------------------------------------
// 13. base style in config + variants — both applied
// ---------------------------------------------------------------------------
describe('base + variants — both applied simultaneously', () => {
  test('base style and active variant style are both present', () => {
    const Card = createComponent(View, {
      base: { borderRadius: 8, overflow: 'hidden' },
      variants: {
        elevated: {
          yes: { margin: 4 },
          no: { margin: 0 },
        },
      },
    });

    render(<Card testID="card" elevated="yes" />);
    expect(screen.getByTestId('card')).toHaveStyle({
      borderRadius: 8,
      margin: 4,
    });
  });
});

// ---------------------------------------------------------------------------
// 14. Direct props override variant styles
// ---------------------------------------------------------------------------
describe('direct props override variant styles', () => {
  test('inline prop padding overrides variant padding', () => {
    const Button = createComponent(View, {
      variants: {
        size: {
          md: { padding: 8 },
        },
      },
      defaultVariants: { size: 'md' },
    });

    render(<Button testID="btn" padding={32} />);
    // Direct prop padding=32 should win over variant's padding=8
    expect(screen.getByTestId('btn')).toHaveStyle({ padding: 32 });
  });
});

// ---------------------------------------------------------------------------
// mergeStyles edge cases via createComponent extend()
//   Covers variant.helpers.ts lines 17-19
// ---------------------------------------------------------------------------

describe('mergeStyles edge cases — via createComponent extend()', () => {
  test('.extend() with empty base (no base style defined) merges correctly', () => {
    // createComponent(View, {}) → baseStyle is effectively empty/undefined for static styles.
    // .extend({ padding: 8 }) → left=undefined, right={padding:8}  → covers line 18: !a → return b
    const Base = createComponent(View, {});
    const Extended = Base.extend({ padding: 8 });
    render(<Extended testID="ext" />);
    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 8 });
  });

  test('.extend() with empty extension object leaves base style intact', () => {
    // createComponent(View, { padding: 8 }) → baseStyle = { padding: 8 }
    // .extend({}) → right is essentially empty; mergeStyles(left, right) spreads both
    // This exercises line 19: !b → return a  (when both sides are absent or right is trivially empty)
    const Base = createComponent(View, { padding: 8 });
    const Extended = Base.extend({});
    render(<Extended testID="ext" />);
    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 8 });
  });
});

// ---------------------------------------------------------------------------
// .extend() with ComponentConfig base merge edge cases
//   Covers smallUI.tsx lines 555-557
// ---------------------------------------------------------------------------

describe('.extend() with ComponentConfig — base merge edge cases', () => {
  test('component with no base style + extend with base in config', () => {
    // No base on original → left=undefined; extend adds base: { margin: 8 } → right has value
    // Covers !left → return right (line 556)
    const Base = createComponent(View, {
      variants: {
        size: {
          sm: { padding: 4 },
        },
      },
    });

    const Extended = Base.extend({
      base: { margin: 8 },
    });

    // Cast: extend() doesn't re-infer merged generics
    const E = Extended as React.ComponentType<{
      testID?: string;
      size?: string;
    }>;
    render(<E testID="ext" size="sm" />);
    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 4, margin: 8 });
  });

  test('component with base style + extend config with no base', () => {
    // Base has base: { margin: 8 }; extension has no base → right=undefined in mergedBase logic.
    // Covers !right → return left (line 557): mergedBase becomes the original baseStyle (margin:8).
    // Use distinct variant groups so extension doesn't overwrite base group (spread is group-level).
    const Base = createComponent(View, {
      base: { margin: 8 },
      variants: {
        size: {
          sm: { padding: 4 },
          lg: { padding: 16 },
        },
      },
    });

    // Extension adds a new variant group 'color' — does NOT override 'size' group.
    // Extension has no `base` → mergedBase = left (the original base: { margin: 8 }).
    const Extended = Base.extend({
      variants: {
        color: {
          red: { borderColor: 'red' },
        },
      },
    });

    const E = Extended as React.ComponentType<{
      testID?: string;
      size?: string;
      color?: string;
    }>;
    render(<E testID="ext" size="sm" />);
    // margin: 8 from base style, padding: 4 from size="sm" variant
    expect(screen.getByTestId('ext')).toHaveStyle({ margin: 8, padding: 4 });
  });
});

// ---------------------------------------------------------------------------
// compoundVariants: multiple matching rules, last-declaration wins
// ---------------------------------------------------------------------------

/**
 * The v0.4.0 spec says compoundVariants are applied "in declaration order"
 * (resolveVariantStyles merges them sequentially, later wins on conflict).
 *
 * Existing tests only have ONE compound rule. This test has TWO rules that
 * both match simultaneously and conflict on the same property — verifying the
 * last-declaration-wins contract holds and does not depend on key insertion
 * order or any other implementation artefact.
 */
describe('compoundVariants — multiple matching rules, last-declaration wins', () => {
  // Two rules, BOTH match when size="sm" AND intent="danger".
  // Rule 1: { size: 'sm', intent: 'danger' } → borderWidth: 2
  // Rule 2: { size: 'sm', intent: 'danger' } → borderWidth: 99  ← must win
  const Button = createComponent(View, {
    variants: {
      size: {
        sm: { padding: 4 },
        lg: { padding: 16 },
      },
      intent: {
        primary: { borderRadius: 4 },
        danger: { borderRadius: 0 },
      },
    },
    compoundVariants: [
      {
        variants: { size: 'sm', intent: 'danger' },
        style: { borderWidth: 2 },
      },
      {
        // Same match condition — second declaration must win on conflict.
        variants: { size: 'sm', intent: 'danger' },
        style: { borderWidth: 99 },
      },
    ],
  });

  test('second matching compound rule wins on conflicting property (borderWidth=99)', () => {
    render(<Button testID="btn" size="sm" intent="danger" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ borderWidth: 99 });
  });

  test('non-conflicting property from first rule is NOT dropped', () => {
    // Rule 1 ONLY sets borderWidth (conflicts, loses). But if rule 1 had added
    // a distinct property, it must survive — only the conflict key is overridden.
    const Button2 = createComponent(View, {
      variants: {
        size: { sm: { padding: 4 } },
        intent: { danger: { borderRadius: 0 } },
      },
      compoundVariants: [
        {
          variants: { size: 'sm', intent: 'danger' },
          style: { borderWidth: 2, margin: 8 }, // margin is unique to rule 1
        },
        {
          variants: { size: 'sm', intent: 'danger' },
          style: { borderWidth: 99 }, // only overrides borderWidth, not margin
        },
      ],
    });
    render(<Button2 testID="btn2" size="sm" intent="danger" />);
    // Last rule wins on borderWidth; margin from first rule must survive.
    expect(screen.getByTestId('btn2')).toHaveStyle({
      borderWidth: 99,
      margin: 8,
    });
  });

  test('compound rule does not activate when only partial match (one key matches, other does not)', () => {
    render(<Button testID="btn-partial" size="sm" intent="primary" />);
    // Neither compound rule activates — intent="primary" ≠ "danger"
    expect(screen.getByTestId('btn-partial')).not.toHaveStyle({
      borderWidth: 2,
    });
    expect(screen.getByTestId('btn-partial')).not.toHaveStyle({
      borderWidth: 99,
    });
  });
});

// ---------------------------------------------------------------------------
// .extend() with ctx factory functions
// ---------------------------------------------------------------------------

describe('.extend() with ctx factory functions', () => {
  test('ctx base + static extension — both merged, ctx wins on colorMode', () => {
    // Base is a ctx function (line 558-570 path); extension is static.
    const Base = createComponent(View, (ctx: any) => ({
      padding: ctx.colorMode === 'dark' ? 16 : 8,
    }));
    // .extend() with a plain style (line 597-610: "either side is a function")
    const Extended = Base.extend({ margin: 4 } as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    render(<Extended testID="ext" />);

    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 16, margin: 4 });
  });

  test('static base + ctx extension — ctx extension evaluated correctly', () => {
    // Base is static; extension is a ctx function (line 597-610 path).
    const Base = createComponent(View, { margin: 4 });
    const Extended = Base.extend(((ctx: any) => ({
      padding: ctx.colorMode === 'dark' ? 16 : 8,
    })) as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    render(<Extended testID="ext" />);

    expect(screen.getByTestId('ext')).toHaveStyle({ padding: 16, margin: 4 });
  });

  test('ctx base + ctx extension — both functions merged', () => {
    // Both sides are ctx functions — both branches inside lines 558-570 execute.
    const Base = createComponent(View, (ctx: any) => ({
      padding: 8,
      borderRadius: ctx.colorMode === 'dark' ? 4 : 2,
    }));
    const Extended = Base.extend(((ctx: any) => ({
      margin: ctx.colorMode === 'dark' ? 16 : 8,
    })) as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    render(<Extended testID="ext" />);

    expect(screen.getByTestId('ext')).toHaveStyle({
      padding: 8,
      borderRadius: 4,
      margin: 16,
    });
  });
});

// ---------------------------------------------------------------------------
// .extend() ComponentConfig path where
//          base is a ctx function (the "both functions" merge branch)
// ---------------------------------------------------------------------------

describe('.extend() with ctx factory — ComponentConfig extension path', () => {
  // Test 1: both sides are ctx functions — hits line 559 with typeof left === 'function'
  // AND typeof right === 'function', exercising the full inner merge (l and r both called).
  test('ctx base + ComponentConfig extension with ctx base — both functions merged via config', () => {
    const Base = createComponent(View, (ctx: any) => ({
      padding: ctx.colorMode === 'dark' ? 16 : 8,
    }));

    const Extended = Base.extend({
      base: (ctx: any) => ({ margin: ctx.colorMode === 'dark' ? 4 : 2 }),
    } as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    render(<Extended testID="ext-both-fn" />);

    expect(screen.getByTestId('ext-both-fn')).toHaveStyle({
      padding: 16,
      margin: 4,
    });
  });

  // Test 2: left is a ctx function, right is static — hits line 559 (typeof left === 'function'
  // is true, typeof right === 'function' is false), executes the static branch for r.
  test('ctx base + ComponentConfig extension with static base — mixed function+static via config', () => {
    const Base = createComponent(View, (ctx: any) => ({
      padding: ctx.colorMode === 'dark' ? 16 : 8,
    }));

    const Extended = Base.extend({
      base: { margin: 4 },
    } as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    render(<Extended testID="ext-fn-static" />);

    expect(screen.getByTestId('ext-fn-static')).toHaveStyle({
      padding: 16,
      margin: 4,
    });
  });

  // Test 3: left is static, right is a ctx function — hits line 559 (typeof right === 'function'
  // is true), executes the static branch for l and the ctx call for r.
  test('static base + ComponentConfig extension with ctx base — mixed static+function via config', () => {
    const Base = createComponent(View, { padding: 8 });

    const Extended = Base.extend({
      base: (ctx: any) => ({ margin: ctx.colorMode === 'dark' ? 4 : 2 }),
    } as any);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    render(<Extended testID="ext-static-fn" />);

    expect(screen.getByTestId('ext-static-fn')).toHaveStyle({
      padding: 8,
      margin: 4,
    });
  });
});
