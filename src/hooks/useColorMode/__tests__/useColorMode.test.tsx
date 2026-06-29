import { Appearance } from 'react-native';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
  userEvent,
} from '@testing-library/react-native';

import {
  ToggleColorTest,
  TEST_ID_BUTTON,
  TEST_ID_TEXT,
} from '../__components__/ToggleColorTest';

import {
  useColorMode,
  useColorModeValue,
  toggleColorScheme,
  colorSchemeListener,
  setColorScheme,
  setColorMode,
} from '../useColorMode';
import { useColorModeStore } from '../colorMode.store';

const AppearanceSetColorScheme = jest.spyOn(Appearance, 'setColorScheme');
const ColorModeStoreSetState = jest.spyOn(useColorModeStore, 'setState');
const ColorModeStoreGetState = jest.spyOn(useColorModeStore, 'getState');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(jest.fn());
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('setColorScheme', () => {
  test('should pass test', async () => {
    const newColor = 'light';
    setColorScheme(newColor);

    expect(AppearanceSetColorScheme).toHaveBeenCalledTimes(1);
  });
});

describe('setColorMode', () => {
  test('should pass test', async () => {
    const colorMode = 'dark';
    setColorMode(colorMode);

    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(1);
  });

  test('should pass test for undefined', async () => {
    // Cast to any to test the runtime falsy-guard — RN 0.83 ColorSchemeName
    // no longer includes undefined in its type, but setColorMode still
    // short-circuits on falsy values at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colorMode = undefined as any;
    setColorMode(colorMode);

    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(0);
  });
});

// ---------------------------------------------------------------------------
// setColorMode null guard (useColorMode.tsx line 10)
// ---------------------------------------------------------------------------

describe('setColorMode — null guard', () => {
  test('setColorMode with null does not update the store', () => {
    // Ensure store is in 'dark' state first.
    useColorModeStore.setState({ colorMode: 'dark' });

    // Reset spy call count after setState above.
    ColorModeStoreSetState.mockClear();

    // Call setColorMode(null) — line 10: if (newColorMode) skips setState.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setColorMode(null as any);

    // setState must NOT have been called — null is falsy, guard fires.
    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(0);

    // colorMode must still be 'dark' — state was not mutated.
    expect(useColorModeStore.getState().colorMode).toBe('dark');
  });
});

describe('toggleColorScheme', () => {
  test('should switch light to dark', async () => {
    ColorModeStoreGetState.mockImplementation(() => ({ colorMode: 'light' }));
    toggleColorScheme();

    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(1);
    expect(AppearanceSetColorScheme).toHaveBeenCalledTimes(1);
    expect(AppearanceSetColorScheme).toHaveBeenCalledWith('dark');
  });
  test('should switch dark to light', async () => {
    ColorModeStoreGetState.mockImplementation(() => ({ colorMode: 'dark' }));
    toggleColorScheme();

    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(1);
    expect(AppearanceSetColorScheme).toHaveBeenCalledTimes(1);
    expect(AppearanceSetColorScheme).toHaveBeenCalledWith('light');
  });

  test('should change the color scheme by clicking a button', async () => {
    ColorModeStoreGetState.mockImplementation(() => ({ colorMode: 'light' }));
    const user = userEvent.setup();

    renderToggleColor();

    expect(await screen.findByTestId(TEST_ID_TEXT)).toHaveTextContent(
      'current light'
    );
    expect(await screen.findByTestId(TEST_ID_BUTTON)).toBeVisible();

    await act(async () => {
      await user.press(await screen.findByTestId(TEST_ID_BUTTON));
    });

    expect(await screen.findByTestId(TEST_ID_TEXT)).toHaveTextContent(
      'current dark'
    );
  }, 10_000);
});

describe('colorSchemeListener', () => {
  test('should pass test', async () => {
    const result = colorSchemeListener();

    expect(result.remove).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// colorSchemeListener — callback invocation (useColorMode.tsx line 24)
// ---------------------------------------------------------------------------

describe('colorSchemeListener — callback invocation', () => {
  test('listener callback calls setColorMode when color scheme changes', () => {
    // Capture the callback passed to Appearance.addChangeListener.
    let capturedCallback: ((pref: { colorScheme: any }) => void) | undefined;
    jest.spyOn(Appearance, 'addChangeListener').mockImplementation((cb) => {
      capturedCallback = cb;
      return { remove: jest.fn() };
    });

    const listener = colorSchemeListener();

    // The callback must have been registered.
    expect(capturedCallback).toBeDefined();

    // Reset call count so we only measure what the callback triggers.
    ColorModeStoreSetState.mockClear();

    // Invoke the callback as if the system changed to dark mode.
    capturedCallback!({ colorScheme: 'dark' });

    // setColorMode calls useColorModeStore.setState — must have been called once.
    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(1);

    listener.remove();
  });
});

describe('useColorModeValue', () => {
  test('should return light value as a default state', async () => {
    const valueLight = 'light';
    const valueDark = 'dark';
    const { result } = renderHook(() =>
      useColorModeValue(valueLight, valueDark)
    );

    await waitFor(() => result.current);
    expect(result.current).toEqual(valueLight);
  });

  test('should return dark value', async () => {
    // Change default light to dark
    toggleColorScheme();

    const valueLight = 'light';
    const valueDark = 'dark';
    const { result } = renderHook(() =>
      useColorModeValue(valueLight, valueDark)
    );

    await waitFor(() => result.current);
    expect(result.current).toEqual(valueDark);
  });
});

describe('useColorMode', () => {
  test('should return light value as a default state', async () => {
    const response = {
      colorMode: 'light',
      isDark: false,
    };
    const { result } = renderHook(() => useColorMode());

    await waitFor(() => result.current);
    expect(result.current).toEqual(response);
  });
});

const renderToggleColor = () => {
  render(<ToggleColorTest />);
};
