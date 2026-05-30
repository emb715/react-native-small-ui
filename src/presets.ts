/**
 * react-native-small-ui/presets
 *
 * Named plain style objects for common cross-platform patterns.
 * No new API, no registration, no magic — just spread them into any
 * `createComponent` call or RN StyleSheet.
 *
 * Every preset is a plain object so it works with both:
 *   - createComponent(View, { ...elevation.sm, borderRadius: 8 })
 *   - StyleSheet.create({ card: { ...elevation.sm } })
 *   - cs(elevation.md, { borderRadius: 4 })
 *
 * Community-extensible by nature: the presets are plain exports, not a
 * registry. Add your own by creating a local file that re-exports and extends.
 *
 * @example
 * import { elevation, shadow, inset } from 'react-native-small-ui/presets';
 * import { createComponent } from 'react-native-small-ui';
 * import { View } from 'react-native';
 *
 * const Card = createComponent(View, {
 *   borderRadius: 12,
 *   ...elevation.md,
 * });
 */

// ---------------------------------------------------------------------------
// elevation — Android material elevation (also provides iOS shadow fallback)
// ---------------------------------------------------------------------------

/**
 * Android `elevation` levels with corresponding iOS shadow equivalents.
 * Uses `_ios` and `_android` variant keys so createComponent applies each
 * to the correct platform automatically.
 *
 * Levels follow Material Design elevation nomenclature:
 * - none: 0 — flush, no shadow
 * - xs:   2 — subtle lift (chips, flat buttons)
 * - sm:   4 — cards at rest
 * - md:   8 — cards on hover / raised buttons
 * - lg:   16 — dialogs, pickers
 * - xl:   24 — drawers, modals
 */
export const elevation = {
  none: {
    _ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    _android: {
      elevation: 0,
    },
  },

  xs: {
    _ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    _android: {
      elevation: 2,
    },
  },

  sm: {
    _ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    _android: {
      elevation: 4,
    },
  },

  md: {
    _ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    _android: {
      elevation: 8,
    },
  },

  lg: {
    _ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    _android: {
      elevation: 16,
    },
  },

  xl: {
    _ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    _android: {
      elevation: 24,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// shadow — iOS-only shadow presets (plain style props, no platform guards)
// iOS natively supports `shadow*` props; on Android they're ignored.
// Use `elevation` above for cross-platform behaviour.
// ---------------------------------------------------------------------------

/**
 * iOS-native shadow presets. These props are silently ignored on Android —
 * safe to spread anywhere without conditional logic.
 *
 * Useful when you want more granular iOS shadow control than the cross-platform
 * `elevation` presets provide (e.g. custom shadow color, inset offset).
 */
export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  pronounced: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },

  inset: {
    // Simulates a pressed/inset look on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
} as const;

// ---------------------------------------------------------------------------
// inset — safe area padding presets
// Pairs with react-native-safe-area-context's useSafeAreaInsets().
// Without that library, falls back to a fixed opinionated padding.
// ---------------------------------------------------------------------------

/**
 * Safe-area-aware padding presets.
 *
 * These are static values — for dynamic safe area insets, use
 * `useSafeAreaInsets()` from react-native-safe-area-context.
 *
 * These presets are useful for:
 * - Screens without the safe area library
 * - Fallback values in test environments
 * - Layouts that need consistent minimum padding
 */
export const inset = {
  /** No padding — use when the parent already handles safe area. */
  none: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },

  /** Conservative safe area padding (fits most modern devices). */
  safe: {
    paddingTop: 44, // Status bar + notch (iPhone X+)
    paddingBottom: 34, // Home indicator (iPhone X+)
    paddingLeft: 0,
    paddingRight: 0,
  },

  /** Horizontal safe area padding for edge-to-edge layouts. */
  safeHorizontal: {
    paddingLeft: 16,
    paddingRight: 16,
  },

  /** Full screen padding for modal / sheet presentations. */
  modal: {
    paddingTop: 12,
    paddingBottom: 34,
    paddingLeft: 0,
    paddingRight: 0,
  },
} as const;

// ---------------------------------------------------------------------------
// text — cross-platform text rendering presets
// ---------------------------------------------------------------------------

/**
 * Text rendering presets that normalize cross-platform typography quirks.
 *
 * Android renders text differently from iOS in several ways:
 * - Line height calculation
 * - Font kerning
 * - Letter spacing
 *
 * These presets encode sensible defaults to minimize visual inconsistency.
 */
export const text = {
  /**
   * Prevents text from scaling with the user's system font size preference.
   * Use sparingly — respecting accessibility settings is usually preferable.
   */
  fixed: {
    allowFontScaling: false,
  },

  /**
   * Enables high-quality text rendering on both platforms.
   * includeFontPadding:false on Android removes extra bottom padding that
   * causes misalignment with iOS.
   */
  crisp: {
    _android: {
      includeFontPadding: false,
    },
  },

  /**
   * Combines crisp rendering with a capped maximum font scale.
   * Allows accessibility scaling up to 1.5x but prevents extreme sizes
   * from breaking layouts.
   */
  accessible: {
    maxFontSizeMultiplier: 1.5,
    _android: {
      includeFontPadding: false,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// layout — common flex layout presets
// ---------------------------------------------------------------------------

/**
 * Common flex layout patterns. These are plain ViewStyle objects —
 * no platform guards needed (flex works the same on iOS/Android/web).
 */
export const layout = {
  /** Full-width, full-height flex container. */
  fill: {
    flex: 1,
  },

  /** Centered content in both axes. */
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  /** Horizontal row, vertically centered. */
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  /** Horizontal row, space between children. */
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  /** Vertical column, full width. */
  column: {
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
  },

  /** Absolute fill — covers entire parent. */
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
} as const;

// ---------------------------------------------------------------------------
// border — common border presets
// ---------------------------------------------------------------------------

/**
 * Common border patterns. Pairs well with `_light` / `_dark` overrides
 * for color-mode-aware borders.
 *
 * @example
 * const Divider = createComponent(View, {
 *   ...border.hairline,
 *   _light: { borderColor: '#e5e5e5' },
 *   _dark:  { borderColor: '#333' },
 * });
 */
export const border = {
  /** Platform-appropriate hairline border (0.5px on retina, 1px elsewhere). */
  hairline: {
    borderWidth: 0.5,
  },

  thin: {
    borderWidth: 1,
  },

  medium: {
    borderWidth: 2,
  },

  thick: {
    borderWidth: 4,
  },

  /** Full pill shape — large enough borderRadius for any height. */
  pill: {
    borderRadius: 9999,
  },
} as const;
