type Falsy = undefined | null | false;
export type StyleProp<T> = T | Falsy;

export type WebStyles = React.CSSProperties;

// Version-agnostic style object extractor.
// Unwraps StyleProp<T> = T | RecursiveArray<T | Falsy> | Falsy into just T.
// Does NOT check against a compiled-in ViewStyle — works across RN versions.
export type UnwrapStyleProp<T> =
  NonNullable<T> extends (infer U)[]
    ? NonNullable<U>
    : NonNullable<T> extends boolean | number | string
      ? never
      : NonNullable<T>;

export type ExtendStyle<T, TStyle = UnwrapStyleProp<T>> = {
  _light?: TStyle;
  _dark?: TStyle;
  _web?: WebStyles;
  _native?: TStyle;
  _ios?: TStyle;
  _android?: TStyle;
  /** Custom platform keys registered via configure({ platforms: { ... } }) */
  [key: `_${string}`]: TStyle | WebStyles | undefined;
};

export type ExtendedProps<TProps extends { style?: unknown }> = UnwrapStyleProp<
  TProps['style']
> &
  ExtendStyle<TProps['style']>;

/**
 * The reactive context object passed to the style factory function.
 * Only the values actually read by the style function will trigger re-renders.
 *
 * - `colorMode`: current color scheme ('light' | 'dark')
 * - `breakpoint(values)`: resolves a responsive value map to the current
 *   breakpoint match. Components that call this opt-in to breakpoint
 *   subscriptions; components that don't call it pay zero cost.
 */
export type StyleCtx = {
  colorMode: 'light' | 'dark';
  breakpoint: <T>(values: Partial<Record<BreakPointKey, T>>) => T | undefined;
};

export type BreakPointKey =
  | 'default'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl';

/**
 * Style definition for createComponent.
 * Accepts either a plain style object or a factory function that receives
 * a reactive ctx and returns a style object.
 */
export type ComponentStyle<T extends { style?: unknown }> =
  | ExtendedProps<T>
  | ((ctx: StyleCtx) => ExtendedProps<T>);

// ---------------------------------------------------------------------------
// Variant System
// ---------------------------------------------------------------------------

/**
 * A map of variant groups to their possible values and corresponding styles.
 *
 * @example
 * const variants = {
 *   size: {
 *     sm: { padding: 8 },
 *     md: { padding: 12 },
 *     lg: { padding: 16 },
 *   },
 *   intent: {
 *     primary: { _light: { backgroundColor: '#007AFF' }, _dark: { backgroundColor: '#0A84FF' } },
 *     danger:  { _light: { backgroundColor: '#e00c2c' }, _dark: { backgroundColor: '#be0a25' } },
 *   },
 * } satisfies VariantConfig<Props>;
 */
export type VariantConfig<TProps extends { style?: unknown }> = Record<
  string,
  Record<string, ExtendedProps<TProps>>
>;

/**
 * Infers the variant prop types from a VariantConfig.
 * Each group becomes an optional prop whose type is the union of its value keys.
 * Values are constrained to `string` to avoid index signature conflicts with
 * numeric React Native style props (e.g. height, padding).
 *
 * @example
 * // Given: { size: { sm: ..., md: ..., lg: ... } }
 * // Result: { size?: 'sm' | 'md' | 'lg' }
 */
export type VariantProps<V extends Record<string, Record<string, unknown>>> = {
  [K in keyof V]?: Extract<keyof V[K], string>;
};

/**
 * A compound variant applies a style only when a specific combination
 * of variant values is active. Evaluated after individual variants —
 * compound styles layer on top.
 *
 * @example
 * compoundVariants: [
 *   {
 *     variants: { size: 'sm', intent: 'danger' },
 *     style: { borderWidth: 2 },
 *   },
 * ]
 */
export type CompoundVariant<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps>,
> = {
  variants: Partial<VariantProps<V>>;
  style: ExtendedProps<TProps>;
};

/**
 * Infers the string keys of a VariantConfig (the variant group names).
 * Used to constrain the keys accepted by withVariantContext.
 */
export type VariantGroupKey<V extends VariantConfig<{ style?: unknown }>> =
  Extract<keyof V, string>;

/**
 * Full configuration object for createComponent.
 * Combines the base style with the variant system.
 */
export type ComponentConfig<
  TProps extends { style?: unknown },
  V extends VariantConfig<TProps> = VariantConfig<TProps>,
> = {
  /** Base styles applied to every instance of the component. */
  base?: ComponentStyle<TProps>;
  /** Named variant groups. Each group's keys become prop values. */
  variants?: V;
  /**
   * Styles applied only when a specific combination of variants is active.
   * Resolved after individual variants — last compound match wins on conflict.
   */
  compoundVariants?: CompoundVariant<TProps, V>[];
  /**
   * Default values for variant props. Applied when no explicit prop is passed.
   */
  defaultVariants?: Partial<VariantProps<V>>;
};

// ---------------------------------------------------------------------------
// createPressable — Pressable-specific config
// ---------------------------------------------------------------------------

import type { ViewProps } from 'react-native';

/**
 * Style config for createPressable. Extends ComponentConfig with
 * interactive state styles for pressed, hovered, focused, and disabled.
 *
 * _pressed:  applied while the user actively presses the component.
 * _hovered:  applied on pointer hover (web only — no-op on iOS/Android).
 * _focused:  applied when the component receives keyboard/accessibility focus
 *            (web, tvOS, and screen readers — no-op on touch-only devices).
 * _disabled: applied when props.disabled is true — no events needed.
 */
export type PressableConfig<
  V extends VariantConfig<ViewProps> = VariantConfig<ViewProps>,
> = ComponentConfig<ViewProps, V> & {
  /** Styles merged when the component is pressed. Overrides base and variant styles. */
  _pressed?: ExtendedProps<ViewProps>;
  /** Styles merged when the component is hovered (web only). */
  _hovered?: ExtendedProps<ViewProps>;
  /** Styles merged when the component has keyboard/accessibility focus (web, tvOS). */
  _focused?: ExtendedProps<ViewProps>;
  /** Styles merged when props.disabled is true. */
  _disabled?: ExtendedProps<ViewProps>;
};
