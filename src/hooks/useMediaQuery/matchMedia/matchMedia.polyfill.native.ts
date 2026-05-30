import MediaQueryList from './MediaQueryList.native';

// The DOM Window interface already declares matchMedia; no augmentation needed.
// Cast is required because the local class is a structural subset of the DOM MediaQueryList
// interface (it lacks browser-only internals) and TypeScript cannot verify the `this` context.
declare var window: Window & typeof globalThis;

if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) =>
    new MediaQueryList(query) as unknown as globalThis.MediaQueryList;
}
