import { renderHook } from '@testing-library/react-hooks';

import { useBreakPointValue } from '../useBreakPointValue';
import { Dimensions } from 'react-native';
import { _initTinyBase } from '../../../tinybase';

afterEach(() => {
  jest.clearAllMocks();
});

describe('useBreakPointValue ', () => {
  beforeEach(() => {
    _initTinyBase();
  });
  it('default (with: 414)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 414,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = 'default_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        default: value,
        md: 'NOT_THIS',
        lg: 'NOT_THIS',
        xl: 'NOT_THIS',
      })
    );

    expect(result.current).toBe(value);
  });
  it('sm (width: 640)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 640,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = 'sm_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        'default': 'NOT_THIS',
        'sm': value,
        'md': 'NOT_THIS',
        'lg': 'NOT_THIS',
        'xl': 'NOT_THIS',
        '2xl': 'NOT_THIS',
      })
    );

    expect(result.current).toBe(value);
  });
  it('md (width: 768)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 768,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = 'md_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        'default': 'NOT_THIS',
        'md': value,
        'lg': 'NOT_THIS',
        'xl': 'NOT_THIS',
        '2xl': 'NOT_THIS',
      })
    );

    expect(result.current).toBe(value);
  });
  it('lg (width: 1024)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 1024,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = 'lg_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        'default': 'NOT_THIS',
        'md': 'NOT_THIS',
        'lg': value,
        'xl': 'NOT_THIS',
        '2xl': 'NOT_THIS',
      })
    );

    expect(result.current).toBe(value);
  });
  it('xl (width: 1280)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 1280,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = 'xl_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        'default': 'NOT_THIS',
        'md': 'NOT_THIS',
        'lg': 'NOT_THIS',
        'xl': value,
        '2xl': 'NOT_THIS',
      })
    );

    expect(result.current).toBe(value);
  });
  it('2xl (width: 1920)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 1920,
      height: 818,
      scale: 0,
      fontScale: 0,
    });

    const value = '2xl_TEST';

    const { result } = renderHook(() =>
      useBreakPointValue({
        'default': 'NOT_THIS',
        'xs': 'NOT_THIS',
        'sm': 'NOT_THIS',
        'md': 'NOT_THIS',
        'lg': 'NOT_THIS',
        'xl': 'NOT_THIS',
        '2xl': value,
      })
    );

    expect(result.current).toBe(value);
  });
});
