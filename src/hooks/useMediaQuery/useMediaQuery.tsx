import './matchMedia/matchMedia.polyfill';

import { useCallback, useSyncExternalStore } from 'react';
import type { MediaQueryListEvent } from './matchMedia/mediaQuery.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare var window: any;

interface NativeMQL {
  matches: boolean;
  media: string;
  addListener(listener: (e: MediaQueryListEvent) => void): void;
  removeListener(listener: (e: MediaQueryListEvent) => void): void;
  _unmount?(): void;
}

let _warnedNoMatchMedia = false;

// Module-level cache: at most one MediaQueryList instance per unique query string.
// Prevents the native polyfill from registering a new Dimensions listener on every
// getSnapshot call (which has no cleanup path).
const _mqCache = new Map<string, NativeMQL>();

function getMQ(mediaQueryString: string): NativeMQL | null {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }
  const cached = _mqCache.get(mediaQueryString);
  if (cached !== undefined) {
    return cached;
  }
  const mq = window.matchMedia(mediaQueryString) as unknown as NativeMQL;
  _mqCache.set(mediaQueryString, mq);
  return mq;
}

function getSnapshot(mediaQueryString: string): boolean {
  const mq = getMQ(mediaQueryString);
  if (mq === null) {
    return false;
  }
  return mq.matches;
}

function subscribe(mediaQueryString: string, callback: () => void): () => void {
  const mq = getMQ(mediaQueryString);
  if (mq === null) {
    if (!_warnedNoMatchMedia) {
      _warnedNoMatchMedia = true;
      console.warn('useMediaQuery: window.matchMedia not supported.');
    }
    return () => {};
  }
  mq.addListener(callback);
  // Do NOT call mq._unmount() on cleanup — the instance is shared via _mqCache
  // and must persist for the process lifetime.
  return () => {
    mq.removeListener(callback);
  };
}

export const useMediaQuery = (mediaQueryString: string) => {
  const stableSubscribe = useCallback(
    (callback: () => void) => subscribe(mediaQueryString, callback),
    [mediaQueryString]
  );

  return useSyncExternalStore(
    stableSubscribe,
    () => getSnapshot(mediaQueryString),
    // Server snapshot: always false — matches initial SSR render, no hydration mismatch
    () => false
  );
};

// Example: useMediaQuery('(min-width: 48rem)')

/** @internal — test-only: reset the module-level warn-once flag between test runs. */
export const __resetWarnFlagForTesting = () => {
  _warnedNoMatchMedia = false;
};

/** @internal — test-only: clear the MQ instance cache between test runs. */
export const __resetMQCacheForTesting = () => {
  _mqCache.clear();
};
