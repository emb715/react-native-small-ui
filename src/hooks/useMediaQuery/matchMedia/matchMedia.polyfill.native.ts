import MediaQueryList from './MediaQueryList.native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare var window: any;

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => new MediaQueryList(query);
}
