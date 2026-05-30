import React, {
  type ComponentPropsWithRef,
  type ComponentType,
  useMemo,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import { create } from 'zustand';

import {
  colorSchemeListener,
  useColorModeValue,
  useCustomColorModeStore,
} from './hooks/useColorMode/useColorMode';
import { useColorModeStore } from './hooks/useColorMode/colorMode.store';
import { useTheme } from './hooks/useTheme/useTheme';
import { useMediaQuery } from './hooks/useMediaQuery/useMediaQuery';
import {
  StylePropsLookUp,
  type LookUpPropsComponentType,
} from './utils/utils.style-props';
import { getResolvedStyles } from './utils/helpers';
import type {
  BreakPointKey,
  ComponentConfig,
  ComponentStyle,
  CompoundVariant,
  ExtendedProps,
  StyleCtx,
  VariantConfig,
  VariantProps,
} from './smallUI.types';

const defaultBreakPoints = {
  'default': 0, // 100%
  'xs': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

const defaultConfig = {
  breakPoints: defaultBreakPoints,
} satisfies InitConfig;

/*****************************
 * EMB Small UI
 *****************************/

export const _useSmallUIStore = create<{
  init: boolean;
  config: InitConfig;
}>(() => ({
  init: false,
  config: defaultConfig,
}));

/**
 * A map of custom platform names to predicate functions.
 * Each predicate is evaluated at render time — if it returns true,
 * the corresponding `_<key>` style prop is applied.
 *
 * @example
 * configure({
 *   platforms: {
 *     tablet: () => Dimensions.get('window').width >= 768,
 *     tv: () => Platform.isTV,
 *   },
 * });
 *
 * // Then in createComponent:
 * const Card = createComponent(View, {
 *   padding: 12,
 *   _tablet: { padding: 24 },
 *   _tv: { padding: 40 },
 * });
 */
export type PlatformRegistry = Record<string, () => boolean>;

/**
 * A map of custom color mode names.
 * Each key becomes a valid `_<key>` style prop on any createComponent output.
 * Activate a mode via setCustomColorMode(key); clear with clearCustomColorMode().
 * Unlike built-in light/dark, custom modes are fully app-managed — no OS delegation.
 *
 * @example
 * configure({
 *   colorModes: {
 *     highContrast: true,  // registered — activated via setCustomColorMode('highContrast')
 *     sepia: true,
 *   },
 * });
 */
export type ColorModeRegistry = Record<string, true>;

type InitConfig = {
  breakPoints?: BreakPoints | false;
  /** Custom platform predicates. Keys become valid `_<key>` style props. */
  platforms?: PlatformRegistry;
  /**
   * Custom color mode names. Each key becomes a valid `_<key>` style prop.
   * Activate via setCustomColorMode(key) from 'react-native-small-ui/colormode'.
   */
  colorModes?: ColorModeRegistry;
};

export type BreakPoints = {
  'default': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
};

export function _initSmallUI(config: InitConfig = defaultConfig) {
  try {
    // check init
    if (_useSmallUIStore.getState().init === true) {
      console.warn('SmallUI already initiated.');
      return;
    }
    // Listener to set color mode
    const appearanceListener = colorSchemeListener();
    // TODO: validate config
    // ...
    // After all
    _useSmallUIStore.setState({ init: true, config });

    return () => {
      appearanceListener.remove();
    };
  } catch (error) {
    console.error('_initSmallUI.error:', error);
    return;
  }
}

/**
 * Configure library options. Call at module level before your app renders.
 * Safe to call multiple times — options are merged.
 *
 * @example
 * configure({ breakPoints: { sm: 600, md: 900, lg: 1200 } });
 */
export function configure(config: InitConfig) {
  const current = _useSmallUIStore.getState().config;
  _useSmallUIStore.setState({ config: { ...current, ...config } });
}

/**
 * COMPONENT CREATION
 ***********************/

const DEBUG_MODE = false;

// ---------------------------------------------------------------------------
// Breakpoint query helpers
// ---------------------------------------------------------------------------

/**
 * The ordered list of breakpoint keys, from largest to smallest.
 * Resolution walks this list and returns the first key whose pixel value
 * the current screen width meets or exceeds.
 */
const BREAKPOINT_ORDER: BreakPointKey[] = [
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  'default',
];

/**
 * Build the media query string for a given breakpoint key using the
 * configured pixel values.
 */
function buildMediaQuery(key: BreakPointKey, breakPoints: BreakPoints): string {
  const px = breakPoints[key];
  if (px === 0) return '(min-width: 0px)'; // 'default' — always matches
  return `(min-width: ${px}px)`;
}

/**
 * Dry-run the style factory with a recording proxy to discover which
 * breakpoint keys it reads. Returns a stable frozen array of keys.
 * This runs once at createComponent call time (module level), never during
 * render — so hook counts derived from it are always stable.
 */
function discoverBreakpoints(
  styleFn: (ctx: StyleCtx) => unknown
): BreakPointKey[] {
  const discovered = new Set<BreakPointKey>();

  const recordingCtx: StyleCtx = {
    colorMode: 'light',
    breakpoint: (values) => {
      (Object.keys(values) as BreakPointKey[]).forEach((k) =>
        discovered.add(k)
      );
      return undefined;
    },
  };

  try {
    styleFn(recordingCtx);
  } catch {
    // Style functions may access values that throw with dummy ctx — ignore.
  }

  // Filter to only keys that appear in BREAKPOINT_ORDER (valid keys),
  // preserving resolution order (largest first).
  return BREAKPOINT_ORDER.filter((k) => discovered.has(k));
}

/**
 * Given the discovered breakpoint keys and their live match states,
 * resolve a values map to the matching value.
 * Walks from largest to smallest and returns the first match.
 */
function resolveBreakpoint<T>(
  values: Partial<Record<BreakPointKey, T>>,
  matchStates: Record<BreakPointKey, boolean>
): T | undefined {
  for (const key of BREAKPOINT_ORDER) {
    if (key in values && matchStates[key]) {
      return values[key];
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// useBreakpointMatches — stable hook, count fixed at definition time
// ---------------------------------------------------------------------------

/**
 * Calls useMediaQuery for each discovered breakpoint key.
 * The number of calls is fixed at createComponent definition time so
 * hook ordering rules are never violated.
 *
 * Returns a Record<BreakPointKey, boolean> of current match states.
 *
 * IMPORTANT: This function must only be called with a stable `orderedKeys`
 * array (same reference and length every render) — guaranteed because it
 * comes from the frozen discoverBreakpoints() result stored in the closure.
 */
function useBreakpointMatches(
  orderedKeys: BreakPointKey[],
  breakPoints: BreakPoints
): Record<BreakPointKey, boolean> {
  // Each element is a useMediaQuery call. The array length never changes
  // (fixed at definition time), so the hook call count is stable.
  // useMediaQuery is a hook called inside map(). Hook count is stable because
  // orderedKeys length is fixed at createComponent definition time — safe.
  const matches = orderedKeys.map((key) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMediaQuery(buildMediaQuery(key, breakPoints))
  );

  const result = {} as Record<BreakPointKey, boolean>;
  orderedKeys.forEach((key, i) => {
    result[key] = matches[i] ?? false;
  });
  return result;
}

// ---------------------------------------------------------------------------
// Variant resolution helpers
// ---------------------------------------------------------------------------

/**
 * Merges two ExtendedProps objects shallowly.
 * Later values win on key conflicts.
 */
function mergeStyles<TProps extends { style?: unknown }>(
  a: ExtendedProps<TProps> | undefined,
  b: ExtendedProps<TProps> | undefined
): ExtendedProps<TProps> {
  if (!a && !b) return {} as ExtendedProps<TProps>;
  if (!a) return b as ExtendedProps<TProps>;
  if (!b) return a;
  return { ...a, ...b } as ExtendedProps<TProps>;
}

/**
 * Resolves the combined style from a variant config given the active
 * variant values. Merges: defaultVariants → prop variants → compound variants.
 *
 * Resolution order (later wins):
 *   1. defaultVariants
 *   2. prop-supplied variant values
 *   3. compoundVariants (all matching entries, in declaration order)
 */
function resolveVariantStyles<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps>,
>(
  config: ComponentConfig<TProps, V>,
  variantProps: Partial<VariantProps<V>>
): ExtendedProps<TProps> {
  const { variants, compoundVariants, defaultVariants } = config;
  let merged = {} as ExtendedProps<TProps>;

  if (!variants) return merged;

  // Active values = defaultVariants overridden by explicitly supplied props.
  const activeValues: Partial<VariantProps<V>> = {
    ...(defaultVariants ?? {}),
    ...variantProps,
  };

  // 1. Individual variant styles.
  for (const groupKey of Object.keys(variants) as (keyof V)[]) {
    const activeValue = activeValues[groupKey];
    if (activeValue === undefined) continue;
    const groupStyles = variants[groupKey];
    const style = groupStyles?.[activeValue as string];
    if (style) {
      merged = mergeStyles<TProps>(merged, style);
    }
  }

  // 2. Compound variant styles — all matching entries applied in order.
  if (compoundVariants) {
    for (const compound of compoundVariants as CompoundVariant<TProps, V>[]) {
      if (matchesCompound(compound.variants, activeValues)) {
        merged = mergeStyles<TProps>(merged, compound.style);
      }
    }
  }

  return merged;
}

/**
 * Returns true when every key specified in `target` matches the
 * corresponding value in `active`.
 */
function matchesCompound<V extends Record<string, Record<string, unknown>>>(
  target: Partial<VariantProps<V>>,
  active: Partial<VariantProps<V>>
): boolean {
  for (const key of Object.keys(target) as (keyof V)[]) {
    if (target[key] !== active[key]) return false;
  }
  return true;
}

/**
 * Extracts variant prop keys from props, returning them separately from
 * the rest. Variant keys are determined by the keys of the variants config.
 */
function extractVariantProps<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps>,
>(
  props: Record<string, unknown>,
  variantKeys: string[]
): {
  variantProps: Partial<VariantProps<V>>;
  remainingProps: Record<string, unknown>;
} {
  const variantProps: Partial<VariantProps<V>> = {};
  const remainingProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (variantKeys.includes(key)) {
      (variantProps as Record<string, unknown>)[key] = value;
    } else {
      remainingProps[key] = value;
    }
  }

  return { variantProps, remainingProps };
}

// ---------------------------------------------------------------------------
// createThemedComponent
// ---------------------------------------------------------------------------

export const createThemedComponent =
  <TProps extends { style?: unknown }>(
    Component: ComponentType<TProps>,
    themedStyles: (theme: unknown) => ComponentStyle<TProps>,
    defaultProps?: Exclude<TProps, 'style'>
  ) =>
  (
    props: TProps &
      ComponentPropsWithRef<typeof Component> &
      ExtendedProps<TProps>
  ) => {
    const theme = useTheme();
    const customized = themedStyles(theme);
    return createComponent(Component, customized, defaultProps)(props as any); // any: VariantProps<V> not needed here
  };

// ---------------------------------------------------------------------------
// The SmallUIComponent type — createComponent output with .extend()
// ---------------------------------------------------------------------------

/**
 * The component type returned by createComponent.
 * Extends a standard React component with an `.extend()` method for
 * ergonomic style composition.
 */
/**
 * When V is the open default (VariantConfig<TProps>), we don't want to add
 * an index signature to the props. This conditional type adds VariantProps<V>
 * only when V has been concretely specified (i.e. string keys are finite).
 */
type WithVariantProps<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps>,
> = string extends keyof V ? TProps : TProps & VariantProps<V>;

/** Map of slot names to component functions (SmallUIComponent instances) */
export type SlotMap = Record<string, (props: any) => React.ReactElement | null>; // any: slots accept heterogeneous prop types

/**
 * Optional metadata descriptor for a createComponent output.
 * Stored as `__meta` on the component — readable by tooling, DevTools,
 * and the future CLI scaffolder.
 *
 * @example
 * const Button = createComponent(
 *   TouchableOpacity,
 *   { borderRadius: 8 },
 *   undefined,
 *   { name: 'Button', description: 'Primary action button', tags: ['action'] }
 * );
 * console.log(Button.__meta.name); // 'Button'
 */
export type ComponentMeta = {
  /** Human-readable component name (for documentation / DevTools). */
  name?: string;
  /** Description of the component's purpose. */
  description?: string;
  /** Free-form tags for categorization (e.g. ['layout', 'card']). */
  tags?: string[];
  /** Any additional developer-defined metadata. */
  [key: string]: unknown;
};

export type SmallUIComponent<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps> = VariantConfig<TProps>,
> = ((
  props: WithVariantProps<TProps, V> &
    ComponentPropsWithRef<ComponentType<TProps>> &
    ExtendedProps<TProps>
) => React.ReactElement | null) & {
  /**
   * Create a new component that inherits this component's styles and merges
   * additional styles or variant config on top.
   *
   * @example
   * const Base = createComponent(View, { padding: 16 });
   * const Card = Base.extend({ borderRadius: 8, _light: { backgroundColor: '#fff' } });
   */
  extend: (
    stylesOrConfig: ComponentStyle<TProps> | ComponentConfig<TProps>
  ) => SmallUIComponent<TProps>;

  /**
   * Attach named sub-components as dot-notation slots. Slots share the same
   * reactive context (colorMode, breakpoints) with no extra setup.
   * Returns a new component with slots attached as static properties.
   *
   * @example
   * const Card = createComponent(View, { borderRadius: 8 })
   *   .withSlots({
   *     Header: createComponent(View, { padding: 16, borderBottomWidth: 1 }),
   *     Body:   createComponent(View, { padding: 16 }),
   *     Footer: createComponent(View, { padding: 12 }),
   *   });
   *
   * // Usage:
   * <Card>
   *   <Card.Header><Text>Title</Text></Card.Header>
   *   <Card.Body><Text>Content</Text></Card.Body>
   * </Card>
   */
  withSlots: <S extends SlotMap>(slots: S) => SmallUIComponent<TProps, V> & S;

  // ---------------------------------------------------------------------------
  // Metadata properties (#16 — Component Metadata & Self-Documentation)
  // ---------------------------------------------------------------------------

  /**
   * Optional metadata descriptor passed as the fourth argument to createComponent.
   * Readable by tooling, DevTools, CLI scaffolders. Undefined if no meta was passed.
   *
   * Zero runtime overhead — static property assignment, never read during render.
   */
  __meta: ComponentMeta | undefined;

  /**
   * Snapshot of the variant configuration keys for this component.
   * Shape: `{ [groupName]: string[] }` — maps each variant group to its possible values.
   * Undefined when the component has no variants.
   *
   * @example
   * const Button = createComponent(TouchableOpacity, {
   *   variants: { size: { sm: {}, md: {}, lg: {} } },
   * });
   * console.log(Button.__variants); // { size: ['sm', 'md', 'lg'] }
   */
  __variants: Record<string, string[]> | undefined;

  /**
   * Bound style resolver. Returns the fully resolved flat style object for
   * this component's base style definition given a context.
   * No rendering required — pure function.
   *
   * @example
   * const Box = createComponent(View, (ctx) => ({
   *   padding: ctx.breakpoint({ default: 8, md: 16 }),
   * }));
   *
   * const resolved = Box.__resolveStyles({ colorMode: 'dark', breakpointWidth: 800 });
   * // => { padding: 16 }
   */
  __resolveStyles: (ctx?: {
    colorMode?: 'light' | 'dark';
    breakpointWidth?: number;
    breakpoints?: Record<string, number>;
  }) => Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// createComponent — overloads
// ---------------------------------------------------------------------------

/**
 * Wraps any React Native component with enhanced styling capabilities.
 *
 * Accepts either:
 * - A plain style object (or ctx factory function) as the second argument
 * - A ComponentConfig object with `base`, `variants`, `compoundVariants`, `defaultVariants`
 *
 * ⚠️ Always create components OUTSIDE render functions.
 *
 * @example
 * // Static style object
 * const Box = createComponent(View, {
 *   padding: 16,
 *   _light: { backgroundColor: '#fff' },
 *   _dark: { backgroundColor: '#111' },
 * });
 *
 * @example
 * // Variant config
 * const Button = createComponent(TouchableOpacity, {
 *   base: { borderRadius: 8, alignItems: 'center' },
 *   variants: {
 *     size: {
 *       sm: { paddingVertical: 6, paddingHorizontal: 12 },
 *       md: { paddingVertical: 10, paddingHorizontal: 20 },
 *       lg: { paddingVertical: 14, paddingHorizontal: 28 },
 *     },
 *     intent: {
 *       primary: { _light: { backgroundColor: '#007AFF' }, _dark: { backgroundColor: '#0A84FF' } },
 *       danger:  { _light: { backgroundColor: '#e00c2c' }, _dark: { backgroundColor: '#be0a25' } },
 *     },
 *   },
 *   defaultVariants: { size: 'md', intent: 'primary' },
 * });
 *
 * // Usage — variant props are fully typed and autocompleted:
 * <Button size="lg" intent="danger" />
 */
export function createComponent<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps> = VariantConfig<TProps>,
>(
  Component: ComponentType<TProps>,
  styleOrConfig?: ComponentStyle<TProps> | ComponentConfig<TProps, V>,
  defaultProps?: Exclude<TProps, 'style'>,
  meta?: ComponentMeta
): SmallUIComponent<TProps, V> {
  // ------------------------------------------------------------------
  // Definition-time setup (runs once at module level, never per render)
  // ------------------------------------------------------------------

  // Determine if second arg is a ComponentConfig (has 'base' | 'variants' key)
  // or a legacy ComponentStyle (object or function).
  const isConfig =
    styleOrConfig !== null &&
    typeof styleOrConfig === 'object' &&
    !Array.isArray(styleOrConfig) &&
    ('base' in styleOrConfig ||
      'variants' in styleOrConfig ||
      'compoundVariants' in styleOrConfig ||
      'defaultVariants' in styleOrConfig);

  const config = isConfig
    ? (styleOrConfig as ComponentConfig<TProps, V>)
    : undefined;

  const baseStyle = isConfig
    ? config?.base
    : (styleOrConfig as ComponentStyle<TProps> | undefined);

  const variantKeys = config?.variants ? Object.keys(config.variants) : [];

  const isStyleFn = typeof baseStyle === 'function';

  // Discover which breakpoint keys the style function reads so we can
  // subscribe to exactly those media queries — and no others.
  const discoveredBreakpoints: BreakPointKey[] = isStyleFn
    ? discoverBreakpoints(baseStyle as (ctx: StyleCtx) => ExtendedProps<TProps>)
    : [];

  // The actual component function returned by the factory.
  const SmallUIComp = (
    props: TProps &
      ComponentPropsWithRef<typeof Component> &
      ExtendedProps<TProps> &
      VariantProps<V>
  ) => {
    const _defaultProps = defaultProps ?? {};

    // ----------------------------------------------------------------
    // Reactive subscriptions
    // ----------------------------------------------------------------

    // Subscribe to colorMode — fires only when light/dark changes.
    const colorMode = useColorModeStore((s) => s.colorMode);

    // Subscribe to active custom color mode — fires when setCustomColorMode is called.
    const activeCustomMode = useCustomColorModeStore((s) => s.activeMode);

    // Subscribe to breakpoint media queries.
    const cfgState = _useSmallUIStore.getState().config;
    const breakPoints =
      cfgState.breakPoints !== false && cfgState.breakPoints
        ? cfgState.breakPoints
        : defaultBreakPoints;

    const matchStates = useBreakpointMatches(
      discoveredBreakpoints,
      breakPoints
    );

    // ----------------------------------------------------------------
    // Resolve the base style definition
    // ----------------------------------------------------------------

    const ctx = useMemo<StyleCtx>(
      () => ({
        colorMode,
        breakpoint: <T,>(values: Partial<Record<BreakPointKey, T>>) =>
          resolveBreakpoint(values, matchStates),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [colorMode, ...discoveredBreakpoints.map((k) => matchStates[k])]
    );

    const resolvedBase: ExtendedProps<TProps> | undefined = isStyleFn
      ? (baseStyle as (ctx: StyleCtx) => ExtendedProps<TProps>)(ctx)
      : (baseStyle as ExtendedProps<TProps> | undefined);

    // ----------------------------------------------------------------
    // Extract variant props from component props
    // ----------------------------------------------------------------

    const { variantProps, remainingProps } = useMemo(
      () =>
        extractVariantProps<TProps, V>(
          props as Record<string, unknown>,
          variantKeys
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [props, variantKeys.join(',')]
    );

    // ----------------------------------------------------------------
    // Resolve variant styles
    // ----------------------------------------------------------------

    const resolvedVariantStyle = useMemo(
      () =>
        config
          ? resolveVariantStyles<TProps, V>(config, variantProps)
          : undefined,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [variantProps, config]
    );

    // ----------------------------------------------------------------
    // Merge: base → variants → direct props (direct always wins)
    // ----------------------------------------------------------------

    const mergedProps = Object.assign(
      {},
      resolvedBase,
      resolvedVariantStyle,
      remainingProps
    );

    const resolvedProps = resolvePropByType<TProps>(
      mergedProps as TProps,
      Component.displayName as LookUpPropsComponentType
    );

    DEBUG_MODE &&
      console.log(
        'LOG: > resolvedProps:',
        Component.displayName,
        resolvedProps
      );

    const generatedStyles = useMemo(
      () =>
        createStyleSheet({
          styleProp: resolvedProps.styleProp,
          atomicStyles: resolvedProps.atomic,
          light: resolvedProps.customProps?._light,
          dark: resolvedProps.customProps?._dark,
          web: resolvedProps.customProps?._web,
          native: resolvedProps.customProps?._native,
          ios: resolvedProps.customProps?._ios,
          android: resolvedProps.customProps?._android,
        }),
      [resolvedProps.styleProp, resolvedProps.customProps, resolvedProps.atomic]
    );

    DEBUG_MODE &&
      console.log(
        'createComponent.generatedStyles:',
        Component.displayName,
        generatedStyles
      );

    // Select by platform (synchronous, no subscription)
    const platformStyle = Platform.select({
      web: generatedStyles.web,
      native: generatedStyles.native,
      ios: generatedStyles.ios,
      android: generatedStyles.android,
      default: {},
    });

    // Apply custom platform styles from the registry.
    // Each registered platform predicate is evaluated synchronously;
    // matching platforms' styles are merged in registration order.
    const registeredPlatforms = _useSmallUIStore.getState().config.platforms;
    const customPlatformStyle = useMemo(() => {
      if (!registeredPlatforms) return undefined;
      let merged: Record<string, unknown> = {};
      for (const [key, predicate] of Object.entries(registeredPlatforms)) {
        if (predicate()) {
          const propKey = `_${key}` as `_${string}`;
          const platformStyleValue = (
            resolvedProps.customProps as Record<string, unknown>
          )[propKey];
          if (platformStyleValue && typeof platformStyleValue === 'object') {
            merged = {
              ...merged,
              ...(platformStyleValue as Record<string, unknown>),
            };
          }
        }
      }
      return Object.keys(merged).length > 0 ? merged : undefined;
    }, [resolvedProps.customProps, registeredPlatforms]);

    const colorModeStyle = useColorModeValue(
      generatedStyles.light as Record<string, unknown>,
      generatedStyles.dark as Record<string, unknown>
    );

    // Apply active custom color mode style (_highContrast, _sepia, etc.)
    const registeredColorModes = _useSmallUIStore.getState().config.colorModes;
    const customColorModeStyle = useMemo(() => {
      if (!activeCustomMode || !registeredColorModes) return undefined;
      if (!(activeCustomMode in registeredColorModes)) return undefined;
      const propKey = `_${activeCustomMode}`;
      const modeStyle = (resolvedProps.customProps as Record<string, unknown>)[
        propKey
      ];
      if (modeStyle && typeof modeStyle === 'object') {
        return modeStyle as Record<string, unknown>;
      }
      return undefined;
    }, [activeCustomMode, resolvedProps.customProps, registeredColorModes]);

    const mergedStyles = useMemo(
      () => [
        colorModeStyle,
        generatedStyles.component,
        platformStyle,
        customPlatformStyle,
        customColorModeStyle,
      ],
      [
        colorModeStyle,
        generatedStyles.component,
        platformStyle,
        customPlatformStyle,
        customColorModeStyle,
      ]
    );

    DEBUG_MODE &&
      console.log(
        'createComponent.mergedStyles:',
        Component.displayName,
        mergedStyles
      );

    return React.createElement(Component, {
      ..._defaultProps,
      ...(remainingProps as TProps),
      style: mergedStyles,
    });
  };

  // ----------------------------------------------------------------
  // .extend() — ergonomic style composition
  // ----------------------------------------------------------------

  SmallUIComp.extend = (
    stylesOrConfig: ComponentStyle<TProps> | ComponentConfig<TProps>
  ): SmallUIComponent<TProps> => {
    const extendIsConfig =
      stylesOrConfig !== null &&
      typeof stylesOrConfig === 'object' &&
      !Array.isArray(stylesOrConfig) &&
      ('base' in stylesOrConfig ||
        'variants' in stylesOrConfig ||
        'compoundVariants' in stylesOrConfig ||
        'defaultVariants' in stylesOrConfig);

    if (extendIsConfig) {
      const extConfig = stylesOrConfig as ComponentConfig<TProps>;
      // Merge base styles. If either side is a function, wrap into a ctx fn.
      const mergedBase: ComponentStyle<TProps> | undefined = (() => {
        const left = baseStyle;
        const right = extConfig.base;
        if (!left && !right) return undefined;
        if (!left) return right;
        if (!right) return left;
        if (typeof left === 'function' || typeof right === 'function') {
          return (ctx: StyleCtx): ExtendedProps<TProps> => {
            const l =
              typeof left === 'function'
                ? left(ctx)
                : (left as ExtendedProps<TProps>);
            const r =
              typeof right === 'function'
                ? right(ctx)
                : (right as ExtendedProps<TProps>);
            return mergeStyles<TProps>(l, r);
          };
        }
        return mergeStyles<TProps>(
          left as ExtendedProps<TProps>,
          right as ExtendedProps<TProps>
        );
      })();

      const mergedConfig: ComponentConfig<TProps> = {
        base: mergedBase,
        variants: {
          ...(config?.variants ?? {}),
          ...(extConfig.variants ?? {}),
        } as VariantConfig<TProps>,
        compoundVariants: [
          ...(config?.compoundVariants ?? []),
          ...(extConfig.compoundVariants ?? []),
        ] as CompoundVariant<TProps, VariantConfig<TProps>>[],
        defaultVariants: {
          ...(config?.defaultVariants ?? {}),
          ...(extConfig.defaultVariants ?? {}),
        },
      };
      return createComponent(Component, mergedConfig, defaultProps);
    }

    // Simple style extension — merge base + extension style.
    const extStyle = stylesOrConfig as ComponentStyle<TProps>;
    if (typeof extStyle === 'function' || typeof baseStyle === 'function') {
      // If either side is a function, wrap both into a single ctx function.
      const merged = (ctx: StyleCtx): ExtendedProps<TProps> => {
        const left =
          typeof baseStyle === 'function'
            ? baseStyle(ctx)
            : (baseStyle ?? ({} as ExtendedProps<TProps>));
        const right =
          typeof extStyle === 'function'
            ? extStyle(ctx)
            : (extStyle as ExtendedProps<TProps>);
        return mergeStyles<TProps>(left, right);
      };
      return createComponent(Component, merged, defaultProps);
    }

    const merged = mergeStyles<TProps>(
      baseStyle as ExtendedProps<TProps> | undefined,
      extStyle as ExtendedProps<TProps>
    );
    return createComponent(Component, merged, defaultProps);
  };

  // ----------------------------------------------------------------
  // .withSlots() — compound component dot-notation
  // ----------------------------------------------------------------

  SmallUIComp.withSlots = <S extends SlotMap>(
    slots: S
  ): SmallUIComponent<TProps, V> & S => {
    // Attach each slot as a static property on a copy of the component.
    const withSlotsComp = SmallUIComp as SmallUIComponent<TProps, V> & S;
    for (const [key, SlotComponent] of Object.entries(slots)) {
      (withSlotsComp as Record<string, unknown>)[key] = SlotComponent;
    }
    return withSlotsComp;
  };

  // ----------------------------------------------------------------
  // Static metadata properties (#16 — Component Metadata)
  // Zero runtime overhead: assigned once at definition time, never
  // read during render.
  // ----------------------------------------------------------------

  // __meta: pass-through of the optional meta descriptor.
  SmallUIComp.__meta = meta;

  // __variants: snapshot of variant group names → their value keys.
  SmallUIComp.__variants = config?.variants
    ? (Object.fromEntries(
        Object.entries(config.variants).map(([group, values]) => [
          group,
          Object.keys(values),
        ])
      ) as Record<string, string[]>)
    : undefined;

  // __resolveStyles: bound resolver for the component's base style definition.
  // Delegates to the standalone getResolvedStyles utility.
  SmallUIComp.__resolveStyles = (ctx = {}) =>
    getResolvedStyles(baseStyle as ComponentStyle<TProps>, ctx);

  return SmallUIComp as SmallUIComponent<TProps, V>;
}

// ---------------------------------------------------------------------------
// createComponentGroup — sibling context sharing
// ---------------------------------------------------------------------------

/**
 * Input shape for createComponentGroup: a map of component names to their
 * wrapped React Native base components and optional style definitions.
 */
export type ComponentGroupInput = Record<
  string,
  {
    Component: ComponentType<any>; // any: heterogeneous component types
    style?: ComponentStyle<any> | ComponentConfig<any>;
  }
>;

/**
 * The output of createComponentGroup: an object of named SmallUIComponents
 * that all share the same reactive context (colorMode, breakpoints) implicitly.
 */
export type ComponentGroup<T extends ComponentGroupInput> = {
  [K in keyof T]: SmallUIComponent<any>; // any: each slot can wrap a different component type
};

/**
 * Creates a named group of related SmallUI components that share reactive
 * context (colorMode, breakpoints) without requiring a parent-child hierarchy.
 * All components in the group subscribe to the same stores — context is
 * implicit, no prop drilling or React Context providers needed.
 *
 * Distinct from `.withSlots()` which is parent-child: this is sibling sharing.
 *
 * @example
 * const { FormLabel, FormInput, FormError } = createComponentGroup({
 *   FormLabel: { Component: Text,       style: { fontSize: 14, fontWeight: '600' } },
 *   FormInput: { Component: TextInput,  style: { borderWidth: 1, padding: 8 } },
 *   FormError: { Component: Text,       style: { _light: { color: '#e00c2c' }, _dark: { color: '#be0a25' } } },
 * });
 *
 * // All three share colorMode reactivity — no wrapper needed.
 * function MyForm() {
 *   return (
 *     <View>
 *       <FormLabel>Email</FormLabel>
 *       <FormInput placeholder="you@example.com" />
 *       <FormError>Required</FormError>
 *     </View>
 *   );
 * }
 */
export function createComponentGroup<T extends ComponentGroupInput>(
  group: T
): ComponentGroup<T> {
  const result = {} as ComponentGroup<T>;
  for (const [key, entry] of Object.entries(group)) {
    (result as Record<string, unknown>)[key] = createComponent(
      entry.Component,
      entry.style as any // any: ComponentStyle<any> for heterogeneous group entries
    );
  }
  return result;
}

export function resolvePropByType<TProps extends object>(
  props: TProps,
  componentType?: LookUpPropsComponentType
) {
  const LookUpProps = componentType
    ? StylePropsLookUp[componentType]
    : StylePropsLookUp._default;

  const atomic = {} as Record<keyof typeof LookUpProps | string, unknown>;
  let styleProp = {} as Record<string, unknown>;
  // customProps holds all underscore-prefixed props: built-in (_light, _dark,
  // _ios, _android, _web, _native) AND custom platform keys (_tablet, _tv, …)
  const customProps = {} as Record<string, object>;

  const exclusionList = ['children'];
  Object.entries(props).forEach(([propKey, propValue]) => {
    if (exclusionList.includes(propKey)) {
      return;
    }
    if (propKey === 'style') {
      styleProp = propValue;
      return;
    }
    // Route any _-prefixed key to customProps (covers built-in + registered platforms)
    if (propKey.startsWith('_')) {
      customProps[propKey] = propValue;
      return;
    }
    if (LookUpProps) {
      if (propKey in LookUpProps) {
        atomic[propKey as keyof typeof LookUpProps] = propValue;
        return;
      }
    }
  });

  return {
    styleProp,
    atomic,
    customProps,
  };
}

type CreateStyleParams = {
  styleProp?: object;
  atomicStyles?: object;
  light?: object;
  dark?: object;
  web?: object;
  native?: object;
  ios?: object;
  android?: object;
};

function createStyleSheet({
  styleProp = {},
  atomicStyles = {},
  light = {},
  dark = {},
  web = {},
  native = {},
  ios = {},
  android = {},
}: CreateStyleParams) {
  return StyleSheet.create({
    component: StyleSheet.flatten([atomicStyles, styleProp]),
    light,
    dark,
    web,
    native,
    ios,
    android,
  });
}

// Auto-initialize on import: attaches the Appearance listener for runtime
// light/dark system changes. The colorMode store already reads the initial
// value from Appearance.getColorScheme() at module load, so components work
// correctly from the first render even without this listener.
function _autoInit() {
  if (_useSmallUIStore.getState().init) return;
  colorSchemeListener();
  _useSmallUIStore.setState({ init: true, config: defaultConfig });
}

_autoInit();
