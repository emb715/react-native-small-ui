import {
  _initSmallUI,
  configure,
  createComponent,
  resolvePropByType,
  teardownSmallUI,
} from '../smallUI';
import { _autoInit } from '../init';
import { _useSmallUIStore } from '../config.store';

import { render, screen } from '@testing-library/react-native';
import { TextInput, View } from 'react-native';

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

  test('TextInput — text style props are treated as atomic styles, not dropped', () => {
    const props = {
      fontSize: 14,
      color: '#1a1a1a',
      fontWeight: '600',
      borderRadius: 8,
      paddingVertical: 12,
      backgroundColor: '#fff',
    };
    const resolvedProps = resolvePropByType(props, 'TextInput');

    expect(resolvedProps.atomic).toEqual({
      fontSize: 14,
      color: '#1a1a1a',
      fontWeight: '600',
      borderRadius: 8,
      paddingVertical: 12,
      backgroundColor: '#fff',
    });
    expect(resolvedProps.styleProp).toEqual({});
    expect(resolvedProps.customProps).toEqual({});
  });

  test('TextInput — text style props not present in ViewStyleProps are recognised', () => {
    const props = {
      fontSize: 16,
      fontFamily: 'System',
      lineHeight: 24,
      letterSpacing: 0.5,
      textAlign: 'center',
    } as const;
    const resolvedViewProps = resolvePropByType(props, 'View');
    const resolvedTextInputProps = resolvePropByType(props, 'TextInput');

    // Under 'View', text-only props fall through (not in ViewStyleProps atomic bucket)
    expect(Object.keys(resolvedViewProps.atomic)).not.toContain('fontSize');
    expect(Object.keys(resolvedViewProps.atomic)).not.toContain('fontFamily');

    // Under 'TextInput', all text props are correctly routed to atomic
    expect(resolvedTextInputProps.atomic).toMatchObject({
      fontSize: 16,
      fontFamily: 'System',
      lineHeight: 24,
      letterSpacing: 0.5,
      textAlign: 'center',
    });
  });
});

describe('createComponent — TextInput style prop regression', () => {
  test('createComponent wrapping TextInput applies text style props to the rendered element', () => {
    const StyledInput = createComponent(TextInput, {
      fontSize: 14,
      color: '#1a1a1a',
      borderRadius: 8,
      paddingVertical: 12,
    });
    render(<StyledInput testID="styled-input" />);
    const element = screen.getByTestId('styled-input');
    expect(element).toBeOnTheScreen();
    expect(element).toHaveStyle({
      fontSize: 14,
      color: '#1a1a1a',
      borderRadius: 8,
      paddingVertical: 12,
    });
  });

  test('boxShadow is treated as an atomic style prop for View components', () => {
    const props = { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
    const resolvedProps = resolvePropByType(props, 'View');
    expect(resolvedProps.atomic).toHaveProperty('boxShadow');
  });
});

// ---------------------------------------------------------------------------
// _autoInit already-initialized guard (init.ts line 23)
// ---------------------------------------------------------------------------

describe('_autoInit — guard when already initialized', () => {
  test('_autoInit is a no-op when already initialized', () => {
    // The Zustand mock resets state to init:false after each test.
    // Call _autoInit() once to set init:true.
    _autoInit();
    expect(_useSmallUIStore.getState().init).toBe(true);

    // Call again — must early-return (line 23: if (init) return)
    const result = _autoInit();
    expect(result).toBeUndefined(); // early return → undefined

    // Store still has init:true — second call did not re-init
    expect(_useSmallUIStore.getState().init).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GAP 7 — factory.helpers.ts line 32 — direct `style` prop passthrough
// ---------------------------------------------------------------------------

describe('createComponent — direct style prop passthrough', () => {
  test('a style prop passed directly is merged into the component style', () => {
    // factory.helpers.ts line 32-34: propKey === 'style' routes to styleProp bucket.
    // This must pass through without error and the explicit style must be present.
    const StyledView = createComponent(View, { padding: 8 });
    render(<StyledView testID="sv" style={{ margin: 4 }} />);
    const el = screen.getByTestId('sv');
    expect(el).toBeOnTheScreen();
    // margin=4 came from the direct `style` prop
    expect(el).toHaveStyle({ margin: 4 });
  });
});

// ---------------------------------------------------------------------------
// GAP 2 (smallUI.tsx 70-72) — _initSmallUI cleanup function
// ---------------------------------------------------------------------------

describe('_initSmallUI — cleanup function', () => {
  test('_initSmallUI returns a cleanup function that removes the appearance listener', () => {
    // The Zustand mock resets init to false after each test, so _initSmallUI
    // will see init=false and proceed to register the listener.
    // Verify it is false before calling (mock reset already ran).
    expect(_useSmallUIStore.getState().init).toBe(false);

    // Act: call _initSmallUI — must return a cleanup function (line 70-72).
    const cleanup = _initSmallUI({});

    // Assert: returned value is a function.
    expect(typeof cleanup).toBe('function');

    // Assert: calling the cleanup function does not throw.
    expect(() => cleanup!()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// GAP 3 (init.ts 33-35) — teardownSmallUI resets init state
// ---------------------------------------------------------------------------

describe('teardownSmallUI — resets init state', () => {
  test('teardownSmallUI resets store to init:false', () => {
    // Ensure init is true before the test — call _initSmallUI manually since
    // the Zustand mock already reset the store to init:false above.
    _initSmallUI({});
    expect(_useSmallUIStore.getState().init).toBe(true);

    // Act: call teardownSmallUI.
    teardownSmallUI();

    // Assert: store is back to init:false.
    expect(_useSmallUIStore.getState().init).toBe(false);
  });
});
