import { Appearance } from 'react-native';
import { getColorSchemeDefault } from '../colorMode.store';

const AppearanceGetColorScheme = jest.spyOn(Appearance, 'getColorScheme');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(jest.fn());
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('getColorSchemeDefault', () => {
  test('should return light if is undefined', async () => {
    AppearanceGetColorScheme.mockImplementation(() => undefined);
    const result = getColorSchemeDefault();

    expect(AppearanceGetColorScheme).toHaveBeenCalledTimes(1);
    expect(result).toBe('light');
  });

  test('should return dark', async () => {
    const value = 'dark';
    AppearanceGetColorScheme.mockImplementation(() => value);
    const result = getColorSchemeDefault();

    expect(AppearanceGetColorScheme).toHaveBeenCalledTimes(2);

    expect(result).toBe(value);
  });
  test('should return light', async () => {
    const value = 'light';
    AppearanceGetColorScheme.mockImplementation(() => value);
    const result = getColorSchemeDefault();

    expect(AppearanceGetColorScheme).toHaveBeenCalledTimes(2);

    expect(result).toBe(value);
  });
});
