/**
 * Configuration store for react-native-small-ui.
 *
 * Extracted from smallUI.tsx so the ./utils entry point (useBreakPointValue)
 * can import the store without triggering the auto-init side effect that lives
 * in smallUI.tsx.
 */
import { create } from 'zustand';
import { type BreakPoints, defaultBreakPoints } from './breakpoints';

/**
 * A map of custom platform names to predicate functions.
 * Each predicate returns true when that platform is active.
 */
export type PlatformRegistry = Record<string, () => boolean>;

/**
 * A map of custom color mode names to boolean flags.
 * Each key becomes a valid `_<key>` style prop.
 */
export type ColorModeRegistry = Record<string, boolean>;

/** Library configuration options. */
export type InitConfig = {
  breakPoints?: BreakPoints | false;
  platforms?: PlatformRegistry;
  colorModes?: ColorModeRegistry;
};

export const defaultConfig: InitConfig = {
  breakPoints: defaultBreakPoints,
};

export const _useSmallUIStore = create<{
  init: boolean;
  config: InitConfig;
}>(() => ({
  init: false,
  config: defaultConfig,
}));

/**
 * Configure library options. Call at module level before your app renders.
 * Safe to call multiple times — options are merged.
 *
 * @example
 * configure({ breakPoints: { sm: 600, md: 900, lg: 1200 } });
 */
export function configure(config: InitConfig): void {
  const current = _useSmallUIStore.getState().config;
  _useSmallUIStore.setState({ config: { ...current, ...config } });
}
