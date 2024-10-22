import MediaQueryList from './MediaQueryList.native';

declare global {
  interface Window {
    matchMedia: (media: string) => MediaQueryList;
  }
}
declare var window: Window & typeof globalThis;

if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) => new MediaQueryList(query);
}
