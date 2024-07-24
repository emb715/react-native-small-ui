import { getContrastColor, getHexAlpha } from '../utils/utils.colors';
import { create } from 'zustand';

type UnitConfig = {
  unit: number;
  maxAmount?: number; // The amount of generated sizes based on unit value
  withNegatives?: boolean; // If the generated sizes will go under 0
};

// const OptionalShortHands = {
//   mx: 'marginHorizontal' // mh: 'marginHorizontal'
// } as const

type ShorthandsConfig = object;

// type BreakPoints = {
//   default: number;
//   xs: number;
//   sm: number;
//   md: number;
//   lg: number;
//   xl: number;
//   xxl: number;
// };

export type ThemeConfig = {
  // breakPoints?: BreakPoints;
  useShorthands?: boolean | ShorthandsConfig;
  useUnits?: boolean | UnitConfig;
  colors: typeof defaultThemeColors;
};

type ColorPalette = Record<string | number, string>;
type Palette = Record<string, ColorPalette>;
type SchemeColors =
  | Record<string, string>
  | {
      palette?: Palette;
    };

export type ThemeColors = {
  light: SchemeColors;
  dark: SchemeColors;
};

export const defaultThemeColors = {
  light: {
    primary: '#8b59a0', // https://www.colorhexa.com/8b59a0
    secondary: '#79a964',
    accent: '#19d5bc',
    background: '#fdfbfd',
    foreground: '#1c1c1e', // should work as text color for background
    card: '#e2d6e8',
    text: '#1c1c1e',
    border: '#c0a3cc',
    palette: {
      primary: {
        100: '#f4eff6',
        200: '#e2d5e8',
        300: '#c0a3cc',
        400: '#ad88bd',
        500: '#9768ab',
        600: '#754b87',
        700: '#492f54',
        800: '#33213b',
        900: '#1e1322',
      },
      gray: {
        100: '#ECECED',
        300: '#868E96',
        600: '#3F4A55',
        900: '#11141E',
      },
    },
  },
  dark: {
    primary: '#756896', // https://www.colorhexa.com/756896
    secondary: '#899668',
    accent: '#16bea7',
    background: '#121017',
    foreground: '#f1f1f1',
    card: '#3f3851',
    text: '#f1f1f1',
    border: '#2d283a',
    palette: {
      primary: {
        100: '#e9e7ef',
        200: '#d4d0de',
        300: '#b4adc6',
        400: '#9f96b6',
        500: '#8a7fa6',
        600: '#63587f',
        700: '#48405c',
        800: '#363045',
        900: '#24202e',
      },
      gray: {
        100: '#D9D9DB',
        300: '#B3B4B7',
        600: '#707278',
        900: '#3F4A55',
      },
    },
  },
} as const satisfies ThemeColors;

const defaultThemeConfig = (() =>
  ({
    useShorthands: false,
    useUnits: true,
    colors: defaultThemeColors,
    // breakPoints: {
    //   default: 0,
    //   xs: 320,
    //   sm: 480,
    //   md: 768,
    //   lg: 992,
    //   xl: 1280,
    //   xxl: -1, // 100%
    // },
  }) satisfies ThemeConfig)();

type UnitId = string & {
  readonly __brand: unique symbol;
};
const UnitId = (id: string): UnitId => id as UnitId;

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
    [UnitId('.25')]: unit * 0.25,
    [UnitId('.50')]: unit * 0.5,
    [UnitId('.75')]: unit * 0.75,
  };

  const sizes: Record<UnitId, number> = {};

  for (let index = 1; index < maxAmount + 1; index++) {
    sizes[UnitId(index.toString())] = unit * index;
  }

  if (withNegatives) {
    Object.entries(sizes).forEach(([k, v]) => {
      const key = `-${k}`;
      sizes[UnitId(key)] = -v;
    });
  }

  return { ...sizes, sizesSmall } as Readonly<typeof sizes>;
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

type ThemeSnapshot = {
  colors: ThemeColors;
  space?: ReturnType<typeof getUnits>;
  utils: ThemeUtils;
};
type ThemeUtils = {
  getHexAlpha: typeof getHexAlpha;
  getContrastColor: typeof getContrastColor;
};

function validateThemeConfigValues(themeConfig: ThemeConfig) {
  // TODO: parse zod schema and validate
  return themeConfig;
}

// TODO: add breakpoint usage
function createTheme(themeConfig: ThemeConfig = defaultThemeConfig) {
  const config = validateThemeConfigValues(themeConfig);

  const generatedSpaceUnits = getUnits(config.useUnits);

  const spaceUnits = generatedSpaceUnits ? { space: generatedSpaceUnits } : {};

  const theme = {
    colors: config.colors,
    ...spaceUnits,
    utils: {
      // TODO: look to add useMaxWith or useBreakPoints or useBreakPointValue
      getHexAlpha,
      getContrastColor,
    },
  };

  return theme satisfies ThemeSnapshot;
}

let _theme = createTheme(defaultThemeConfig);

const initialState = {
  theme: _theme,
};
const useThemeStore = create(() => initialState);

export function registerTheme(themeConfig: ThemeConfig) {
  // validate theme
  const theme = createTheme(themeConfig);
  if (!theme) {
    throw 'registerTheme: invalid theme config.';
  }
  return useThemeStore.setState({ theme: theme });
}
export function getTheme() {
  return useThemeStore.getState().theme;
}

export const useTheme = () => {
  const { theme } = useThemeStore();
  return theme;
};
