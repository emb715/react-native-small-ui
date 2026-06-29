import { renderHook } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import {
  getDefaultOrientation,
  getOrientation,
  useOrientation,
} from '../useOrientation';

const mockDimensionsGet = jest.spyOn(Dimensions, 'get');
const mockDimensionsAddEventListener = jest.spyOn(
  Dimensions,
  'addEventListener'
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('getOrientation ', () => {
  test('should pass test portrait', () => {
    const width = 300;
    const height = 400;
    const result = getOrientation(width, height);

    expect(result).toBe('portrait');
  });
  test('should pass test landscape', () => {
    const width = 400;
    const height = 300;
    const result = getOrientation(width, height);

    expect(result).toBe('landscape');
  });
});

describe('getDefaultOrientation ', () => {
  test('should pass test', () => {
    mockDimensionsGet.mockImplementation(() => ({
      fontScale: 1,
      scale: 1,
      width: 300,
      height: 400,
    }));
    const result = getDefaultOrientation();

    expect(result).toBe('portrait');
  });
  test('should pass test landscape', () => {
    mockDimensionsGet.mockImplementation(() => ({
      fontScale: 1,
      scale: 1,
      width: 400,
      height: 300,
    }));
    const result = getDefaultOrientation();

    expect(result).toBe('landscape');
  });
});

describe('useOrientation ', () => {
  test('should pass test', () => {
    mockDimensionsGet.mockImplementation(() => ({
      fontScale: 1,
      scale: 1,
      width: 400,
      height: 300,
    }));

    const { result } = renderHook(() => useOrientation());

    expect(mockDimensionsAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockDimensionsAddEventListener.mock.calls[0]?.[0]).toBe('change');
    expect(mockDimensionsAddEventListener.mock.calls[0]?.[1]).toBeDefined();
    expect(result.current).toBe('landscape');
  });
});

// ---------------------------------------------------------------------------
// useOrientation cleanup on unmount (useOrientation.tsx lines 37-39)
// ---------------------------------------------------------------------------

describe('useOrientation — cleanup on unmount', () => {
  test('Dimensions event listener is removed when component unmounts', () => {
    mockDimensionsGet.mockImplementation(() => ({
      fontScale: 1,
      scale: 1,
      width: 400,
      height: 300,
    }));

    // Spy on the subscription object's remove method.
    // The mock addEventListener must return an object with a `remove` spy.
    const removeSpy = jest.fn();
    mockDimensionsAddEventListener.mockReturnValueOnce({
      remove: removeSpy,
    } as any);

    const { unmount } = renderHook(() => useOrientation());

    // Unmount triggers the cleanup function registered in useEffect.
    expect(() => unmount()).not.toThrow();

    // subscription.remove() must have been called exactly once on cleanup.
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});
