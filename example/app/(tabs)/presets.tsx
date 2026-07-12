import { NavigationGrid } from '@/src/components';
import type { NavItem } from '@/src/components';

const ITEMS: NavItem[] = [
  {
    label: 'Presets Catalog',
    description:
      'elevation, shadow, border, text, layout, inset — visual catalog',
    route: '/showcase/presets',
    api: 'elevation · shadow · border · layout',
  },
  {
    label: 'Color Utils',
    description:
      'darken, lighten, mix, toRgba, getContrastRatio, getHexAlpha, getStatusBarStyle',
    route: '/showcase/color-utils',
    api: 'ColorUtils · getStatusBarStyle · useColorModeValue',
  },
];

export default function PresetsScreen() {
  return <NavigationGrid items={ITEMS} />;
}
