import * as inUseExports from '../index';

const expectedExports = [
  'ColorUtils',
  'createComponent',
  'getTheme',
  'registerTheme',
  'setColorScheme',
  'toggleColorScheme',
  'useBreakPointValue',
  'useColorMode',
  'useColorModeValue',
  'useMediaQuery',
  'useOrientation',
  'useTheme',
  'useTinyBase',
  'getStatusBarStyle',
];
test('check exports from package', () => {
  const a = Object.keys(inUseExports);
  expect(a).toStrictEqual(expectedExports);
});
