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
