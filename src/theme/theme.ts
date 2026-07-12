type SpaceUnitOpts = {
  maxAmount?: number;
  withNegatives?: boolean;
};

/**
 * Generate a spacing scale from a base unit value.
 *
 * Returns a map of named sizes including fractions (.25, .50, .75)
 * and integer multiples from 1 to maxAmount (default 10).
 *
 * @example
 * const space = generateSpaceUnits(4);
 * // { '.25': 1, '.50': 2, '.75': 3, '1': 4, '2': 8, ... }
 */
export function generateSpaceUnits(
  unit: number = 4,
  { maxAmount = 10, withNegatives = false }: SpaceUnitOpts = {}
): Record<string, number> {
  if (!(unit > 0)) {
    throw new Error(
      `generateSpaceUnits: unit must be greater than 0. Received: ${unit}`
    );
  }

  const sizes: Record<string, number> = {
    ['.25']: unit * 0.25,
    ['.50']: unit * 0.5,
    ['.75']: unit * 0.75,
  };

  for (let i = 1; i <= maxAmount; i++) {
    sizes[i.toString()] = unit * i;
    if (withNegatives) {
      sizes[`-${i}`] = -(unit * i);
    }
  }

  return sizes;
}
