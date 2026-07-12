/**
 * Tests for the Pluggable Platform Registry.
 *
 * Coverage:
 *  1.  Custom platform predicate — style applied when predicate returns true
 *  2.  Custom platform predicate — style NOT applied when predicate returns false
 *  3.  Multiple custom platforms — only matching ones applied
 *  4.  Custom platform style merges with built-in styles
 *  5.  Built-in _ios/_android/_light/_dark still work after configure({ platforms })
 */

import { act, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { configure, createComponent } from '../smallUI';
import { useColorModeStore } from '../hooks/useColorMode/colorMode.store';

beforeEach(() => {
  jest.useFakeTimers();
  act(() => {
    useColorModeStore.setState({ colorMode: 'light' });
  });
  // Reset platform registry before each test
  configure({ platforms: {} });
});

afterEach(() => {
  jest.clearAllMocks();
  configure({ platforms: {} });
});

// ---------------------------------------------------------------------------
// 1. Custom platform — style applied when predicate returns true
// ---------------------------------------------------------------------------
describe('custom platform — predicate true', () => {
  test('_tablet style applied when tablet predicate returns true', () => {
    configure({ platforms: { tablet: () => true } });

    const Card = createComponent(View, {
      padding: 8,
      _tablet: { padding: 24 },
    } as Parameters<typeof createComponent>[1]);

    render(<Card testID="card" />);
    expect(screen.getByTestId('card')).toHaveStyle({ padding: 24 });
  });
});

// ---------------------------------------------------------------------------
// 2. Custom platform — style NOT applied when predicate returns false
// ---------------------------------------------------------------------------
describe('custom platform — predicate false', () => {
  test('_tablet style NOT applied when tablet predicate returns false', () => {
    configure({ platforms: { tablet: () => false } });

    const Card = createComponent(View, {
      padding: 8,
      _tablet: { padding: 24 },
    } as Parameters<typeof createComponent>[1]);

    render(<Card testID="card" />);
    expect(screen.getByTestId('card')).toHaveStyle({ padding: 8 });
    expect(screen.getByTestId('card')).not.toHaveStyle({ padding: 24 });
  });
});

// ---------------------------------------------------------------------------
// 3. Multiple custom platforms — only matching ones applied
// ---------------------------------------------------------------------------
describe('multiple custom platforms — only matching applied', () => {
  test('only the matching platform style is applied', () => {
    configure({
      platforms: {
        tablet: () => true,
        tv: () => false,
      },
    });

    const Card = createComponent(View, {
      margin: 0,
      _tablet: { margin: 16 },
      _tv: { margin: 40 },
    } as Parameters<typeof createComponent>[1]);

    render(<Card testID="card" />);
    // Only tablet matches — margin=16 from _tablet, not 40 from _tv
    expect(screen.getByTestId('card')).toHaveStyle({ margin: 16 });
  });
});

// ---------------------------------------------------------------------------
// 4. Custom platform merges with component base styles
// ---------------------------------------------------------------------------
describe('custom platform — merges with base styles', () => {
  test('custom platform style layered on top of base styles', () => {
    configure({ platforms: { large: () => true } });

    const Box = createComponent(View, {
      padding: 8,
      borderRadius: 4,
      _large: { padding: 32 },
    } as Parameters<typeof createComponent>[1]);

    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toHaveStyle({
      borderRadius: 4, // from base
      padding: 32, // from _large (overrides base padding)
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Built-in props still work after configure({ platforms })
// ---------------------------------------------------------------------------
describe('built-in style props unaffected by platform registry', () => {
  test('_light and _dark still resolve correctly after configure({ platforms })', () => {
    configure({ platforms: { tablet: () => false } });

    const Box = createComponent(View, {
      _light: { backgroundColor: '#fff' },
      _dark: { backgroundColor: '#000' },
    });

    act(() => {
      useColorModeStore.setState({ colorMode: 'light' });
    });
    render(<Box testID="box" />);
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#fff' });

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor: '#000' });
  });
});
