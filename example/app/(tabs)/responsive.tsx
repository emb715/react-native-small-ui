import { NavigationGrid } from '@/src/components';
import type { NavItem } from '@/src/components';

const ITEMS: NavItem[] = [
  {
    label: 'Breakpoint Value',
    description: 'useBreakPointValue — responsive values from window width',
    route: '/showcase/breakpoint-value',
    api: 'useBreakPointValue',
  },
  {
    label: 'Media Query',
    description: 'useMediaQuery — CSS-like query matching, returns boolean',
    route: '/showcase/media-query',
    api: 'useMediaQuery',
  },
  {
    label: 'Orientation',
    description: 'useOrientation — portrait / landscape, reactive to rotation',
    route: '/showcase/orientation',
    api: 'useOrientation',
  },
];

export default function ResponsiveScreen() {
  return <NavigationGrid items={ITEMS} />;
}
