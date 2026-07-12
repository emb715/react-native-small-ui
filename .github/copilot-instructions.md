# react-native-small-ui — Copilot Instructions

A utility-first toolkit for React Native. NOT a component library — it provides
factories and hooks that developers use to build their own components.

## Core rules

- `createComponent`, `createComponentGroup`, `.extend()` — module scope ONLY,
  never inside a function component or render cycle
- When `variants` is present in a config, all flat style props must be inside `base:`
- `useTheme()` returns `unknown` — always cast: `const theme = useTheme() as AppTheme`
- No `import React from 'react'` — project uses React 18+ JSX transform
- The library's only runtime dependency is `zustand` — do not add others

## Entry points

```ts
import { createComponent, createPressable, configure, cs } from 'react-native-small-ui'
import { useColorMode, setColorScheme }                    from 'react-native-small-ui/colormode'
import { useBreakpointValue, useMediaQuery }               from 'react-native-small-ui/utils'
import { useTheme, registerTheme, ColorUtils }             from 'react-native-small-ui/theme'
import { elevation, shadow, layout, border }               from 'react-native-small-ui/presets'
import { renderWithSmallUI, teardownSmallUI }              from 'react-native-small-ui/testing'
```

## Before committing

```bash
yarn preflight   # typecheck + lint + test + bundle:check + prepare + size
```

## Source layout

```
src/
  smallUI.tsx          # createComponent factory
  createPressable.tsx  # _pressed/_hovered/_focused/_disabled
  config.store.ts      # _useSmallUIStore, configure()
  init.ts              # _autoInit, teardownSmallUI
  breakpoint.helpers.ts
  variant.helpers.ts
  factory.helpers.ts
  hooks/               # useColorMode, useTheme, useBreakpointValue, useMediaQuery, useOrientation
  utils/               # helpers, colors.utils, utils.style-props
  theme/               # theme.ts
```

## Agent skill

For detailed usage examples and API reference, load the Intent skill:
`npx @tanstack/intent load react-native-small-ui`
