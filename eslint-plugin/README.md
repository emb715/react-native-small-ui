# eslint-plugin-react-native-small-ui

ESLint plugin for [react-native-small-ui](https://github.com/emb715/react-native-small-ui).

**Single focused rule:** detects `createComponent()` called inside React component bodies, hooks, or render methods — the most damaging misuse pattern.

## Why

Creating components inside a render cycle causes:

- New component identity on every render → React forces **unmount/remount** instead of update
- **Loss of state, refs, and animations** on every parent render
- Severe performance degradation

```jsx
// ❌ WRONG — triggers this rule
function MyComponent() {
  const Box = createComponent(View, { padding: 16 }); // ERROR
  return <Box />;
}

// ✅ CORRECT — module level, created once
const Box = createComponent(View, { padding: 16 });

function MyComponent() {
  return <Box />;
}
```

## Installation

```bash
npm install --save-dev eslint-plugin-react-native-small-ui
# or
yarn add -D eslint-plugin-react-native-small-ui
```

## Usage

### Flat config (`eslint.config.js` — ESLint v8+ / v9)

```js
import smallUI from 'eslint-plugin-react-native-small-ui';

export default [
  smallUI.configs.recommended,
  // ... your other configs
];
```

### Legacy config (`.eslintrc.js` — ESLint v7/v8)

```js
module.exports = {
  plugins: ['react-native-small-ui'],
  extends: ['plugin:react-native-small-ui/recommended-legacy'],
};
```

### Manual rule configuration

```js
// eslint.config.js
import smallUI from 'eslint-plugin-react-native-small-ui';

export default [
  {
    plugins: { 'react-native-small-ui': smallUI },
    rules: {
      'react-native-small-ui/no-createcomponent-in-render': 'error',
    },
  },
];
```

## Rules

| Rule                                                            | Description                                                                   | Recommended |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| [`no-createcomponent-in-render`](#no-createcomponent-in-render) | Disallow `createComponent()` inside component bodies / hooks / render methods | ✅ error    |

### `no-createcomponent-in-render`

Detects `createComponent(...)` called inside:

- Function components (functions with PascalCase names)
- Custom hooks (functions starting with `use`)
- Class component `render()` methods

**Options:**

```js
'react-native-small-ui/no-createcomponent-in-render': ['error', {
  // Additional function names to treat as createComponent calls.
  // Useful if you aliased createComponent in your codebase.
  additionalFunctionNames: ['createStyledComponent', 'styledView'],
}]
```

**Known limitation:** calls inside anonymous arrow functions passed to `useCallback`, `useMemo`, or similar are not detected because the nearest enclosing function is the anonymous arrow (no name → not a component). Don't use `createComponent` there either.

## License

MIT
