/**
 * Tests for cs() — style merge utility.
 *
 * Coverage:
 *  1.  Merges two plain style objects
 *  2.  Last argument wins on key conflict
 *  3.  Falsy values (false, null, undefined, 0, '') are filtered out
 *  4.  Single argument returned as-is (merged into fresh object)
 *  5.  No arguments returns empty object
 *  6.  Works with underscore-prefixed keys (_light, _dark, custom)
 *  7.  Conditional pattern — common real-world usage
 */

import { cs } from '../utils/helpers';

describe('cs()', () => {
  test('merges two plain style objects', () => {
    const result = cs({ padding: 8 }, { margin: 4 });
    expect(result).toEqual({ padding: 8, margin: 4 });
  });

  test('last argument wins on key conflict', () => {
    const result = cs({ padding: 8 }, { padding: 16 });
    expect(result).toEqual({ padding: 16 });
  });

  test('three arguments — last wins on all conflicts', () => {
    const result = cs({ padding: 4 }, { padding: 8 }, { padding: 16 });
    expect(result).toEqual({ padding: 16 });
  });

  test('falsy values are filtered — false', () => {
    const result = cs({ padding: 8 }, false, { margin: 4 });
    expect(result).toEqual({ padding: 8, margin: 4 });
  });

  test('falsy values are filtered — null', () => {
    const result = cs({ padding: 8 }, null, { margin: 4 });
    expect(result).toEqual({ padding: 8, margin: 4 });
  });

  test('falsy values are filtered — undefined', () => {
    const result = cs({ padding: 8 }, undefined, { margin: 4 });
    expect(result).toEqual({ padding: 8, margin: 4 });
  });

  test('falsy values are filtered — 0 and empty string', () => {
    const result = cs({ padding: 8 }, 0, '', { margin: 4 });
    expect(result).toEqual({ padding: 8, margin: 4 });
  });

  test('single argument returns its properties in a fresh object', () => {
    const input = { padding: 8, borderRadius: 4 };
    const result = cs(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input); // new object
  });

  test('no arguments returns empty object', () => {
    const result = cs();
    expect(result).toEqual({});
  });

  test('works with underscore-prefixed keys', () => {
    const result = cs(
      { padding: 8 },
      {
        _light: { backgroundColor: '#fff' },
        _dark: { backgroundColor: '#000' },
      }
    );
    expect(result).toEqual({
      padding: 8,
      _light: { backgroundColor: '#fff' },
      _dark: { backgroundColor: '#000' },
    });
  });

  test('conditional pattern — common usage', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cs(
      { padding: 8, borderRadius: 4 },
      isActive && { borderColor: 'blue' },
      isDisabled && { opacity: 0.5 }
    );
    expect(result).toEqual({
      padding: 8,
      borderRadius: 4,
      borderColor: 'blue',
    });
  });

  test('all falsy — returns empty object', () => {
    const result = cs(false, null, undefined, 0, '');
    expect(result).toEqual({});
  });
});
