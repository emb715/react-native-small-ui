import { useMediaQuery } from '../useMediaQuery/useMediaQuery';
import type { Orientation } from './useOrientation';

export const useOrientation = (): Orientation => {
  const matchLandscape = useMediaQuery('(orientation: landscape)');

  return matchLandscape ? 'landscape' : 'portrait';
};
