export * from './colorGenerator';
export * from './colorPresets';

export function colorsToObject(colors: string[]) {
  return colors.reduce((acc, color, index) => {
    return {
      ...acc,
      [index * 100]: color,
    };
  }, {}) satisfies Record<number, string>;
}

// Example:
// const orange_light = generateColor(#f19918);
// const orange_dark = generateColor(#f19918, {
//   theme: 'dark',
// });
// colorsToObject(orange_dark)

// Use app https://color-palette.embthings.com/
