/**
 * Tests for .withVariantContext() — variant state propagation from parent
 * compound component to its slots.
 *
 * Acceptance criteria:
 *  1.  Slot picks up parent's active variant value via context
 *  2.  Explicit prop on slot always overrides context value
 *  3.  Multiple keys propagate independently
 *  4.  Slot outside a withVariantContext parent uses its own defaultVariants
 *  5.  Two independent compound components never share state (contexts are per-call)
 *  6.  withVariantContext is chainable after withSlots
 *  7.  Parent component still renders correctly after withVariantContext
 *  8.  Slot that has no matching variant key ignores context without error
 *  9.  defaultVariants on parent applied when no explicit prop given
 */

import { act, render, screen } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';

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
// Helpers — components defined at module level (outside render)
// ---------------------------------------------------------------------------

// Button with intent variant and a Text slot
const ButtonWithCtx = createComponent(View, {
  variants: {
    intent: {
      primary: { borderRadius: 4 },
      ghost: { borderRadius: 8 },
    },
  },
  defaultVariants: { intent: 'primary' },
})
  .withSlots({
    Text: createComponent(Text, {
      variants: {
        intent: {
          primary: { color: '#fff' },
          ghost: { color: '#007AFF' },
        },
      },
      defaultVariants: { intent: 'primary' },
    }),
  })
  .withVariantContext('intent');

// Button with two variant groups
const MultiVarButton = createComponent(View, {
  variants: {
    intent: {
      primary: { borderRadius: 4 },
      ghost: { borderRadius: 8 },
    },
    size: {
      sm: { padding: 4 },
      lg: { padding: 16 },
    },
  },
  defaultVariants: { intent: 'primary', size: 'sm' },
})
  .withSlots({
    Label: createComponent(Text, {
      variants: {
        intent: {
          primary: { color: '#fff' },
          ghost: { color: '#007AFF' },
        },
        size: {
          sm: { fontSize: 12 },
          lg: { fontSize: 18 },
        },
      },
      defaultVariants: { intent: 'primary', size: 'sm' },
    }),
  })
  .withVariantContext('intent', 'size');

// Slot used standalone (outside parent)
const StandaloneSlot = createComponent(Text, {
  variants: {
    intent: {
      primary: { color: '#fff' },
      ghost: { color: '#007AFF' },
    },
  },
  defaultVariants: { intent: 'primary' },
});

// Two independent compound components — must not share state
const CompA = createComponent(View, {
  variants: { intent: { primary: { margin: 1 }, ghost: { margin: 2 } } },
  defaultVariants: { intent: 'primary' },
})
  .withSlots({
    Label: createComponent(Text, {
      variants: {
        intent: { primary: { color: '#fff' }, ghost: { color: '#007AFF' } },
      },
      defaultVariants: { intent: 'primary' },
    }),
  })
  .withVariantContext('intent');

const CompB = createComponent(View, {
  variants: { intent: { primary: { margin: 10 }, ghost: { margin: 20 } } },
  defaultVariants: { intent: 'primary' },
})
  .withSlots({
    Label: createComponent(Text, {
      variants: {
        intent: { primary: { color: '#000' }, ghost: { color: '#f00' } },
      },
      defaultVariants: { intent: 'primary' },
    }),
  })
  .withVariantContext('intent');

// Parent with a slot that does NOT have the same variant key
const MixedButton = createComponent(View, {
  variants: {
    intent: { primary: { borderRadius: 4 }, ghost: { borderRadius: 0 } },
  },
  defaultVariants: { intent: 'primary' },
})
  .withSlots({
    // This slot has NO 'intent' variant — it should silently ignore the context
    Icon: createComponent(View, {
      variants: {
        size: { sm: { width: 12 }, lg: { width: 24 } },
      },
      defaultVariants: { size: 'sm' },
    }),
  })
  .withVariantContext('intent');

// ---------------------------------------------------------------------------
// 1. Slot picks up parent's active variant via context
// ---------------------------------------------------------------------------
describe('withVariantContext — slot picks up parent variant', () => {
  test('slot applies ghost style when parent has intent="ghost"', () => {
    render(
      <ButtonWithCtx testID="btn" intent="ghost">
        <ButtonWithCtx.Text testID="text">Cancel</ButtonWithCtx.Text>
      </ButtonWithCtx>
    );
    // ghost slot color is #007AFF
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#007AFF' });
  });

  test('slot applies primary style when parent has intent="primary"', () => {
    render(
      <ButtonWithCtx testID="btn" intent="primary">
        <ButtonWithCtx.Text testID="text">OK</ButtonWithCtx.Text>
      </ButtonWithCtx>
    );
    // primary slot color is #fff
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 2. Explicit prop on slot always overrides context
// ---------------------------------------------------------------------------
describe('withVariantContext — explicit slot prop overrides context', () => {
  test('slot with explicit intent="primary" stays primary despite parent ghost', () => {
    render(
      <ButtonWithCtx testID="btn" intent="ghost">
        <ButtonWithCtx.Text testID="text" intent="primary">
          Keep primary
        </ButtonWithCtx.Text>
      </ButtonWithCtx>
    );
    // Explicit primary wins — color is #fff, not #007AFF
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 3. Multiple keys propagate independently
// ---------------------------------------------------------------------------
describe('withVariantContext — multiple keys propagate independently', () => {
  test('both intent and size are propagated to slot', () => {
    render(
      <MultiVarButton testID="btn" intent="ghost" size="lg">
        <MultiVarButton.Label testID="label">Large Ghost</MultiVarButton.Label>
      </MultiVarButton>
    );
    // ghost color + lg font size
    expect(screen.getByTestId('label')).toHaveStyle({ color: '#007AFF' });
    expect(screen.getByTestId('label')).toHaveStyle({ fontSize: 18 });
  });

  test('explicit override of one key does not affect the other', () => {
    render(
      <MultiVarButton testID="btn" intent="ghost" size="lg">
        <MultiVarButton.Label testID="label" intent="primary">
          Override intent only
        </MultiVarButton.Label>
      </MultiVarButton>
    );
    // intent explicitly overridden to primary — color stays #fff
    expect(screen.getByTestId('label')).toHaveStyle({ color: '#fff' });
    // size still from context = lg — fontSize 18
    expect(screen.getByTestId('label')).toHaveStyle({ fontSize: 18 });
  });
});

// ---------------------------------------------------------------------------
// 4. Slot outside parent uses its own defaultVariants
// ---------------------------------------------------------------------------
describe('withVariantContext — slot outside parent uses own defaults', () => {
  test('standalone slot renders with its own defaultVariants', () => {
    render(<StandaloneSlot testID="txt">Standalone</StandaloneSlot>);
    // defaultVariant intent='primary' → color #fff
    expect(screen.getByTestId('txt')).toHaveStyle({ color: '#fff' });
  });

  test('ButtonWithCtx.Text used outside its parent uses its own defaults', () => {
    render(
      <ButtonWithCtx.Text testID="text">Outside parent</ButtonWithCtx.Text>
    );
    // No parent context — falls back to defaultVariants intent='primary' → #fff
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// 5. Two independent compound components never share state
// ---------------------------------------------------------------------------
describe('withVariantContext — independent components do not share contexts', () => {
  test('CompB ghost does not affect CompA primary slot', () => {
    render(
      <>
        <CompA testID="a" intent="primary">
          <CompA.Label testID="a-label">A label</CompA.Label>
        </CompA>
        <CompB testID="b" intent="ghost">
          <CompB.Label testID="b-label">B label</CompB.Label>
        </CompB>
      </>
    );
    // CompA primary: color #fff
    expect(screen.getByTestId('a-label')).toHaveStyle({ color: '#fff' });
    // CompB ghost: color #f00
    expect(screen.getByTestId('b-label')).toHaveStyle({ color: '#f00' });
  });
});

// ---------------------------------------------------------------------------
// 6. withVariantContext is chainable after withSlots
// ---------------------------------------------------------------------------
describe('withVariantContext — chaining after withSlots', () => {
  test('withVariantContext returns a component with slots attached', () => {
    expect(ButtonWithCtx.Text).toBeDefined();
    expect(typeof ButtonWithCtx.Text).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 7. Parent component still renders correctly after withVariantContext
// ---------------------------------------------------------------------------
describe('withVariantContext — parent renders correctly', () => {
  test('parent receives its own variant styles unaffected', () => {
    render(<ButtonWithCtx testID="btn" intent="ghost" />);
    // ghost intent gives borderRadius: 8
    expect(screen.getByTestId('btn')).toHaveStyle({ borderRadius: 8 });
  });

  test('parent with primary intent gives borderRadius: 4', () => {
    render(<ButtonWithCtx testID="btn" intent="primary" />);
    expect(screen.getByTestId('btn')).toHaveStyle({ borderRadius: 4 });
  });
});

// ---------------------------------------------------------------------------
// 8. Slot with no matching variant key ignores context without error
// ---------------------------------------------------------------------------
describe('withVariantContext — slot ignores unknown context key', () => {
  test('Icon slot renders without error when parent has intent context', () => {
    render(
      <MixedButton testID="btn" intent="ghost">
        <MixedButton.Icon testID="icon" size="lg" />
      </MixedButton>
    );
    // Icon has no 'intent' variant — should render without error
    // and respect its own size variant
    expect(screen.getByTestId('icon')).toHaveStyle({ width: 24 });
  });
});

// ---------------------------------------------------------------------------
// 9. defaultVariants on parent applied when no explicit prop given
// ---------------------------------------------------------------------------
describe('withVariantContext — parent defaultVariants propagate to slot', () => {
  test('slot picks up defaultVariants when no explicit parent prop', () => {
    render(
      // No explicit intent prop — should use parent's defaultVariants: intent='primary'
      <ButtonWithCtx testID="btn">
        <ButtonWithCtx.Text testID="text">Default</ButtonWithCtx.Text>
      </ButtonWithCtx>
    );
    // defaultVariant intent='primary' → slot color #fff
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#fff' });
  });
});

// ---------------------------------------------------------------------------
// Adversarial tests — two-slot, two-variant compound (Button + Badge)
// ---------------------------------------------------------------------------

// Button — two-slot (Text + Icon), two-variant (intent + size) compound
const Button = createComponent(TouchableOpacity, {
  base: { borderRadius: 8 },
  variants: {
    intent: {
      primary: { borderRadius: 4 },
      ghost: { borderRadius: 0 },
    },
    size: {
      sm: { paddingVertical: 6 },
      lg: { paddingVertical: 14 },
    },
  },
  defaultVariants: { intent: 'primary', size: 'sm' },
})
  .withSlots({
    Text: createComponent(Text, {
      variants: {
        intent: {
          primary: { color: '#ffffff' },
          ghost: { color: '#007AFF' },
        },
        size: {
          sm: { fontSize: 14 },
          lg: { fontSize: 18 },
        },
      },
      defaultVariants: { intent: 'primary', size: 'sm' },
    }),
    Icon: createComponent(Text, {
      variants: {
        intent: {
          primary: { color: '#ffffff' },
          ghost: { color: '#007AFF' },
        },
        // intentionally no 'size' variant — tests graceful unknown-key handling
      },
      defaultVariants: { intent: 'primary' },
    }),
  })
  .withVariantContext('intent', 'size');

// Badge — separate compound for isolation tests
const Badge = createComponent(View, {
  variants: {
    intent: {
      active: { borderRadius: 4 },
      inactive: { borderRadius: 0 },
    },
  },
  defaultVariants: { intent: 'active' },
})
  .withSlots({
    Label: createComponent(Text, {
      variants: {
        intent: {
          active: { color: 'green' },
          inactive: { color: 'gray' },
        },
      },
      defaultVariants: { intent: 'active' },
    }),
  })
  .withVariantContext('intent');

// ---------------------------------------------------------------------------
// 10. Explicit slot prop overrides context (adversarial)
// ---------------------------------------------------------------------------
describe('withVariantContext — explicit slot prop overrides context', () => {
  test('slot explicit intent="primary" wins over parent intent="ghost"', () => {
    render(
      <Button testID="btn" intent="ghost">
        <Button.Text testID="text" intent="primary">
          Keep primary
        </Button.Text>
      </Button>
    );
    // Explicit primary on slot wins — color is #ffffff, not ghost #007AFF
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#ffffff' });
  });

  test('slot explicit intent="ghost" wins over parent intent="primary"', () => {
    render(
      <Button testID="btn" intent="primary">
        <Button.Text testID="text" intent="ghost">
          Override to ghost
        </Button.Text>
      </Button>
    );
    // Explicit ghost on slot wins — color is #007AFF, not primary #ffffff
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#007AFF' });
  });
});

// ---------------------------------------------------------------------------
// 11. Slot outside provider uses own defaultVariants
// ---------------------------------------------------------------------------
describe('withVariantContext — slot outside provider uses own defaultVariants', () => {
  test('Button.Text rendered standalone falls back to primary default color', () => {
    render(<Button.Text testID="t">Standalone</Button.Text>);
    // No Button parent — defaultVariants intent='primary' → color #ffffff
    expect(screen.getByTestId('t')).toHaveStyle({ color: '#ffffff' });
  });
});

// ---------------------------------------------------------------------------
// 12. Multiple keys propagate independently (adversarial)
// ---------------------------------------------------------------------------
describe('withVariantContext — multiple keys propagate independently', () => {
  test('parent intent="ghost" size="lg" propagates both to slot', () => {
    render(
      <Button testID="btn" intent="ghost" size="lg">
        <Button.Text testID="text">Large Ghost</Button.Text>
      </Button>
    );
    // Both context values must arrive: ghost color + lg font size
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#007AFF' });
    expect(screen.getByTestId('text')).toHaveStyle({ fontSize: 18 });
  });

  test('explicit size="sm" on slot overrides size context but keeps ghost color from context', () => {
    render(
      <Button testID="btn" intent="ghost" size="lg">
        <Button.Text testID="text" size="sm">
          Ghost sm override
        </Button.Text>
      </Button>
    );
    // intent from context = ghost → blue
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#007AFF' });
    // size explicitly sm → fontSize 14, not lg 18
    expect(screen.getByTestId('text')).toHaveStyle({ fontSize: 14 });
  });
});

// ---------------------------------------------------------------------------
// 13. Context isolation between independent compound components
// ---------------------------------------------------------------------------
describe('withVariantContext — context isolation between compounds', () => {
  test('Button ghost and Badge inactive render independently in the same tree', () => {
    render(
      <>
        <Button testID="btn" intent="ghost">
          <Button.Text testID="bt">Button text</Button.Text>
        </Button>
        <Badge testID="badge" intent="inactive">
          <Badge.Label testID="bl">Badge label</Badge.Label>
        </Badge>
      </>
    );
    // Button.Text gets ghost blue from Button context
    expect(screen.getByTestId('bt')).toHaveStyle({ color: '#007AFF' });
    // Badge.Label gets gray from Badge context — not blue
    expect(screen.getByTestId('bl')).toHaveStyle({ color: 'gray' });
  });

  test('Badge intent="inactive" does not bleed into Button.Text', () => {
    render(
      <>
        <Button testID="btn" intent="primary">
          <Button.Text testID="bt">Button</Button.Text>
        </Button>
        <Badge testID="badge" intent="inactive">
          <Badge.Label testID="bl">Badge</Badge.Label>
        </Badge>
      </>
    );
    // Button.Text must be white (primary), unaffected by Badge's inactive context
    expect(screen.getByTestId('bt')).toHaveStyle({ color: '#ffffff' });
    expect(screen.getByTestId('bl')).toHaveStyle({ color: 'gray' });
  });
});

// ---------------------------------------------------------------------------
// 14. Nested compound components — contexts do not bleed across nesting
// ---------------------------------------------------------------------------
describe('withVariantContext — nested compound components', () => {
  test('inner Button intent="primary" does not inherit outer Button intent="ghost"', () => {
    render(
      <Button testID="outer-btn" intent="ghost">
        <Button.Text testID="outer">Outer text</Button.Text>
        <Button testID="inner-btn" intent="primary">
          <Button.Text testID="inner">Inner text</Button.Text>
        </Button>
      </Button>
    );
    // Outer slot: ghost blue
    expect(screen.getByTestId('outer')).toHaveStyle({ color: '#007AFF' });
    // Inner slot: primary white — inner Button's context wins
    expect(screen.getByTestId('inner')).toHaveStyle({ color: '#ffffff' });
  });
});

// ---------------------------------------------------------------------------
// 15. Dynamic prop change re-renders slot
// ---------------------------------------------------------------------------
describe('withVariantContext — dynamic prop change re-renders slot', () => {
  test('slot updates style when parent intent prop changes from primary to ghost', () => {
    const { rerender } = render(
      <Button testID="btn" intent="primary">
        <Button.Text testID="text">Reactive</Button.Text>
      </Button>
    );
    // Initial: primary → white
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#ffffff' });

    // Re-render with ghost
    rerender(
      <Button testID="btn" intent="ghost">
        <Button.Text testID="text">Reactive</Button.Text>
      </Button>
    );
    // After prop change: ghost → blue
    expect(screen.getByTestId('text')).toHaveStyle({ color: '#007AFF' });
  });
});

// ---------------------------------------------------------------------------
// 16. Slot with no matching variant key ignores context gracefully
// ---------------------------------------------------------------------------
describe('withVariantContext — slot with no matching variant key ignores context gracefully', () => {
  test('Icon (no size variant) renders without crash and gets ghost color when size is in context', () => {
    render(
      <Button testID="btn" intent="ghost" size="lg">
        <Button.Icon testID="i" />
      </Button>
    );
    // Icon has no 'size' variant — must not crash from unknown size context
    // Icon does have 'intent' → ghost color from context
    expect(screen.getByTestId('i')).toHaveStyle({ color: '#007AFF' });
  });
});

// ---------------------------------------------------------------------------
// 17. Two slots both receive context
// ---------------------------------------------------------------------------
describe('withVariantContext — two slots both receive context', () => {
  test('Button.Text and Button.Icon both get ghost styles from the same parent context', () => {
    render(
      <Button testID="btn" intent="ghost">
        <Button.Text testID="t">Label</Button.Text>
        <Button.Icon testID="i" />
      </Button>
    );
    // Both slots read the same intent context → both ghost blue
    expect(screen.getByTestId('t')).toHaveStyle({ color: '#007AFF' });
    expect(screen.getByTestId('i')).toHaveStyle({ color: '#007AFF' });
  });
});
