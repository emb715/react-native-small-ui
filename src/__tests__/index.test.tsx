import * as coreExports from '../index';
import * as colorModeExports from '../colormode';
import * as themeExports from '../theme-exports';
import * as utilsExports from '../utils-exports';

const expectedCoreExports = [
  'createComponent',
  'createThemedComponent',
  'createComponentGroup',
  'configure',
  'getStatusBarStyle',
  'cs',
  'getResolvedStyles',
];

const expectedColorModeExports = [
  'useColorMode',
  'useColorModeValue',
  'setColorScheme',
  'toggleColorScheme',
  'setCustomColorMode',
  'clearCustomColorMode',
  'useCustomColorMode',
];

const expectedThemeExports = [
  'useTheme',
  'getTheme',
  'registerTheme',
  'setTheme',
  'useThemeName',
  'ColorUtils',
  'generateSpaceUnits',
];

const expectedUtilsExports = [
  'useOrientation',
  'useMediaQuery',
  'useBreakPointValue',
];

function checkExports(
  actual: Record<string, unknown>,
  expected: string[]
): string[] {
  const keys = Object.keys(actual);
  return expected.filter((name) => keys.includes(name));
}

test('core exports from react-native-small-ui', () => {
  const matched = checkExports(
    coreExports as Record<string, unknown>,
    expectedCoreExports
  );
  expect(matched.length).toEqual(expectedCoreExports.length);
});

test('color mode exports from react-native-small-ui/colormode', () => {
  const matched = checkExports(
    colorModeExports as Record<string, unknown>,
    expectedColorModeExports
  );
  expect(matched.length).toEqual(expectedColorModeExports.length);
});

test('theme exports from react-native-small-ui/theme', () => {
  const matched = checkExports(
    themeExports as Record<string, unknown>,
    expectedThemeExports
  );
  expect(matched.length).toEqual(expectedThemeExports.length);
});

test('utils exports from react-native-small-ui/utils', () => {
  const matched = checkExports(
    utilsExports as Record<string, unknown>,
    expectedUtilsExports
  );
  expect(matched.length).toEqual(expectedUtilsExports.length);
});
