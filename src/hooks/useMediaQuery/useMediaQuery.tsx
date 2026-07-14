import './matchMedia/matchMedia.polyfill';

import { useSyncExternalStore } from 'react';
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

function getSnapshot(mediaQueryString: string): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }
  return (window.matchMedia(mediaQueryString) as unknown as NativeMQL).matches;
}

function subscribe(mediaQueryString: string, callback: () => void): () => void {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    if (!_warnedNoMatchMedia) {
      _warnedNoMatchMedia = true;
      console.warn('useMediaQuery: window.matchMedia not supported.');
    }
    return () => {};
  }
  const mq = window.matchMedia(mediaQueryString) as unknown as NativeMQL;
  mq.addListener(callback);
  return () => {
    mq.removeListener(callback);
    mq._unmount?.();
  };
}

export const useMediaQuery = (mediaQueryString: string) => {
  return useSyncExternalStore(
    (callback) => subscribe(mediaQueryString, callback),
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
