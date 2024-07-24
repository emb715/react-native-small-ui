import { getContrastMode } from './utils.colors';

export function getStatusBarStyle(bgColor: string) {
  const contrast = getContrastMode(bgColor);
  return contrast === 'light' ? 'light-content' : 'dark-content';
}
