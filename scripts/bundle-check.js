#!/usr/bin/env node
/**
 * Bundle isolation check — asserts entry-point import graph boundaries.
 *
 * Uses esbuild's metafile to trace the import graph for each subpath entry
 * point. Exits 1 if any isolation violation is detected. CI-safe.
 *
 * Usage:  node scripts/bundle-check.js
 * Or:     yarn bundle:check
 */

'use strict';

const esbuild = require('esbuild');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ENTRY_POINTS = {
  core: path.join(SRC, 'index.tsx'),
  colormode: path.join(SRC, 'colormode.tsx'),
  utils: path.join(SRC, 'utils-exports.tsx'),
  theme: path.join(SRC, 'theme-exports.tsx'),
  testing: path.join(SRC, 'testing.tsx'),
  presets: path.join(SRC, 'presets.ts'),
};

async function buildMetafile(entryPoint) {
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    platform: 'node',
    external: [
      'react',
      'react-native',
      'react-native/*',
      'zustand',
      'zustand/*',
      '@testing-library/react-native',
    ],
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
  });
  return result.metafile;
}

function getImportedFiles(metafile) {
  return Object.keys(metafile.inputs).map((f) => f.replace(/\\/g, '/'));
}

async function runChecks() {
  let failed = false;

  // ─── 1. Run the actual metafile for each entry to discover the real graph ───
  const graphs = {};
  for (const [label, entryFile] of Object.entries(ENTRY_POINTS)) {
    try {
      const meta = await buildMetafile(entryFile);
      graphs[label] = getImportedFiles(meta);
      console.log(
        `[bundle-check] ${label}: ${graphs[label].length} files in graph`
      );
    } catch (err) {
      console.error(
        `[bundle-check] esbuild failed for ${label}:`,
        err.message
      );
      failed = true;
      graphs[label] = [];
    }
  }

  // ─── 2. Isolation rules ───────────────────────────────────────────────────
  // Each rule: { entry, forbidden: [substring] }
  // A file path in the graph that CONTAINS any forbidden substring fails the check.
  //
  // Hardened post-G8: G8 extracted init.ts and factory.helpers.ts from
  // smallUI.tsx. The forbidden lists below reflect the post-G8 import graph
  // verified by running esbuild metafile analysis on 2026-06-22.
  // Actual graph at time of hardening:
  //   utils  (8 files): breakpoints, config.store, useMediaQuery, useOrientation,
  //                     useBreakPointValue, matchMedia.polyfill, utils-exports
  //   colormode (4 files): colorMode.store, customColorMode.store, useColorMode,
  //                        colormode
  //   theme  (6 files): theme, theme.store, useTheme, colors.utils, helpers,
  //                     theme-exports
  //   presets (1 file): presets.ts only
  const ISOLATION_RULES = [
    {
      // ./utils must NOT pull in the component factory or any of its helpers.
      // utils entry only needs: config.store (for _useSmallUIStore), breakpoints,
      // breakpoint.helpers, useMediaQuery, useOrientation, useBreakPointValue.
      entry: 'utils',
      forbidden: [
        'smallUI.tsx',       // component factory + _autoInit side effect
        'factory.helpers',   // factory internals (G8 extraction)
        'variant.helpers',   // factory-internal variant resolution
        'init.ts',           // lifecycle boot (factory side effect)
        'createPressable',   // factory component
      ],
    },
    {
      // ./colormode must NOT pull in theme machinery.
      entry: 'colormode',
      forbidden: [
        'theme-exports',
        'theme.store',
        'ColorUtils',
        'colors.utils',
      ],
    },
    {
      // ./theme must NOT pull in the component factory or any of its helpers.
      // Theme should be independently usable without loading the factory.
      entry: 'theme',
      forbidden: [
        'smallUI.tsx',       // component factory
        'createPressable',   // factory component
        'factory.helpers',   // factory internals (G8 extraction)
        'init.ts',           // lifecycle boot (factory side effect)
      ],
    },
  ];

  for (const rule of ISOLATION_RULES) {
    const files = graphs[rule.entry] || [];
    for (const forbidden of rule.forbidden) {
      const matches = files.filter((f) => f.includes(forbidden));
      if (matches.length > 0) {
        console.error(
          `\n[bundle-check] FAIL: "${rule.entry}" imports forbidden module "${forbidden}":`
        );
        matches.forEach((m) => console.error(`  ${m}`));
        failed = true;
      }
    }
  }

  // ─── 3. Presets zero-import check ─────────────────────────────────────────
  // presets.ts must have NO library imports — it is pure plain objects.
  const presetsFiles = graphs['presets'] || [];
  // Filter out the entry file itself — only flag OTHER files pulled in.
  const presetsExtra = presetsFiles.filter(
    (f) => !f.includes('presets.ts') && !f.includes('presets.js')
  );
  if (presetsExtra.length > 0) {
    console.error(
      '\n[bundle-check] FAIL: presets has unexpected imports (must be zero-runtime):'
    );
    presetsExtra.forEach((v) => console.error(`  ${v}`));
    failed = true;
  }

  // ─── 4. Result ────────────────────────────────────────────────────────────
  if (failed) {
    console.error('\n[bundle-check] One or more isolation checks FAILED.');
    process.exit(1);
  } else {
    console.log('\n[bundle-check] All isolation checks passed ✓');
    process.exit(0);
  }
}

runChecks().catch((err) => {
  console.error('[bundle-check] Unexpected error:', err);
  process.exit(1);
});
