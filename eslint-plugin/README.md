# eslint-plugin-react-native-small-ui

ESLint plugin for [react-native-small-ui](https://github.com/emb715/react-native-small-ui).

**Single focused rule** that detects all react-native-small-ui component factory calls made inside React component bodies, hooks, or render methods — the most damaging misuse pattern.

## Why

Every call that creates a new component type inside a render cycle causes:

- New component **identity** on every render → React forces **unmount/remount** instead of update
- **Loss of state, refs, and animations** on every parent render
- Severe **performance degradation**

```jsx
// ❌ WRONG — triggers this rule
function MyComponent() {
  const Box = createComponent(View, { padding: 16 });         // ERROR
  const Card = Base.extend({ borderRadius: 8 });              // ERROR
  const { Row } = createComponentGroup({ Row: { ... } });    // ERROR
  return <Box />;
}

// ✅ CORRECT — all at module level, created once
const Box = createComponent(View, { padding: 16 });
const Card = Base.extend({ borderRadius: 8 });
const { Row } = createComponentGroup({ Row: { ... } });

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

| Rule                                                            | Description                                                                       | Recommended |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------- |
| [`no-createcomponent-in-render`](#no-createcomponent-in-render) | Disallow component factory calls inside component bodies / hooks / render methods | ✅ error    |

### `no-createcomponent-in-render`

Detects the following calls made inside:

- Function components (PascalCase names)
- Custom hooks (`use*` names)
- Class component `render()` methods

**Detected factory functions** (bare calls):

| Call                         | Why it's caught                                |
| ---------------------------- | ---------------------------------------------- |
| `createComponent(...)`       | Core factory — new component type every render |
| `createComponentGroup(...)`  | Returns multiple new component identities      |

**Detected chained methods** (MemberExpression calls):

| Call               | Why it's caught                      |
| ------------------ | ------------------------------------ |
| `Base.extend(...)` | Creates a new derived component type |

**Options:**

```js
'react-native-small-ui/no-createcomponent-in-render': ['error', {
  // Additional bare function names to treat as component factories.
  // Useful if you aliased createComponent or createComponentGroup.
  additionalFunctionNames: ['createStyledComponent', 'myFactory'],

  // Additional method names (on a MemberExpression receiver) to treat
  // as component factories. Defaults cover .extend().
  additionalMethodNames: ['customExtend', 'withBase'],
}]
```

**Chained calls — both violations reported:**

When `.extend()` is chained directly on an inline `createComponent(...)` call inside a component, both violations are reported independently:

```jsx
function MyComponent() {
  // Two errors:
  //   1. .extend() creates a new derived component on every render
  //   2. createComponent() creates a new base component on every render
  const Card = createComponent(View, {}).extend({ borderRadius: 8 });
}
```

**Known limitation:** Calls inside anonymous arrow functions passed to `useCallback`, `useMemo`, or similar are not detected because the nearest enclosing function is the anonymous arrow (no name → not identifiable as a component). Don't call factory functions there either — move them to module level.

```jsx
// Not detected (documented limitation) — still incorrect, move to module level
function MyComponent() {
  const x = useCallback(() => {
    const Box = createComponent(View, {}); // not flagged ← limitation
  }, []);
}
```

**False positives:** `.extend()` is flagged on any receiver object inside a component body. If you have unrelated code that calls `.extend()` inside a component for a different purpose, use `// eslint-disable-next-line react-native-small-ui/no-createcomponent-in-render` to suppress it.

## License

MIT
