export interface MediaQueryListEvent {
  matches: boolean;
  media: string;
}

export interface NativeMQL {
  matches: boolean;
  media: string;
  addListener(listener: (e: MediaQueryListEvent) => void): void;
  removeListener(listener: (e: MediaQueryListEvent) => void): void;
  _unmount?(): void;
}
