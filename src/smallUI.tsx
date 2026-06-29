import React, {
  type ComponentPropsWithRef,
  type ComponentType,
  useMemo,
} from 'react';
import { Platform } from 'react-native';

import {
  colorSchemeListener,
  useColorModeValue,
  useCustomColorModeStore,
} from './hooks/useColorMode/useColorMode';
import { useColorModeStore } from './hooks/useColorMode/colorMode.store';
import { getResolvedStyles } from './utils/helpers';
import { _autoInit } from './init';
import { resolvePropByType, createStyleSheet } from './factory.helpers';
import type { LookUpPropsComponentType } from './utils/utils.style-props';
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
import { defaultBreakPoints } from './breakpoints';
import {
  discoverBreakpoints,
  useBreakpointMatches,
  resolveBreakpoint,
} from './breakpoint.helpers';
import {
  extractVariantProps,
  resolveVariantStyles,
  mergeStyles,
} from './variant.helpers';
import {
  _useSmallUIStore,
  defaultConfig,
  type InitConfig,
} from './config.store';

export { configure, _useSmallUIStore } from './config.store';
export type {
  PlatformRegistry,
  ColorModeRegistry,
  InitConfig,
} from './config.store';

/*****************************
 * EMB Small UI
 *****************************/

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
    /* istanbul ignore next */
  } catch (error) {
    console.error('_initSmallUI.error:', error);
    return;
  }
}

/**
 * COMPONENT CREATION
 ***********************/

const DEBUG_MODE = false;

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
  S extends SlotMap = SlotMap,
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
  ) => SmallUIComponent<TProps, V>;

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
  withSlots: <NewS extends SlotMap>(
    slots: NewS
  ) => SmallUIComponent<TProps, V, NewS> & NewS;

  /**
   * Enable variant state propagation from this compound component parent to its
   * already-attached slots. For each key in `keys`, a React context is created
   * (per call — never global) and the parent writes its active variant value into
   * it. Each slot reads the context and uses it as the default for that variant,
   * with any explicit prop on the slot always winning.
   *
   * @example
   * const Button = createComponent(TouchableOpacity, {
   *   variants: { intent: { primary: {}, ghost: {} } },
   *   defaultVariants: { intent: 'primary' },
   * }).withSlots({
   *   Text: createComponent(Text, {
   *     variants: { intent: { primary: { color: '#fff' }, ghost: { color: '#007AFF' } } },
   *     defaultVariants: { intent: 'primary' },
   *   }),
   * }).withVariantContext('intent');
   *
   * <Button intent="ghost">
   *   <Button.Text>Cancel</Button.Text>  // picks up ghost
   * </Button>
   */
  withVariantContext: <Keys extends string[]>(
    ...keys: Keys
  ) => SmallUIComponent<TProps, V, S> & S;

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
    // ----------------------------------------------------------------
    // Reactive subscriptions
    // ----------------------------------------------------------------

    // Subscribe to colorMode — fires only when light/dark changes.
    const colorMode = useColorModeStore((s) => s.colorMode);

    // Subscribe to active custom color mode — fires when setCustomColorMode is called.
    const activeCustomMode = useCustomColorModeStore((s) => s.activeMode);

    // Subscribe to store config — fires when configure() is called post-mount.
    const storeConfig = _useSmallUIStore((s) => s.config);

    // Subscribe to breakpoint media queries.
    const breakPoints =
      storeConfig.breakPoints !== false && storeConfig.breakPoints
        ? storeConfig.breakPoints
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
    const registeredPlatforms = storeConfig.platforms;
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
    const registeredColorModes = storeConfig.colorModes;
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
      ...(remainingProps as TProps),
      style: mergedStyles,
    });
  };

  // ----------------------------------------------------------------
  // .extend() — ergonomic style composition
  // ----------------------------------------------------------------

  SmallUIComp.extend = (
    stylesOrConfig: ComponentStyle<TProps> | ComponentConfig<TProps>
  ): SmallUIComponent<TProps, V> => {
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
      return createComponent(Component, mergedConfig, meta);
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
      return createComponent(Component, merged, meta);
    }

    const merged = mergeStyles<TProps>(
      baseStyle as ExtendedProps<TProps> | undefined,
      extStyle as ExtendedProps<TProps>
    );
    return createComponent(Component, merged, meta);
  };

  // ----------------------------------------------------------------
  // .withSlots() — compound component dot-notation
  // ----------------------------------------------------------------

  SmallUIComp.withSlots = <NewS extends SlotMap>(
    slots: NewS
  ): SmallUIComponent<TProps, V, NewS> & NewS => {
    // Attach each slot as a static property on a copy of the component.
    const withSlotsComp = SmallUIComp as unknown as SmallUIComponent<
      TProps,
      V,
      NewS
    > &
      NewS;
    for (const [key, SlotComponent] of Object.entries(slots)) {
      (withSlotsComp as unknown as Record<string, unknown>)[key] =
        SlotComponent;
    }
    return withSlotsComp;
  };

  // ----------------------------------------------------------------
  // .withVariantContext() — variant state propagation to slots
  // ----------------------------------------------------------------

  SmallUIComp.withVariantContext = <Keys extends string[]>(
    ...keys: Keys
    // Cast to `SmallUIComponent<TProps, V>` — callers with slots attached get
    // `SmallUIComponent<TProps, V, S> & S` from the interface's generic return type.
    // The runtime shape always carries the slot properties.
  ): SmallUIComponent<TProps, V> => {
    // Step 1: Create one React context per key — per call, never global.
    const contexts = Object.fromEntries(
      keys.map((k) => [k, React.createContext<string | undefined>(undefined)])
    ) as Record<string, React.Context<string | undefined>>;

    // Step 2: Identify which properties on SmallUIComp are slots.
    // Known SmallUIComponent method/property names that are NOT slots:
    const knownStaticKeys = new Set([
      'extend',
      'withSlots',
      'withVariantContext',
      '__meta',
      '__variants',
      '__resolveStyles',
      'displayName',
      'name',
      'length',
      'prototype',
      'arguments',
      'caller',
      'call',
      'apply',
      'bind',
      'toString',
    ]);

    const smallUICompAsRecord = SmallUIComp as unknown as Record<
      string,
      unknown
    >;
    const slotKeys = Object.keys(smallUICompAsRecord).filter(
      (key) =>
        !knownStaticKeys.has(key) &&
        typeof smallUICompAsRecord[key] === 'function'
    );

    // Step 3: Build the parent wrapper component.
    // It reads its own resolved variant props for each key (after defaultVariants),
    // provides them into contexts, and renders the original SmallUIComp.
    const ParentWrapper = (
      props: TProps &
        ComponentPropsWithRef<typeof Component> &
        ExtendedProps<TProps> &
        VariantProps<V>
    ) => {
      // Collect the active value for each context key.
      // Active = explicitly passed prop, else defaultVariants value.
      const contextValues: Record<string, string | undefined> = {};
      for (const key of keys) {
        const explicitValue = (props as Record<string, unknown>)[key];
        const defaultValue = config?.defaultVariants
          ? (config.defaultVariants as Record<string, string | undefined>)[key]
          : undefined;
        contextValues[key] =
          explicitValue !== undefined
            ? (explicitValue as string)
            : defaultValue;
      }

      // Wrap children in Provider elements — one per key.
      // Build from inside-out: innermost = last key.
      let element: React.ReactElement = React.createElement(SmallUIComp, props);
      for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        if (key === undefined) continue;
        const ctx = contexts[key];
        if (!ctx) continue;
        element = React.createElement(
          ctx.Provider,
          { value: contextValues[key] },
          element
        );
      }
      return element;
    };

    // Step 4: Copy all static properties from SmallUIComp onto ParentWrapper.
    const wrapper = ParentWrapper as unknown as SmallUIComponent<TProps, V>;
    const wrapperAsRecord = wrapper as unknown as Record<string, unknown>;
    wrapperAsRecord['extend'] = SmallUIComp.extend;
    wrapperAsRecord['withSlots'] = SmallUIComp.withSlots;
    wrapperAsRecord['withVariantContext'] = SmallUIComp.withVariantContext;
    wrapperAsRecord['__meta'] = SmallUIComp.__meta;
    wrapperAsRecord['__variants'] = SmallUIComp.__variants;
    wrapperAsRecord['__resolveStyles'] = SmallUIComp.__resolveStyles;

    // Step 5: Wrap each slot so it reads from contexts.
    for (const slotKey of slotKeys) {
      const OriginalSlot = smallUICompAsRecord[slotKey] as (
        props: Record<string, unknown>
      ) => React.ReactElement | null;

      const SlotWrapper = (slotProps: Record<string, unknown>) => {
        // Read context values for each key.
        // Explicit slot props always win; context is only a default.
        const contextDefaults: Record<string, string | undefined> = {};
        for (const key of keys) {
          const ctx = contexts[key];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const contextValue = ctx ? React.useContext(ctx) : undefined;
          // Only use context value if the variant key exists on the slot.
          // Slots that don't have this variant key simply won't be affected
          // because the value is passed as a prop that the slot ignores.
          if (contextValue !== undefined && !(key in slotProps)) {
            contextDefaults[key] = contextValue;
          }
        }
        return OriginalSlot({ ...contextDefaults, ...slotProps });
      };

      wrapperAsRecord[slotKey] = SlotWrapper;
    }

    return wrapper;
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
    Component: ComponentType<any>; // any: per-entry types cannot be preserved in a heterogeneous mapped type
    style?: ComponentStyle<any> | ComponentConfig<any>;
  }
>;

/** Extracts React component props from a ComponentGroupInput entry. */
type GroupMemberProps<
  E extends { Component: ComponentType<any>; style?: unknown },
> = React.ComponentProps<E['Component']>;

/**
 * The output of `createComponentGroup`: an object of named SmallUIComponents
 * that all share the same reactive context (colorMode, breakpoints).
 *
 * Each member is typed as `SmallUIComponent<ComponentProps<T[K]['Component']>>`
 * — component-specific prop types are preserved per key.
 *
 * @example
 * const { FormLabel, FormInput } = createComponentGroup({
 *   FormLabel: { Component: Text,      style: { fontSize: 14 } },
 *   FormInput: { Component: TextInput, style: { borderWidth: 1 } },
 * });
 * // FormInput is SmallUIComponent<React.ComponentProps<typeof TextInput>>
 * // placeholder, onChangeText etc. are all known to TypeScript.
 */
export type ComponentGroup<T extends ComponentGroupInput> = {
  [K in keyof T]: SmallUIComponent<GroupMemberProps<T[K]>>;
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

export { teardownSmallUI } from './init';
export { resolvePropByType } from './factory.helpers';

// Auto-initialize on module import.
_autoInit();
