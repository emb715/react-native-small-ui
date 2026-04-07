import { type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

type Falsy = undefined | null | false;
export type StyleProp<T> = T | Falsy;

export type WebStyles = React.CSSProperties;

export type ExtendStyle<T, TStyle = FindStyleType<T>> = {
  _light?: TStyle;
  _dark?: TStyle;
  _web?: WebStyles;
  _native?: TStyle;
  _ios?: TStyle;
  _android?: TStyle;
  /** Custom platform keys registered via configure({ platforms: { ... } }) */
  [key: `_${string}`]: TStyle | WebStyles | undefined;
};

export type isViewStyle<T> = T extends ViewStyle ? StyleProp<ViewStyle> : never;
export type isTextStyle<T> = T extends TextStyle ? StyleProp<TextStyle> : never;
export type isImageStyle<T> = T extends ImageStyle
  ? StyleProp<ImageStyle>
  : never;

// Find the pure style
export type FindStyleType<T> =
  T extends isViewStyle<T>
    ? T
    : T extends isTextStyle<T>
      ? T
      : T extends isImageStyle<T>
        ? T
        : never;

export type ExtendedProps<TProps extends { style?: unknown }> = FindStyleType<
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
