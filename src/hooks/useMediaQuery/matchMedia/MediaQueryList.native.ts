import { matchMediaQuery } from './matchMediaQuery';
import {
  Appearance,
  Dimensions,
  PixelRatio,
  type ScaledSize,
} from 'react-native';
import {
  getDefaultOrientation,
  getOrientation,
  type Orientation,
} from '../../useOrientation';
import type { MediaQueryListEvent } from './mediaQuery.types';

// Minimal DOM-compatible type aliases — avoids requiring lib.dom in the build tsconfig.
// These match only the subset of the DOM interfaces this class actually implements.
type DOMMediaQueryList = { onchange: ((ev: Event) => unknown) | null };
type DOMMediaQueryListEvent = Event;

type Subscription = {
  /**
   * A method to unsubscribe the listener.
   */
  remove: () => void;
};

type Listener = (context: MediaQueryListEvent) => any;

/**
 * A pseudo implementation of MediaQueryList
 * https://www.w3.org/TR/css3-mediaqueries/
 */
export default class MediaQueryList /* extends MediaQueryList */ {
  private listeners: Listener[] = [];

  private unsubscribe: Subscription;

  constructor(private query: string) {
    (() => {
      try {
        const orientation = getDefaultOrientation();
        this.updateListeners({ orientation });
        /* istanbul ignore next */
      } catch {}
    })();

    this.unsubscribe = Dimensions.addEventListener('change', this.resize);
  }

  private resize = (data: { window: ScaledSize; screen: ScaledSize }) => {
    const orientation = getOrientation(data.screen.width, data.screen.height);
    this.updateListeners({ orientation });
  };

  _unmount() {
    if (this.unsubscribe) {
      this.unsubscribe.remove();
    }
  }

  public addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: Listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) this.listeners.splice(index, 1);
  }

  public get matches(): boolean {
    const windowDimensions = Dimensions.get('window');
    const orientation: 'landscape' | 'portrait' =
      windowDimensions.width > windowDimensions.height
        ? 'landscape'
        : 'portrait';
    const colorScheme = Appearance.getColorScheme() ?? 'light';
    return matchMediaQuery(this.query, {
      orientation,
      'width': windowDimensions.width,
      'height': windowDimensions.height,
      'device-width': windowDimensions.width,
      'device-height': windowDimensions.height,
      'device-pixel-ratio': PixelRatio.get(),
      'color-scheme': colorScheme === 'dark' ? 'dark' : 'light',
    });
  }

  /* istanbul ignore next */
  private updateListeners(_: { orientation: Orientation }) {
    this.listeners.forEach((listener) => {
      listener({
        matches: this.matches,
        media: this.query,
      });
    });
  }

  public get media(): string {
    return this.query;
  }

  // --- DOM MediaQueryList compatibility stubs ---
  // Required to satisfy the structural MediaQueryList contract from lib.dom.d.ts (pulled in by
  // @types/react-native). addListener/removeListener is the actual native API; these stubs are
  // browser-only and never called at runtime.
  // DOM aliases defined above the class to avoid shadowing by the class name.
  onchange:
    | ((this: DOMMediaQueryList, ev: DOMMediaQueryListEvent) => any)
    | null = null;

  /* istanbul ignore next */
  addEventListener(
    _type: string,
    _listener: unknown,
    _options?: unknown
  ): void {}

  /* istanbul ignore next */
  removeEventListener(
    _type: string,
    _listener: unknown,
    _options?: unknown
  ): void {}

  /* istanbul ignore next */
  dispatchEvent(_event: Event): boolean {
    return false;
  }
}
