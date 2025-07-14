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
    const colorMode = undefined;
    setColorMode(colorMode);

    expect(ColorModeStoreSetState).toHaveBeenCalledTimes(0);
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
