module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Polyfill import.meta.env → process.env so any ESM package
          // that leaks through Metro's CJS-first resolution is still safe on Hermes.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // react-native-small-ui is resolved by Metro via extraNodeModules +
      // the source condition in the library's package.json exports map.
      // No babel alias needed — module-resolver removed.
      'react-native-reanimated/plugin',
    ],
  };
};
