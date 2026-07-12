/// <reference lib="dom" />
/**
 * Adversarial tests for the `_warnedNoMatchMedia` module-level flag in useMediaQuery.
 *
 * Problem being tested:
 *   `let _warnedNoMatchMedia = false;` lives at module scope. Once set to `true`
 *   it never resets unless explicitly cleared. If a prior test exercises the warn
 *   path and sets the flag to `true`, subsequent tests in the same file that also
 *   expect the warn to fire will silently pass without the warn — a false green.
 *
 * Strategy:
 *   Each test calls `__resetWarnFlagForTesting()` via beforeEach to guarantee
 *   the flag is `false` at the start of every test. This is the lightest correct
 *   approach: a single exported reset function, zero duplicate React instances,
 *   no isolateModules complexity.
 *
 * Implementation notes confirmed before writing:
 *   - Flag is set inside `useEffect` → effects run synchronously inside `act()`.
 *   - `renderHook` from @testing-library/react-native is the project convention.
 *   - `window.matchMedia` is deleted to simulate the unsupported environment.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useMediaQuery, __resetWarnFlagForTesting } from '../useMediaQuery';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function removeMatchMedia() {
  if (typeof window !== 'undefined') {
    delete (window as any).matchMedia;
  }
}

function installMatchMediaMock() {
  if (typeof window !== 'undefined') {
    (window as any).matchMedia = jest
      .fn()
      .mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
  }
}

// Store the original value so we can restore it after matchMedia tests
const originalMatchMedia =
  typeof window !== 'undefined' ? (window as any).matchMedia : undefined;

function restoreMatchMedia() {
  if (typeof window !== 'undefined') {
    if (originalMatchMedia !== undefined) {
      (window as any).matchMedia = originalMatchMedia;
    } else {
      delete (window as any).matchMedia;
    }
  }
}

// ---------------------------------------------------------------------------
// Block A: warn fires exactly once across multiple renders (no matchMedia)
// ---------------------------------------------------------------------------

describe('useMediaQuery — _warnedNoMatchMedia flag (no matchMedia env)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset the module-level flag so every test starts from flag = false
    __resetWarnFlagForTesting();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    removeMatchMedia();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    restoreMatchMedia();
  });

  test('warn fires on the first render when matchMedia is unavailable', () => {
    // Arrange + Act
    renderHook(() => useMediaQuery('(min-width: 600px)'));

    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });

  test('warn fires only once even when multiple hook instances render consecutively', () => {
    // Act: four separate hook renders in the same unsupported env
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    renderHook(() => useMediaQuery('(max-width: 1200px)'));
    renderHook(() => useMediaQuery('(orientation: landscape)'));
    renderHook(() => useMediaQuery('(min-height: 400px)'));

    // Assert: flag gates the warn — only the first render fires it
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('warn fires only once when the same hook instance re-renders with new props', () => {
    // Arrange: initial render fires the warn
    const { rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 600px)' } }
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Act: two re-renders with different queries
    act(() => {
      rerender({ query: '(min-width: 800px)' });
    });
    act(() => {
      rerender({ query: '(min-width: 1024px)' });
    });

    // Assert: flag is now true — no additional warn calls
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('hook returns false when matchMedia is unavailable', () => {
    // Act
    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));

    // Assert: initial useState(false) is never updated because effect returns early
    expect(result.current).toBe(false);
  });

  test('warn message is exactly the expected string', () => {
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(warnSpy).toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });
});

// ---------------------------------------------------------------------------
// Block B: warn does NOT fire when matchMedia IS available
// ---------------------------------------------------------------------------

describe('useMediaQuery — _warnedNoMatchMedia flag (matchMedia IS available)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    __resetWarnFlagForTesting();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    installMatchMediaMock();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    restoreMatchMedia();
  });

  test('warn does NOT fire when window.matchMedia is a function', () => {
    renderHook(() => useMediaQuery('(min-width: 600px)'));

    // supportsMatchMedia is true → the warn branch is never entered
    expect(warnSpy).not.toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });

  test('warn does NOT fire across multiple renders when matchMedia is available', () => {
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    renderHook(() => useMediaQuery('(max-width: 1200px)'));
    renderHook(() => useMediaQuery('(orientation: landscape)'));

    expect(warnSpy).not.toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });

  test('flag remains false after rendering with matchMedia available', () => {
    // If matchMedia IS available, the warn branch never executes, so the flag
    // should stay false — and the next unsupported-env render should still fire.
    renderHook(() => useMediaQuery('(min-width: 600px)'));

    // Now simulate no matchMedia and confirm the warn fires (flag is still false)
    restoreMatchMedia();
    removeMatchMedia();
    renderHook(() => useMediaQuery('(min-width: 600px)'));

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });
});

// ---------------------------------------------------------------------------
// Block C: flag reset isolation — proves the reset function works correctly
// ---------------------------------------------------------------------------

describe('useMediaQuery — _warnedNoMatchMedia flag reset isolation', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    __resetWarnFlagForTesting();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    removeMatchMedia();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    restoreMatchMedia();
  });

  test('after explicit reset, warn fires again on the next unsupported render', () => {
    // First render — warn fires, flag becomes true
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Explicit reset — flag back to false
    __resetWarnFlagForTesting();
    warnSpy.mockClear();

    // Second render — flag is false again, warn fires once more
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'useMediaQuery: window.matchMedia not supported.'
    );
  });

  test('without reset, same module instance: second render does NOT re-fire warn', () => {
    // First render sets the flag to true
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();

    // No __resetWarnFlagForTesting() call — flag stays true
    renderHook(() => useMediaQuery('(max-width: 1200px)'));

    // Assert: flag is true, warn is suppressed
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('reset between sequential unsupported renders allows warn each time', () => {
    // Render 1 — fires
    renderHook(() => useMediaQuery('(min-width: 300px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Reset → flag = false
    __resetWarnFlagForTesting();
    warnSpy.mockClear();

    // Render 2 — fires again (flag was reset)
    renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Reset → flag = false
    __resetWarnFlagForTesting();
    warnSpy.mockClear();

    // Render 3 — fires again
    renderHook(() => useMediaQuery('(min-width: 900px)'));
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
