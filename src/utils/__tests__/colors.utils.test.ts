// getHexAlpha
import { getHexAlpha } from '../colors.utils';

const mockConsoleWarn = jest.fn();
jest.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);

describe('getHexAlpha', () => {
  test('should pass test #000', async () => {
    const hexColor = '#000';
    const alpha = 0.5;
    const result = getHexAlpha(hexColor, alpha);
    expect(result).toBe('#00000080');
  });

  test('should pass test full hex #ff0000', async () => {
    const hexColor = '#ff0000';
    const alpha = 0.5;
    const result = getHexAlpha(hexColor, alpha);
    expect(result).toBe('#ff000080');
  });

  test('should warn about mal formed hex color', async () => {
    const hexColor = '000';
    const alpha = 0.5;
    const result = getHexAlpha(hexColor, alpha);
    expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
    expect(result).toBe(hexColor);
  });
});
