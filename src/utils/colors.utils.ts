function getRGB(c: string) {
  return parseInt(c, 16);
}
function getsRGB(c: string) {
  return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
}
function getLuminance(hexColor: string) {
  return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
  );
}
function getContrast(f: string, b: string) {
  const L1 = getLuminance(f);
  const L2 = getLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

const _COLOR_CONTRAST = {
  white: '#ffffff',
  black: '#000000',
} as const;

export const getContrastMode = (color: string) => {
  const contrastColor = getContrastColor(color);
  if (contrastColor === _COLOR_CONTRAST.white) {
    return 'light';
  }
  return 'dark';
};

export const getContrastColor = (color: string) => {
  const lightContrast = getContrast(color, _COLOR_CONTRAST.white);
  const darkContrast = getContrast(color, _COLOR_CONTRAST.black);
  if (lightContrast > darkContrast) {
    return _COLOR_CONTRAST.white;
  }
  return _COLOR_CONTRAST.black;
};

/**
 * @param {string} hexColor #fff or #ffffff
 * @param {number} alpha between 0 and 1
 * @return {string} new hex color with alpha
 */
export function getHexAlpha(hexColor: string, alpha: number) {
  if (!hexColor.startsWith('#')) {
    console.warn('getHexAlpha: missing # in hex color.');
    return hexColor;
  }
  const hexLength = hexColor.slice(1).length;
  const hexAlpha = Math.round(alpha * 255)
    .toString(16)
    .toUpperCase()
    .padStart(2, '0');

  const colorFull =
    hexLength === 3
      ? hexColor
          .slice(1)
          .split('')
          .flatMap((x) => x + x)
          .join('')
      : hexColor.slice(1);
  return `#${colorFull}${hexAlpha}`;
}

export const ColorUtils = {
  getHexAlpha,
  getContrastColor,
  getContrastMode,
};
