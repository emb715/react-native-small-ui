import { create } from 'zustand';

/**
 * Stores the currently active custom color mode name, or null when none
 * is active. Custom modes are app-managed (not OS-driven) — they layer on
 * top of the built-in light/dark system rather than replacing it.
 *
 * Updated via setCustomColorMode() / clearCustomColorMode().
 * Read reactively in createComponent to apply _<key> style props.
 */
type CustomColorModeState = {
  activeMode: string | null;
};

const initialState: CustomColorModeState = {
  activeMode: null,
};

export const useCustomColorModeStore = create<CustomColorModeState>(
  () => initialState
);
