/**
 * Validates the package.json exports map.
 *
 * These tests catch the class of bug where:
 * - A subpath entry is missing the `source` condition (breaks Metro workspace resolution)
 * - A path in the exports map points to a file that doesn't exist (typo in package.json)
 * - The top-level `source` field diverges from the `.` export's source condition
 *
 * Tests run against the real package.json on disk — no mocks, no React, no RN.
 */

import fs from 'fs';
import path from 'path';

interface ExportsEntry {
  source?: string;
  types?: string;
  import?: string;
  require?: string;
  [key: string]: string | undefined;
}

const ROOT = path.resolve(__dirname, '..', '..');
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
  source?: string;
  exports: Record<string, ExportsEntry>;
};

const subpaths = Object.entries(pkg.exports);

describe('package.json exports map', () => {
  test('exports map exists and has at least one entry', () => {
    expect(pkg.exports).toBeDefined();
    expect(typeof pkg.exports).toBe('object');
    expect(subpaths.length).toBeGreaterThanOrEqual(1);
  });

  test('top-level source field matches the "." export source condition', () => {
    const dotSource = pkg.exports['.']?.source;
    expect(pkg.source).toBeDefined();
    expect(dotSource).toBeDefined();
    expect(pkg.source).toBe(dotSource);
  });

  describe('every subpath has a source condition', () => {
    test.each(subpaths)('%s has a source condition', (_subpath, entry) => {
      expect(entry.source).toBeDefined();
      expect(typeof entry.source).toBe('string');
      expect(entry.source!.length).toBeGreaterThan(0);
    });
  });

  describe('every source path exists on disk', () => {
    test.each(subpaths)('%s source file exists', (_subpath, entry) => {
      if (!entry.source) return; // caught by previous suite
      const abs = path.join(ROOT, entry.source);
      expect(fs.existsSync(abs)).toBe(true);
    });
  });

  describe('every types path follows lib/typescript pattern', () => {
    test.each(subpaths)(
      '%s types path is under lib/typescript',
      (_subpath, entry) => {
        if (!entry.types) return;
        expect(entry.types).toMatch(/^\.\/lib\/typescript\//);
      }
    );
  });

  describe('every import path is under lib/module', () => {
    test.each(subpaths)(
      '%s import path is under lib/module',
      (_subpath, entry) => {
        if (!entry.import) return;
        expect(entry.import).toMatch(/^\.\/lib\/module\//);
      }
    );
  });

  describe('every require path is under lib/commonjs', () => {
    test.each(subpaths)(
      '%s require path is under lib/commonjs',
      (_subpath, entry) => {
        if (!entry.require) return;
        expect(entry.require).toMatch(/^\.\/lib\/commonjs\//);
      }
    );
  });

  describe('known subpaths are all present', () => {
    const EXPECTED_SUBPATHS = [
      '.',
      './theme',
      './utils',
      './colormode',
      './testing',
      './presets',
    ];

    test.each(EXPECTED_SUBPATHS)('%s is present in exports map', (subpath) => {
      expect(pkg.exports[subpath]).toBeDefined();
    });

    test('no unexpected subpaths were added without source condition', () => {
      const missing = subpaths
        .filter(([, entry]) => !entry.source)
        .map(([subpath]) => subpath);
      expect(missing).toEqual([]);
    });
  });
});
