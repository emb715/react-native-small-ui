/**
 * React Native Small UI - Core
 *
 * Minimal core utilities for component creation without heavy dependencies.
 *
 * For additional features, import from:
 * - 'react-native-small-ui/colormode' - Color mode utilities
 * - 'react-native-small-ui/theme' - Optional theming system
 * - 'react-native-small-ui/utils' - Responsive utilities
 */

// Core component creation
export { createComponent, createComponentGroup, configure } from './smallUI';
export type {
  SmallUIComponent,
  PlatformRegistry,
  ColorModeRegistry,
  SlotMap,
  ComponentGroupInput,
  ComponentGroup,
  ComponentMeta,
} from './smallUI';
export type {
  ComponentStyle,
  ComponentConfig,
  VariantConfig,
  VariantProps,
  CompoundVariant,
} from './smallUI.types';

// Lightweight helper utilities
export { getStatusBarStyle, cs, getResolvedStyles } from './utils/helpers';
