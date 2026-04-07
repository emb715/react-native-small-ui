/**
 * Tests for Compound Component Slots (.withSlots) and createComponentGroup.
 *
 * Coverage — .withSlots():
 *  1.  Slot components accessible as dot-notation properties
 *  2.  Slot renders correctly with its own styles
 *  3.  Multiple slots attached — all accessible and independently styled
 *  4.  Parent and slot both share colorMode context reactively
 *  5.  .withSlots() does not mutate behavior of the parent component itself
 *
 * Coverage — createComponentGroup():
 *  6.  All group members render independently
 *  7.  Group members have their own base styles
 *  8.  Group members share colorMode context reactively
 *  9.  Group members are independent — different styles, same context
 *  10. Group returns all named keys
 */

import { act, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { createComponent, createComponentGroup } from '../smallUI';
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
// .withSlots() tests
// ---------------------------------------------------------------------------

describe('.withSlots() — slot components accessible as dot-notation', () => {
  test('slot component is defined as property on parent', () => {
    const Card = createComponent(View, { borderRadius: 8 }).withSlots({
      Header: createComponent(View, { padding: 12 }),
      Body: createComponent(View, { padding: 16 }),
    });

    expect(Card.Header).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(typeof Card.Header).toBe('function');
    expect(typeof Card.Body).toBe('function');
  });
});

describe('.withSlots() — slot renders with its own styles', () => {
  test('Card.Header renders with its padding', () => {
    const Card = createComponent(View, { borderRadius: 8 }).withSlots({
      Header: createComponent(View, { padding: 12 }),
    });

    render(<Card.Header testID="header" />);
    expect(screen.getByTestId('header')).toHaveStyle({ padding: 12 });
  });
});

describe('.withSlots() — multiple slots independently styled', () => {
  test('Header and Footer have different styles', () => {
    const Card = createComponent(View, { borderRadius: 8 }).withSlots({
      Header: createComponent(View, { padding: 12 }),
      Footer: createComponent(View, { padding: 4 }),
    });

    render(
      <>
        <Card.Header testID="header" />
        <Card.Footer testID="footer" />
      </>
    );

    expect(screen.getByTestId('header')).toHaveStyle({ padding: 12 });
    expect(screen.getByTestId('footer')).toHaveStyle({ padding: 4 });
  });
});

describe('.withSlots() — parent and slot share colorMode context', () => {
  test('both parent and slot update when colorMode changes', () => {
    const Card = createComponent(View, {
      _light: { backgroundColor: '#fff' },
      _dark: { backgroundColor: '#111' },
    }).withSlots({
      Header: createComponent(View, {
        _light: { borderBottomColor: '#eee' },
        _dark: { borderBottomColor: '#333' },
      }),
    });

    render(
      <Card testID="card">
        <Card.Header testID="header" />
      </Card>
    );

    // Light mode
    expect(screen.getByTestId('card')).toHaveStyle({ backgroundColor: '#fff' });
    expect(screen.getByTestId('header')).toHaveStyle({
      borderBottomColor: '#eee',
    });

    // Switch to dark
    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    expect(screen.getByTestId('card')).toHaveStyle({ backgroundColor: '#111' });
    expect(screen.getByTestId('header')).toHaveStyle({
      borderBottomColor: '#333',
    });
  });
});

describe('.withSlots() — parent component behavior unaffected', () => {
  test('parent component renders normally after withSlots()', () => {
    const Card = createComponent(View, {
      padding: 16,
      borderRadius: 8,
    }).withSlots({
      Body: createComponent(View, { padding: 8 }),
    });

    render(<Card testID="card" />);
    expect(screen.getByTestId('card')).toHaveStyle({
      padding: 16,
      borderRadius: 8,
    });
  });
});

// ---------------------------------------------------------------------------
// createComponentGroup() tests
// ---------------------------------------------------------------------------

describe('createComponentGroup() — all members render independently', () => {
  test('each member renders with its testID', () => {
    const { Label, Input } = createComponentGroup({
      Label: { Component: Text, style: { fontSize: 14 } },
      Input: { Component: View, style: { borderWidth: 1 } },
    });

    render(
      <>
        <Label testID="label">Email</Label>
        <Input testID="input" />
      </>
    );

    expect(screen.getByTestId('label')).toBeOnTheScreen();
    expect(screen.getByTestId('input')).toBeOnTheScreen();
  });
});

describe('createComponentGroup() — members have their own styles', () => {
  test('Label and Input have independently defined styles', () => {
    const { ErrorText, InputField } = createComponentGroup({
      ErrorText: { Component: View, style: { margin: 4 } },
      InputField: { Component: View, style: { padding: 8, borderRadius: 4 } },
    });

    render(
      <>
        <ErrorText testID="error" />
        <InputField testID="input" />
      </>
    );

    expect(screen.getByTestId('error')).toHaveStyle({ margin: 4 });
    expect(screen.getByTestId('input')).toHaveStyle({
      padding: 8,
      borderRadius: 4,
    });
  });
});

describe('createComponentGroup() — members share colorMode context', () => {
  test('all group members respond to colorMode changes', () => {
    const { Primary, Secondary } = createComponentGroup({
      Primary: {
        Component: View,
        style: {
          _light: { backgroundColor: '#007AFF' },
          _dark: { backgroundColor: '#0A84FF' },
        },
      },
      Secondary: {
        Component: View,
        style: {
          _light: { backgroundColor: '#f4f4f5' },
          _dark: { backgroundColor: '#1a1a38' },
        },
      },
    });

    render(
      <>
        <Primary testID="primary" />
        <Secondary testID="secondary" />
      </>
    );

    // Light mode
    expect(screen.getByTestId('primary')).toHaveStyle({
      backgroundColor: '#007AFF',
    });
    expect(screen.getByTestId('secondary')).toHaveStyle({
      backgroundColor: '#f4f4f5',
    });

    act(() => {
      useColorModeStore.setState({ colorMode: 'dark' });
    });

    // Dark mode
    expect(screen.getByTestId('primary')).toHaveStyle({
      backgroundColor: '#0A84FF',
    });
    expect(screen.getByTestId('secondary')).toHaveStyle({
      backgroundColor: '#1a1a38',
    });
  });
});

describe('createComponentGroup() — returns all named keys', () => {
  test('returned object contains all specified names', () => {
    const group = createComponentGroup({
      Row: { Component: View, style: { flexDirection: 'row' } },
      Col: { Component: View, style: { flexDirection: 'column' } },
      Spacer: { Component: View, style: { flex: 1 } },
    });

    expect(group.Row).toBeDefined();
    expect(group.Col).toBeDefined();
    expect(group.Spacer).toBeDefined();
    expect(typeof group.Row).toBe('function');
    expect(typeof group.Col).toBe('function');
    expect(typeof group.Spacer).toBe('function');
  });
});
