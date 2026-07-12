import { NavigationGrid } from '@/src/components';
import type { NavItem } from '@/src/components';

const ITEMS: NavItem[] = [
  {
    label: 'Social Feed',
    description: 'Card slots · Badge variants · Button actions',
    route: '/kitchen-sink/feed',
    api: '.withSlots() · Badge · Button',
  },
  {
    label: 'Registration Form',
    description: 'createComponentGroup · validation states · status variants',
    route: '/kitchen-sink/form',
    api: 'createComponentGroup · variants',
  },
  {
    label: 'User Profile',
    description: 'useTheme tokens · stats layout · settings rows',
    route: '/kitchen-sink/profile',
    api: 'useTheme · createComponentGroup',
  },
];

export default function KitchenSinkScreen() {
  return <NavigationGrid items={ITEMS} />;
}
