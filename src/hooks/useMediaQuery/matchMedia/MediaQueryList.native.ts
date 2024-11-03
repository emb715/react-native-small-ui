import mediaQuery from 'css-mediaquery';
import { Dimensions, type ScaledSize } from 'react-native';
import {
  getDefaultOrientation,
  getOrientation,
  type Orientation,
} from '../../useOrientation';
import type { MediaQueryListEvent } from './mediaQuery.types';

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

  private orientation: Orientation = getDefaultOrientation();

  private unsubscribe: Subscription;

  private mediaQueryString: string;

  constructor(private query: string) {
    this.mediaQueryString = query;

    (() => {
      try {
        const orientation = getDefaultOrientation();
        this.updateListeners({ orientation });
      } catch {}
    })();

    this.unsubscribe = Dimensions.addEventListener('change', this.resize);
  }

  private resize = (data: { window: ScaledSize; screen: ScaledSize }) => {
    const orientation = getOrientation(data.screen.width, data.screen.height);
    this.updateListeners({ orientation });
  };

  // TODO: find an automatic interface for unmounting
  // destroy() {
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
    return mediaQuery.match(this.query, {
      'orientation':
        this.orientation === 'landscape' ? 'landscape' : 'portrait',
      ...windowDimensions,
      'device-width': windowDimensions.width,
      'device-height': windowDimensions.height,
    });
  }

  private updateListeners({ orientation }: { orientation: Orientation }) {
    this.orientation = orientation;
    this.listeners.forEach((listener) => {
      listener({
        matches: this.matches,
        media: this.mediaQueryString,
      });
    });
  }

  public get media(): string {
    return this.mediaQueryString;
  }
}
