/**
 * Minimal Jest config for exports-map.test.ts only.
 *
 * This test uses only Node.js built-ins (fs, path) — no React, no RN, no JSX.
 * The repo's default jest config uses the react-native preset which requires
 * @react-native/babel-preset. That package is not installed at the lib root
 * (it lives in example/node_modules), which breaks the transform for every file.
 *
 * This override uses @babel/preset-env + @babel/preset-typescript to strip TypeScript
 * annotations without needing the full React Native toolchain.
 * @babel/preset-flow was previously used here but cannot parse TS `as` cast syntax.
 */

'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/exports-map.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-typescript'],
        ],
      },
    ],
  },
  // No setupFiles — this test needs no mocks, no zustand stubs, no RN mocks.
  setupFiles: [],
};
