import {
  colorsToObject,
  generateColor,
  preset_palettes_dark,
  preset_palettes_light,
} from './colors';
import {
  themeColorsSchema,
  type Palette,
  type ThemeColors,
} from './colors.schema';

type UnitConfig = {
  unit: number;
  maxAmount?: number; // The amount of generated sizes based on unit value
  withNegatives?: boolean; // If the generated sizes will go under 0
};

type Color = string;
type ColorName = string;

type PaletteConfig = {
  // INFO: colors for generating the palette for different color modes
  baseColors: Record<ColorName, Color>; // { 'red': '#f00'  }
  // customColors?: Palette;
};

type SchemeColors = Record<string, string> & {
  background: string; // Required for generateColor
  foreground: string;
  muted?: string;
  muted_foreground?: string;
  primary?: string;
  primary_foreground?: string;
  secondary?: string;
  secondary_foreground?: string;
  destructive?: string;
  destructive_foreground?: string;
  accent?: string;
  accent_foreground?: string;
  border?: string;
  card?: string;
  card_foreground?: string;
  ring?: string;
};

export type ThemeConfig = {
  useUnits?: boolean | UnitConfig;
  // colors: typeof defaultThemeColors;
  colors: ThemeColorsConfig;
  usePalette?: boolean | PaletteConfig; // default TRUE it will use presetBaseColors
};

export type ThemeColorsConfig = {
  light: SchemeColors;
  dark: SchemeColors;
};

export const defaultThemeColors = {
  light: {
    background: '#fdfbfd',
    foreground: '#1c1c1e', // should work as text color for background
    muted: '#f4f4f5',
    muted_foreground: '#71717a',
    primary: '#8b59a0',
    primary_foreground: '#f4eff6',
    secondary: '#79a964',
    secondary_foreground: '#fff', // TODO: change color
    destructive: '#e00c2c', // TODO: change color
    destructive_foreground: '#f4eff6',
    accent: '#19d5bc', // TODO: change color
    accent_foreground: '#303835',
    border: '#c0a3cc',
    card: '#e2d6e8',
    card_foreground: '#1c1c1e',
    ring: '#c0b3cc',
    // palette: preset_palettes_light,
  },
  dark: {
    background: '#09090b',
    foreground: '#fafafa',
    muted: '#1a1a38',
    muted_foreground: '#a1a1aa',
    primary: '#756896',
    primary_foreground: '#f4eff6',
    secondary: '#899668',
    secondary_foreground: '#e2e5dc', // TODO: change color
    destructive: '#be0a25', // TODO: change color
    destructive_foreground: '#f4eff6',
    accent: '#16bea7', // TODO: change color
    accent_foreground: '#303835',
    border: '#2d283a',
    card: '#3f3851',
    card_foreground: '#fafafa',
    ring: '#2d183a',
    // ...
    // palette: preset_palettes_dark,
  },
} as const satisfies ThemeColors;

export const _defaultThemeConfig = (() =>
  ({
    useUnits: true,
    colors: defaultThemeColors,
    usePalette: true,
    // usePalette: {
    //   baseColors: presetBaseColors,
    // baseColors: {
    //   funny: '#0f9',
    //   blue: '#f0f',
    //   sunset: '#0f0f',
    // },
    // },
  }) satisfies ThemeConfig)();

/**
 * Create sizes for unit from 1 to maxAmount with fractions between 0 and 1
 *
 * Example:  given 4 as unit > {'.25': 1, '.50': 2, '.75': 3, 1: 4, 2: 8, ...}
 * @param unit
 * @param maxAmount
 * @returns
 */
function generateMeasureUnit(
  unit: number = 4,
  { maxAmount = 10, withNegatives = false } = {}
) {
  // Safe check
  if (!(unit > 0)) {
    throw new Error(
      `generateMeasureUnit: Unit must be bigger than 0. Given: ${unit} `
    );
  }

  const sizesSmall = {
    ['.25']: unit * 0.25,
    ['.50']: unit * 0.5,
    ['.75']: unit * 0.75,
  };

  const sizes: Record<string, number> = {};

  for (let index = 1; index < maxAmount + 1; index++) {
    sizes[index.toString()] = unit * index;
  }

  if (withNegatives) {
    Object.entries(sizes).forEach(([k, v]) => {
      const key = `-${k}`;
      sizes[key] = -v;
    });
  }

  return { ...sizes, ...sizesSmall };
}

const UNIT_DEFAULT = 4;
function getUnitConfig(useUnits?: boolean | UnitConfig) {
  const unitConfig = {
    enabled: !!useUnits,
    unit: UNIT_DEFAULT,
    maxAmount: 10,
    withNegatives: true,
  };
  if (typeof useUnits === 'object') {
    unitConfig.maxAmount = useUnits?.maxAmount ?? unitConfig.maxAmount;
    unitConfig.withNegatives =
      useUnits?.withNegatives ?? unitConfig.withNegatives;
  }
  return unitConfig;
}

function getUnits(useUnits?: boolean | UnitConfig) {
  const unitConfig = getUnitConfig(useUnits);
  if (!unitConfig.enabled) {
    return undefined;
  }

  return generateMeasureUnit(unitConfig.unit, {
    maxAmount: unitConfig.maxAmount,
    withNegatives: unitConfig.withNegatives,
  });
}

export type ThemeSnapshot = {
  colors: ThemeColors;
  space?: ReturnType<typeof getUnits>;
};

function validateThemeConfigValues(themeConfig: ThemeConfig) {
  // TODO: parse zod schema and validate
  return themeConfig;
}

function generateBaseColorsPalettes(config: ThemeConfig) {
  if (typeof config.usePalette !== 'object') {
    return;
  }
  if (!config.usePalette.baseColors) {
    return;
  }

  const palette_light: Palette = {};
  const palette_dark: Palette = {};

  Object.keys(config.usePalette.baseColors).forEach((color) => {
    const light = generateColor(color, {
      theme: 'default',
      backgroundColor: config.colors.light.background,
    });
    palette_light[color] = colorsToObject(light);

    const dark = generateColor(color, {
      theme: 'dark',
      backgroundColor: config.colors.dark.background,
    });
    palette_dark[color] = colorsToObject(dark);
  });

  return {
    light: palette_light,
    dark: palette_dark,
  };
}

// function validateCustomPalette(config: ThemeConfig) {
//   if (typeof config.usePalette !== 'object') {
//     return;
//   }
//   if (!config.usePalette.customColors) {
//     return;
//   }
//   // TODO: validate config.usePalette.customColors
//   return config.usePalette.customColors;
// }

function getColorsForTheme(config: ThemeConfig) {
  const colors = themeColorsSchema.parse(config.colors);
  if (!config.usePalette) {
    return colors;
  }

  if (config.usePalette === true) {
    // Add preset palettes
    colors.light.palette = preset_palettes_light;
    colors.dark.palette = preset_palettes_dark;
    return colors;
  }

  if (typeof config.usePalette === 'object') {
    if (config.usePalette.baseColors) {
      // TODO: validate baseColors?
      const baseColorsPalettes = generateBaseColorsPalettes(config);
      if (baseColorsPalettes) {
        colors.light.palette = baseColorsPalettes.light;
        colors.dark.palette = baseColorsPalettes.dark;
      }
    }

    //   if (config.usePalette.customColors) {
    //     const customColors = validateCustomPalette(config);
    //     if (customColors) {
    //       colors.light.palette = {
    //         ...colors.light.palette,
    //         ...customColors,
    //       } as const;
    //       colors.dark.palette = {
    //         ...colors.dark.palette,
    //         ...customColors,
    //       } as const;
    //     }
    //   }
  }
  return colors satisfies ThemeColors;
}

export function createTheme(themeConfig: ThemeConfig = _defaultThemeConfig) {
  const config = validateThemeConfigValues(themeConfig);

  const generatedSpaceUnits = getUnits(config.useUnits);

  const generatedColors = getColorsForTheme(config);

  const spaceUnits = generatedSpaceUnits ? { space: generatedSpaceUnits } : {};
  const theme = {
    colors: generatedColors,
    ...spaceUnits,
  } satisfies ThemeSnapshot;
  return theme;
}

export const defaultTheme = createTheme(_defaultThemeConfig);
console.log('LOG: > defaultTheme:', defaultTheme);
