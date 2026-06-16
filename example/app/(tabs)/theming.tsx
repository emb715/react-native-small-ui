import { NavigationGrid } from '@/src/components';
import type { NavItem } from '@/src/components';

const ITEMS: NavItem[] = [
  {
    label: 'Color Mode',
    description:
      'useColorMode, toggleColorScheme, setColorScheme — control panel',
    route: '/showcase/colormode',
    api: 'useColorMode · toggleColorScheme',
  },
  {
    label: 'Custom Color Modes',
    description:
      'configure({ colorModes }) + setCustomColorMode — sepia / high-contrast',
    route: '/showcase/custom-colormode',
    api: 'setCustomColorMode',
  },
  {
    label: 'configure()',
    description: 'Custom platform predicates — _tablet, _compact style props',
    route: '/showcase/configure',
    api: 'configure',
  },
  {
    label: 'Themed Component',
    description: 'createThemedComponent + useTheme — profile driven by tokens',
    route: '/showcase/themed-component',
    api: 'createThemedComponent',
  },
  {
    label: 'Multi-Theme',
    description: 'registerTheme + setTheme + useThemeName — runtime switcher',
    route: '/showcase/multi-theme',
    api: 'registerTheme · setTheme',
  },
];

export default function ThemingScreen() {
  return <NavigationGrid items={ITEMS} />;
}
