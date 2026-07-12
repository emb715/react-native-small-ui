import './matchMedia/matchMedia.polyfill';

import { useCallback, useEffect, useState } from 'react';
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

export const useMediaQuery = (mediaQueryString: string) => {
  const supportsMatchMedia =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const [matches, setMatches] = useState(false);

  /* istanbul ignore next */
  const onChange = useCallback((evt: MediaQueryListEvent) => {
    setMatches(evt.matches);
  }, []);

  useEffect(() => {
    if (!supportsMatchMedia) {
      if (!_warnedNoMatchMedia) {
        _warnedNoMatchMedia = true;
        console.warn('useMediaQuery: window.matchMedia not supported.');
      }
      return;
    }

    const mq = window.matchMedia(mediaQueryString) as unknown as NativeMQL;
    setMatches(mq.matches); // sync initial value from the single instance
    mq.addListener(onChange);
    return () => {
      mq.removeListener(onChange);
      mq._unmount?.(); // ← removes the Dimensions subscription on native
    };
  }, [supportsMatchMedia, mediaQueryString, onChange]);

  return matches;
};

// Example: useMediaQuery('(min-width: 48rem)')

/** @internal — test-only: reset the module-level warn-once flag between test runs. */
export const __resetWarnFlagForTesting = () => {
  _warnedNoMatchMedia = false;
};
