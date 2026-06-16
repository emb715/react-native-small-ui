const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Watch the workspace root so Metro sees the library source
config.watchFolders = [workspaceRoot];

// Resolve node_modules from both the example dir and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// SDK 55 / RN 0.83: package.json exports resolution
config.resolver.unstable_enablePackageExports = true;

// Condition resolution order:
// - 'source' first → workspace dev: resolves library TS source via source condition
// - 'browser' → react-native-web and web-targeting packages
// - 'require' → CJS builds (prevents ESM import.meta from reaching Hermes)
// - 'react-native' → RN-specific builds
// - 'default' → fallback
config.resolver.unstable_conditionNames = [
  'source',
  'browser',
  'require',
  'react-native',
  'default',
];

// Platform-specific condition overrides:
// When Metro bundles for 'web', assert the 'browser' condition so packages
// like react-native-web resolve their web-optimised entry points correctly.
config.resolver.unstable_conditionsByPlatform = {
  web: ['browser'],
};

// Point react-native-small-ui at the workspace root directory.
// Metro reads the package.json there, finds the exports map with source
// conditions, and resolves all imports (root + subpaths) from TS source.
config.resolver.extraNodeModules = {
  'react-native-small-ui': workspaceRoot,
};

module.exports = config;
