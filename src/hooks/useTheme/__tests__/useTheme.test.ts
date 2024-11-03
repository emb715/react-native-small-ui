import { renderHook } from '@testing-library/react-native';
import { defaultTheme, _defaultThemeConfig } from '../../../theme/theme';
import { useThemeStore } from '../theme.store';
import { getTheme, registerTheme, useThemeSchema } from '../useTheme';

const mockThemeStoreSetState = jest.spyOn(useThemeStore, 'setState');
const mockThemeStoreGetState = jest.spyOn(useThemeStore, 'getState');

afterEach(() => {
  jest.clearAllMocks();
});

describe('registerTheme ', () => {
  test('should throw invalid config', () => {
    // @ts-ignore
    const result = () => registerTheme({});
    expect(result).toThrow();
    expect(mockThemeStoreSetState).toHaveBeenCalledTimes(0);
  });

  test('should pass test', () => {
    registerTheme(_defaultThemeConfig);
    expect(mockThemeStoreSetState).toHaveBeenCalledTimes(1);
    expect(mockThemeStoreSetState).toHaveBeenCalledWith({
      theme: defaultTheme,
    });
  });
});

describe('getTheme ', () => {
  test('should pass test', () => {
    getTheme();
    expect(mockThemeStoreGetState).toHaveBeenCalledTimes(1);
  });
});

describe('useThemeSchema ', () => {
  test('should pass test', () => {
    const { result } = renderHook(() => useThemeSchema());

    expect(result.current).toMatchObject(defaultTheme.colors.light);
  });
});
