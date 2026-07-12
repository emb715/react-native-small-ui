/**
 * Auto-initialization lifecycle for react-native-small-ui.
 *
 * Handles Appearance listener registration on module import and provides
 * teardown for test and HMR scenarios.
 *
 * Consumers:
 *   - smallUI.tsx calls _autoInit() at module bottom
 *   - testing.tsx imports teardownSmallUI for the /testing public API
 */

import { colorSchemeListener } from './hooks/useColorMode/useColorMode';
import { _useSmallUIStore, defaultConfig } from './config.store';

let _autoInitListenerHandle: ReturnType<typeof colorSchemeListener> | null =
  null;

/**
 * Registers the Appearance color scheme listener and marks the store as initialized.
 * Called once at module eval time by smallUI.tsx. No-ops if already initialized.
 */
export function _autoInit(): void {
  if (_useSmallUIStore.getState().init) return;
  _autoInitListenerHandle = colorSchemeListener();
  _useSmallUIStore.setState({ init: true, config: defaultConfig });
}

/**
 * Remove the Appearance listener and reset the store to pre-init state.
 * Not part of the public consumer API — exported for use by testing.tsx.
 */
export function teardownSmallUI(): void {
  _autoInitListenerHandle?.remove();
  _autoInitListenerHandle = null;
  _useSmallUIStore.setState({ init: false, config: defaultConfig });
}
