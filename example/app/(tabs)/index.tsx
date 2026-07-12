import { NavigationGrid } from '@/src/components';
import type { NavItem } from '@/src/components';

const ITEMS: NavItem[] = [
  {
    label: 'Static Styles',
    description: 'createComponent with _light, _dark, _ios, _android, _web',
    route: '/showcase/static-styles',
    api: 'createComponent',
  },
  {
    label: 'Variants',
    description: 'variants, compoundVariants, defaultVariants — Button gallery',
    route: '/showcase/variants',
    api: 'variants · compoundVariants',
  },
  {
    label: '.extend()',
    description: 'Style composition — BaseCard → ElevatedCard → FeaturedCard',
    route: '/showcase/extend',
    api: '.extend()',
  },
  {
    label: '.withSlots()',
    description: 'Compound component pattern — Card.Header / Body / Footer',
    route: '/showcase/slots',
    api: '.withSlots()',
  },
  {
    label: 'Component Group',
    description: 'Sibling context sharing — Form: Label + Input + Hint + Error',
    route: '/showcase/group',
    api: 'createComponentGroup',
  },
  {
    label: 'ctx Factory',
    description:
      'createComponent with a function — ctx.colorMode + ctx.breakpoint()',
    route: '/showcase/ctx-factory',
    api: 'ctx.colorMode · ctx.breakpoint',
  },
  {
    label: 'cs() Helper',
    description:
      'Merge style objects with falsy filtering — the RN equivalent of cn()',
    route: '/showcase/cs-helper',
    api: 'cs()',
  },
  {
    label: 'createPressable',
    description:
      '_pressed + _hovered state styles — Pressable with full createComponent support',
    route: '/showcase/pressable',
    api: 'createPressable · _pressed · _hovered',
  },
];

export default function ComponentsScreen() {
  return <NavigationGrid items={ITEMS} />;
}
