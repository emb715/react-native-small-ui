'use strict';

const noCreateComponentInRender = require('./rules/no-createcomponent-in-render');

const plugin = {
  meta: {
    name: 'eslint-plugin-react-native-small-ui',
    version: require('../package.json').version,
  },

  rules: {
    'no-createcomponent-in-render': noCreateComponentInRender,
  },

  configs: {},
};

// Recommended config — enables the single rule at 'error' severity.
plugin.configs.recommended = {
  plugins: {
    'react-native-small-ui': plugin,
  },
  rules: {
    'react-native-small-ui/no-createcomponent-in-render': 'error',
  },
};

// Legacy (eslintrc-style) flat config for older toolchains.
plugin.configs['recommended-legacy'] = {
  plugins: ['react-native-small-ui'],
  rules: {
    'react-native-small-ui/no-createcomponent-in-render': 'error',
  },
};

module.exports = plugin;
