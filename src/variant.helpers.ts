import type {
  ComponentConfig,
  CompoundVariant,
  ExtendedProps,
  VariantConfig,
  VariantProps,
} from './smallUI.types';

/**
 * Merges two ExtendedProps objects shallowly.
 * Later values win on key conflicts.
 */
export function mergeStyles<TProps extends { style?: unknown }>(
  a: ExtendedProps<TProps> | undefined,
  b: ExtendedProps<TProps> | undefined
): ExtendedProps<TProps> {
  if (!a && !b) return {} as ExtendedProps<TProps>;
  if (!a) return b as ExtendedProps<TProps>;
  if (!b) return a;
  return { ...a, ...b } as ExtendedProps<TProps>;
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
 * Resolves the combined style from a variant config given the active
 * variant values. Merges: defaultVariants → prop variants → compound variants.
 *
 * Resolution order (later wins):
 *   1. defaultVariants
 *   2. prop-supplied variant values
 *   3. compoundVariants (all matching entries, in declaration order)
 */
export function resolveVariantStyles<
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
 * Extracts variant prop keys from props, returning them separately from
 * the rest. Variant keys are determined by the keys of the variants config.
 */
export function extractVariantProps<
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
