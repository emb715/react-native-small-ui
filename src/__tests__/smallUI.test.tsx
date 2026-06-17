import {
  _initSmallUI,
  _useSmallUIStore,
  configure,
  createComponent,
  resolvePropByType,
} from '../smallUI';

import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

const mockConsoleWarn = jest.fn();
jest.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('_initSmallUI', () => {
  test('should initialize and set init to true', () => {
    _initSmallUI({});
    expect(_useSmallUIStore.getState().init).toBe(true);
  });

  test('should warn and return undefined when called a second time', () => {
    _initSmallUI({});
    const result = _initSmallUI({});
    expect(mockConsoleWarn).toHaveBeenCalledWith('SmallUI already initiated.');
    expect(result).toBeUndefined();
  });
});

describe('configure', () => {
  test('should merge config into store', () => {
    const customBreakPoints = {
      'default': 0,
      'xs': 480,
      'sm': 600,
      'md': 900,
      'lg': 1200,
      'xl': 1440,
      '2xl': 1920,
    };
    configure({ breakPoints: customBreakPoints });
    expect(_useSmallUIStore.getState().config.breakPoints).toEqual(
      customBreakPoints
    );
  });

  test('should preserve existing config keys when merging', () => {
    configure({ breakPoints: false });
    configure({
      breakPoints: {
        'default': 0,
        'xs': 480,
        'sm': 640,
        'md': 768,
        'lg': 1024,
        'xl': 1280,
        '2xl': 1536,
      },
    });
    expect(_useSmallUIStore.getState().config.breakPoints).toBeDefined();
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
  test('should work with inline props as styles', () => {
    const NewComponent = createComponent(View, {
      backgroundColor: '#f00',
    });
    render(
      <NewComponent
        testID="test-component"
        height={32}
        paddingHorizontal={20}
      />
    );
    const element = screen.getByTestId('test-component');
    expect(element).toBeOnTheScreen();
    expect(element).toHaveStyle({ height: 32, paddingHorizontal: 20 });
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
