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
  'useSmallUI',
  'getStatusBarStyle',
];
test('check exports from package', () => {
  const a = Object.keys(inUseExports);
  let checkedIn = [];
  a.forEach((key) => {
    if (expectedExports.includes(key)) {
      checkedIn.push(key);
    }
  });
  expect(checkedIn.length).toEqual(expectedExports.length);
});
