import { getStatusBarStyle } from '../helpers';

describe('getStatusBarStyle', () => {
  test('should return light-content', async () => {
    const backgroundColor = '#000';
    const result = getStatusBarStyle(backgroundColor);
    expect(result).toBe('light-content');
  });
  test('should return dark-content', async () => {
    const backgroundColor = '#fff';
    const result = getStatusBarStyle(backgroundColor);
    expect(result).toBe('dark-content');
  });
});
