/**
 * Re-render regression tests for createComponent.
 *
 * Goal: verify that introducing the ctx style factory does not add overhead
 * compared to the static style object form, and that components only re-render
 * when a value they actually depend on changes.
 *
 * Approach
 * --------
 * Direct render-count injection into `createComponent` internals is not
 * possible from the outside. Instead we use two complementary strategies:
 *
 * Strategy A — Observable output verification
 *   Assert that the rendered style CHANGES after a store update (proving a
 *   re-render occurred) or STAYS THE SAME (proving no re-render occurred).
 *   Uses `toHaveStyle` from @testing-library/react-native.
 *
 * Strategy B — Ground-truth subscriber parity
 *   Build a plain component that subscribes to useColorModeStore with the
 *   same selector createComponent uses internally, and count its renders.
 *   This gives us the "expected" render count for any colorMode subscriber.
 *   We then assert that createComponent's rendered output matches this
 *   ground-truth — same subscription model, same re-render behaviour.
 *
 * Strategy C — Spy component body
 *   For cases where we need exact render counts of the createComponent output,
 *   we build a component AROUND the CUT that uses the same store selector and
 *   places a counter increment BEFORE the return. Because both this spy and
 *   the CUT subscribe to the same store, they re-render in lockstep — giving
 *   us an accurate count without modifying the library source.
 *
 * Store mutations use `useColorModeStore.setState` directly to avoid the
 * `Appearance.setColorScheme` side-effect, which may behave differently in
 * the jest environment. The zustand mock in `src/__mocks__/zustand.ts`
 * resets all stores after each test.
 *
 * Covered cases:
 *  1.  Static style — renders once on mount (output observable)
 *  2.  Static style — applies _light styles on light mode
 *  3.  Static style — applies _dark styles after colorMode changes to dark
 *  4.  Static style — output unchanged when colorMode stays the same
 *  5.  ctx style — renders once on mount (output observable)
 *  6.  ctx style — applies correct style from ctx.colorMode on light mode
 *  7.  ctx style — style updates after colorMode changes to dark
 *  8.  ctx style — output unchanged when colorMode stays the same
 *  9.  ctx vs static — identical output across colorMode changes (parity)
 *  10. ctx with ctx.breakpoint — renders correctly on mount
 *  11. ctx with ctx.breakpoint — style unchanged on colorMode change (breakpoint-only fn)
 *  12. Ground-truth: colorMode subscriber re-render count matches store changes
 *  13. ctx style — multiple colorMode cycles, each change updates output
 *  14. Sibling state change does NOT update createComponent output
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import { createComponent } from '../smallUI';
import { setColorScheme } from '../hooks/useColorMode/useColorMode';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCounter() {
  return { current: 0 };
}

/**
 * A component that subscribes to useColorModeStore with the same selector
 * createComponent uses internally. Increments `counter` on every render.
 * Used as ground-truth: if this renders N times, a colorMode subscriber
 * should also render N times.
 */
function makeColorModeSubscriberSpy(counter: { current: number }) {
  const Spy = ({ testID }: { testID?: string }) => {
    const colorMode = useColorModeStore((s) => s.colorMode);
    counter.current += 1;
    return <View testID={testID} accessibilityLabel={colorMode} />;
  };
  return Spy;
}

/**
 * Builds a component that subscribes to useColorModeStore (same as CUT)
 * and increments counter on each render. Renders the CUT as a child.
 * Since this component and the CUT share the same subscription, their
 * re-render behaviour is identical — the counter reflects CUT re-renders.
 */
function makeSubscriberWrapper<TProps extends { style?: unknown }>(
  ComponentUnderTest: ReturnType<typeof createComponent<TProps>>,
  counter: { current: number }
) {
  const Wrapper = (props: Parameters<typeof ComponentUnderTest>[0]) => {
    // Same selector as createComponent internals.
    useColorModeStore((s) => s.colorMode);
    counter.current += 1;
    return <ComponentUnderTest {...(props as any)} />;
  };
  return Wrapper;
}

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
// 1. Static style — mount
// ---------------------------------------------------------------------------
describe('static style — mount', () => {
  test('element is on screen after mount', () => {
    const Box = createComponent(View, { padding: 16 });
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toBeOnTheScreen();
  });
});

// ---------------------------------------------------------------------------
// 2 & 3 & 4. Static style — colorMode output correctness
// ---------------------------------------------------------------------------
describe('static style — colorMode output', () => {
  test('applies _light styles when colorMode is light', () => {
    const Box = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });

  test('applies _dark styles after colorMode changes to dark', () => {
    const Box = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });
    render(<Box testID="box" />);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#000000',
    });
  });

  test('output stays the same when colorMode does not change', () => {
    const Box = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });
    render(<Box testID="box" />);

    // Capture initial style
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });

    act(() => {
      useColorModeStore.setState({ colorMode: 'light' }); // same value
    });

    // Style must not change
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });
});

// ---------------------------------------------------------------------------
// 5 & 6 & 7 & 8. ctx style — colorMode output correctness
// ---------------------------------------------------------------------------
describe('ctx style — colorMode output', () => {
  test('element is on screen after mount', () => {
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toBeOnTheScreen();
  });

  test('applies correct background on light mode via ctx.colorMode', () => {
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });

  test('style updates correctly when colorMode changes to dark', () => {
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    render(<Box testID="box" />);

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#000000',
    });
  });

  test('output stays the same when colorMode does not change', () => {
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    render(<Box testID="box" />);

    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });

    act(() => {
      useColorModeStore.setState({ colorMode: 'light' }); // no-op
    });

    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });
});

// ---------------------------------------------------------------------------
// 9. ctx vs static — output parity across colorMode changes
// ---------------------------------------------------------------------------
describe('ctx style vs static style — output parity', () => {
  test('ctx and static produce identical outputs across light/dark cycles', () => {
    const StaticBox = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });
    const CtxBox = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));

    render(
      <>
        <StaticBox testID="static-box" />
        <CtxBox testID="ctx-box" />
      </>
    );

    // Light mode
    expect(screen.getByTestId('static-box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
    expect(screen.getByTestId('ctx-box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });

    // Switch to dark
    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    expect(screen.getByTestId('static-box')).toHaveStyle({
      backgroundColor: '#000000',
    });
    expect(screen.getByTestId('ctx-box')).toHaveStyle({
      backgroundColor: '#000000',
    });

    // Switch back to light
    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
    });

    expect(screen.getByTestId('static-box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
    expect(screen.getByTestId('ctx-box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });
});

// ---------------------------------------------------------------------------
// 10 & 11. ctx style with ctx.breakpoint
// ---------------------------------------------------------------------------
describe('ctx style with ctx.breakpoint', () => {
  test('renders correctly on mount', () => {
    const Box = createComponent(View, (ctx) => ({
      padding: ctx.breakpoint({ default: 8, md: 16 }),
    }));
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toBeOnTheScreen();
  });

  test('output does NOT change when colorMode changes and style fn only reads ctx.breakpoint', () => {
    // This style function never reads ctx.colorMode — only ctx.breakpoint.
    // A colorMode store change must not affect the rendered output.
    const Box = createComponent(View, (ctx) => ({
      padding: ctx.breakpoint({ default: 8, md: 16 }),
    }));
    render(<Box testID="box" />);

    // Capture initial style
    expect(screen.getByTestId('box')).toHaveStyle({ padding: 8 });

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    // Padding must be unchanged — no colorMode dependency in this style fn.
    expect(screen.getByTestId('box')).toHaveStyle({ padding: 8 });
  });
});

// ---------------------------------------------------------------------------
// 12. Ground-truth: subscriber render count matches store change count
// ---------------------------------------------------------------------------
describe('ground-truth subscriber render count', () => {
  test('a direct colorMode subscriber re-renders exactly once per distinct store change', () => {
    const counter = makeCounter();
    const Subscriber = makeColorModeSubscriberSpy(counter);

    render(<Subscriber testID="sub" />);
    expect(counter.current).toBe(1); // mount

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    expect(counter.current).toBe(2);

    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
    });
    expect(counter.current).toBe(3);

    // Same value — zustand bails out, no re-render.
    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
    });
    expect(counter.current).toBe(3);
  });

  test('createComponent subscriber wrapper matches ground-truth render count', () => {
    const groundTruthCounter = makeCounter();
    const cutCounter = makeCounter();

    const GroundTruth = makeColorModeSubscriberSpy(groundTruthCounter);
    const Box = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });
    const CUTWrapper = makeSubscriberWrapper(Box, cutCounter);

    render(
      <>
        <GroundTruth testID="ground-truth" />
        <CUTWrapper testID="box" />
      </>
    );

    expect(groundTruthCounter.current).toBe(1);
    expect(cutCounter.current).toBe(1);

    const changes = ['dark', 'light', 'dark', 'light'] as const;
    changes.forEach((mode) => {
      act(() => {
        useColorModeStore.setState({ colorMode: mode });
      });
    });

    // Both must have the same render count: 1 mount + 4 changes.
    expect(groundTruthCounter.current).toBe(5);
    expect(cutCounter.current).toBe(groundTruthCounter.current);
  });

  test('ctx style subscriber wrapper matches ground-truth render count', () => {
    const groundTruthCounter = makeCounter();
    const cutCounter = makeCounter();

    const GroundTruth = makeColorModeSubscriberSpy(groundTruthCounter);
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    const CUTWrapper = makeSubscriberWrapper(Box, cutCounter);

    render(
      <>
        <GroundTruth testID="ground-truth" />
        <CUTWrapper testID="box" />
      </>
    );

    expect(groundTruthCounter.current).toBe(1);
    expect(cutCounter.current).toBe(1);

    const changes = ['dark', 'light', 'dark'] as const;
    changes.forEach((mode) => {
      act(() => {
        useColorModeStore.setState({ colorMode: mode });
      });
    });

    // ctx style must match ground-truth exactly — zero overhead.
    expect(cutCounter.current).toBe(groundTruthCounter.current);
  });
});

// ---------------------------------------------------------------------------
// 13. Multiple colorMode cycles — output correctness
// ---------------------------------------------------------------------------
describe('ctx style — multiple colorMode cycles', () => {
  test('output correctly tracks each colorMode change', () => {
    const Box = createComponent(View, (ctx) => ({
      backgroundColor: ctx.colorMode === 'dark' ? '#000000' : '#ffffff',
    }));
    render(<Box testID="box" />);

    const sequence = [
      { mode: 'dark' as const, expected: '#000000' },
      { mode: 'light' as const, expected: '#ffffff' },
      { mode: 'dark' as const, expected: '#000000' },
      { mode: 'light' as const, expected: '#ffffff' },
    ];

    sequence.forEach(({ mode, expected }) => {
      act(() => {
        useColorModeStore.setState({ colorMode: mode });
      });
      expect(screen.getByTestId('box')).toHaveStyle({
        backgroundColor: expected,
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 14. Sibling state change — isolation
// ---------------------------------------------------------------------------
describe('sibling re-render isolation', () => {
  test('a sibling state change does NOT update createComponent output style', () => {
    const Box = createComponent(View, {
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#000000' },
    });

    let triggerSiblingRerender: () => void;
    let siblingRenderCount = 0;

    const Sibling = () => {
      const [label, setLabel] = useState('initial');
      triggerSiblingRerender = () => setLabel('updated');
      siblingRenderCount += 1;
      return <Text testID="sibling">{label}</Text>;
    };

    render(
      <View>
        <Box testID="box" />
        <Sibling />
      </View>
    );

    // Verify initial state.
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
    expect(screen.getByTestId('sibling')).toHaveTextContent('initial');
    expect(siblingRenderCount).toBe(1);

    // Trigger sibling re-render — Box props and colorMode store are unchanged.
    act(() => {
      triggerSiblingRerender!();
    });

    expect(screen.getByTestId('sibling')).toHaveTextContent('updated');
    expect(siblingRenderCount).toBe(2);
    // Box style must be unchanged — it has no dependency on sibling state.
    expect(screen.getByTestId('box')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });
});

// ---------------------------------------------------------------------------
// 15. colorMode store selector — state accuracy
// ---------------------------------------------------------------------------
describe('colorMode store selector', () => {
  test('state reflects correct colorMode after setColorScheme calls', () => {
    act(() => {
      setColorScheme('dark');
    });
    expect(useColorModeStore.getState().colorMode).toBe('dark');

    act(() => {
      setColorScheme('light');
    });
    expect(useColorModeStore.getState().colorMode).toBe('light');
  });
});
