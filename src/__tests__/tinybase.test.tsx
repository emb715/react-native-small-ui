import {
  _initTinyBase,
  _useTinyBaseStore,
  createComponent,
  resolvePropByType,
  useTinyBase,
} from '../tinybase';

import * as ColorMode from '../hooks/useColorMode/useColorMode';
import {
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { View } from 'react-native';

const mockConsoleWarn = jest.fn();
jest.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

const mockStoreSetState = jest.spyOn(_useTinyBaseStore, 'setState');
const mockColorSchemeListener = jest.spyOn(ColorMode, 'colorSchemeListener');

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('_initTinyBase', () => {
  //
  test('should pass test', () => {
    const config = {};
    const result = _initTinyBase(config);

    expect(mockStoreSetState).toHaveBeenCalledTimes(1);
    expect(typeof result === 'function').toBeTruthy();
    expect(mockColorSchemeListener).toHaveBeenCalledTimes(1);
  });

  test('should warn already initialized', () => {
    const themeConfig = undefined;
    _initTinyBase(themeConfig);
    const result = _initTinyBase(themeConfig);

    expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mockConsoleWarn).toHaveBeenCalledWith('TinyBase already initiated.');
    expect(result).toBeUndefined();
  });
});

describe('useTinyBase', () => {
  test('should work', async () => {
    const { result } = renderHook(() => useTinyBase());
    await waitFor(() => result.current);
    expect(result.current).toBe(undefined);
  });
});

describe('createComponent', () => {
  //
  test('should work', () => {
    const NewComponent = createComponent(View);
    render(<NewComponent testID="test-component" />);
    const element = screen.getByTestId('test-component');
    expect(element).toBeOnTheScreen();
  });
  test('should work with custom styles', () => {
    const NewComponent = createComponent(View, {
      backgroundColor: '#f00',
    });
    render(<NewComponent testID="test-component" />);
    const element = screen.getByTestId('test-component');
    expect(element).toBeOnTheScreen();
  });
});

describe('resolvePropByType', () => {
  //
  test('should work', () => {
    const customProps = {
      marginTop: 10,
      backgroundColor: '#99f',
      style: {
        paddingTop: 5,
      },
      _light: {
        backgroundColor: '#fff',
      },
      _dark: {
        backgroundColor: '#000',
      },
      _web: {
        backgroundColor: '#00f',
      },
      _native: {
        backgroundColor: '#0ff',
      },
      _ios: {
        backgroundColor: '#f00',
      },
      _android: {
        backgroundColor: '#f0f',
      },
      onPress: () => {
        //
      },
    };
    const resolvedProps = resolvePropByType(customProps, 'View');

    expect(resolvedProps).toEqual({
      atomic: {
        marginTop: 10,
        backgroundColor: '#99f',
      },
      customProps: {
        _light: {
          backgroundColor: '#fff',
        },
        _dark: {
          backgroundColor: '#000',
        },
        _web: {
          backgroundColor: '#00f',
        },
        _native: {
          backgroundColor: '#0ff',
        },
        _ios: {
          backgroundColor: '#f00',
        },
        _android: {
          backgroundColor: '#f0f',
        },
      },
      styleProp: {
        paddingTop: 5,
      },
    });
  });

  test('should return empty objects', () => {
    const customProps = {};
    const resolvedProps = resolvePropByType(customProps, 'View');

    expect(resolvedProps).toEqual({
      atomic: {},
      customProps: {},
      styleProp: {},
    });
  });
});

// describe('createStyle', () => {
//   //
//   xtest('should work', () => {
//     // const styles = createStyle();
//     // expect(styles).toEqual({});
//   });
// });
