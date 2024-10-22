import './matchMedia/matchMedia.polyfill';

import { useCallback, useEffect, useState } from 'react';
import type { MediaQueryListEvent } from './matchMedia/mediaQuery.types';

declare var window: Window & typeof globalThis;

export const useMediaQuery = (mediaQueryString: string) => {
  const supportsMatchMedia =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  if (!supportsMatchMedia) {
    console.warn('useMediaQuery: window.matchMedia not supported.');
  }

  const [matches, setMatches] = useState(() =>
    supportsMatchMedia ? window.matchMedia(mediaQueryString).matches : false
  );

  const onChange = useCallback((evt: MediaQueryListEvent) => {
    setMatches(evt.matches);
  }, []);

  useEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    const mq = window.matchMedia(mediaQueryString);
    mq.addListener(onChange);
    return () => {
      mq.removeListener(onChange);
    };
  }, [supportsMatchMedia, mediaQueryString, onChange]);

  return matches;
};

// Example: useMediaQuery('(min-width: 768px)');
