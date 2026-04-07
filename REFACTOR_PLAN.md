# Theming
Give users control over the design token piece that other libraries have — but lock you in to.

A lightweight, modular way to define and access your own design tokens — with the same capabilities as NativeBase/Restyle/Tamagui's theming, but without their constraints, schema, or coupling to components.


##### The key sentence that should drive everything forward:

> "Define tokens once, register them once, get them back fully typed and color-mode-aware, everywhere — no schema, no casting, no ceremony."

# Modular Export Structure Refactor Plan

## Goal
Create separate import paths so developers only import what they need, achieving true "utilities without constraints."

## Problem Statement
Currently, importing any part of the library imports everything, including:
- Heavy dependencies (zod, @ctrl/tinycolor)
- Optional features (theme system, responsive utilities)
- Unused code for minimal use cases

This contradicts the "utilities without constraints" philosophy.

## Proposed Solution

### New Import Structure

```typescript
// CORE - Minimal, zero theme overhead
import { createComponent, useSmallUI } from 'react-native-small-ui';

// THEME - Optional theming system (includes zod, color generation, etc.)
import { useTheme, registerTheme, getTheme, ColorUtils } from 'react-native-small-ui/theme';

// UTILS - Optional responsive utilities
import { useBreakPointValue, useMediaQuery, useOrientation } from 'react-native-small-ui/utils';

// COLOR MODE - Standalone color mode (no theme dependency)
import { useColorMode, useColorModeValue, setColorScheme, toggleColorScheme } from 'react-native-small-ui/colormode';
```

## Current State Analysis

### Zod Usage
- ✅ Only used in `src/theme/colors.schema.ts`
- ✅ Only imported in `src/theme/theme.ts`
- ✅ Easy to isolate to theme package

### Lodash-es
- ✅ Already removed

### Dependencies Breakdown
- `zustand` (4.5.4) - ~3KB - Core state management ✅ Keep in core
- `@ctrl/tinycolor` (4.1.0) - ~47KB - Color manipulation → Move to theme
- `css-mediaquery` (0.1.2) - ~4KB - Media query parsing → Move to utils
- `zod` (3.23.8) - ~57KB - Schema validation → Move to theme

## Implementation Tasks

### Phase 1: Refactor Export Structure
- [x] Audit zod usage - only in theme, easy to remove/make optional
- [ ] Create `src/colormode.tsx` - Export color mode hooks
- [ ] Create `src/theme-exports.tsx` - Export theme system
- [ ] Create `src/utils-exports.tsx` - Export responsive utilities
- [ ] Refactor `src/index.tsx` - Core only (createComponent, useSmallUI)

### Phase 2: Package Configuration
- [ ] Update `package.json` exports field for subpath exports
- [ ] Verify TypeScript types generation for each export path
- [ ] Update `tsconfig.build.json` if needed for multi-entry builds
- [ ] Test build output with `yarn prepare`

### Phase 3: Documentation & Examples
- [ ] Update main README with new import structure
- [ ] Add bundle size impact documentation
- [ ] Create migration guide (old imports still work)
- [ ] Create examples:
  - Core-only usage (minimal)
  - Core + ColorMode
  - Core + Utils (responsive)
  - Core + Theme (full features)
  - Everything combined

### Phase 4: Testing & Validation
- [ ] Test tree-shaking works correctly for each export
- [ ] Measure actual bundle sizes for each import combination
- [ ] Test TypeScript autocomplete for each import path
- [ ] Verify backward compatibility (old imports still work)
- [ ] Run existing tests to ensure nothing broke

## Detailed Implementation

### File Structure

```
src/
├── index.tsx                    # Core exports only
├── colormode.tsx                # Color mode exports
├── theme-exports.tsx            # Theme system exports
├── utils-exports.tsx            # Responsive utilities exports
├── smallUI.tsx                  # Core implementation (unchanged)
├── hooks/
│   ├── useColorMode/           # Color mode implementation
│   ├── useTheme/               # Theme implementation
│   ├── useOrientation/         # Responsive utilities
│   ├── useMediaQuery/
│   └── useBreakPointValue/
├── theme/                       # Theme system (unchanged)
└── utils/                       # Utilities (unchanged)
```

### package.json exports

```json
{
  "exports": {
    ".": {
      "types": "./lib/typescript/src/index.d.ts",
      "import": "./lib/module/index.js",
      "require": "./lib/commonjs/index.js"
    },
    "./theme": {
      "types": "./lib/typescript/src/theme-exports.d.ts",
      "import": "./lib/module/theme-exports.js",
      "require": "./lib/commonjs/theme-exports.js"
    },
    "./utils": {
      "types": "./lib/typescript/src/utils-exports.d.ts",
      "import": "./lib/module/utils-exports.js",
      "require": "./lib/commonjs/utils-exports.js"
    },
    "./colormode": {
      "types": "./lib/typescript/src/colormode.d.ts",
      "import": "./lib/module/colormode.js",
      "require": "./lib/commonjs/colormode.js"
    }
  }
}
```

### New Core exports (src/index.tsx)

```typescript
// Core component creation utilities
export { createComponent, useSmallUI } from './smallUI';
export type { ComponentStyle } from './smallUI.types';

// Helper utilities that don't require heavy dependencies
export * from './utils/helpers';
```

### Color Mode exports (src/colormode.tsx)

```typescript
export {
  useColorMode,
  useColorModeValue,
  setColorScheme,
  toggleColorScheme,
} from './hooks/useColorMode/useColorMode';
```

### Theme exports (src/theme-exports.tsx)

```typescript
export type { ThemeConfig } from './theme/theme';
export { useTheme, getTheme, registerTheme } from './hooks/useTheme/useTheme';
export { ColorUtils } from './utils/colors.utils';

// Re-export theme types for convenience
export type { ThemeColors, Palette } from './theme/colors.schema';
```

### Utils exports (src/utils-exports.tsx)

```typescript
export { useOrientation } from './hooks/useOrientation';
export { useMediaQuery } from './hooks/useMediaQuery/useMediaQuery';
export { useBreakPointValue } from './hooks/useBreakPointValue/useBreakPointValue';
```

## Expected Bundle Size Impact

| Import Combination | Estimated Size | Dependencies Included |
|-------------------|----------------|----------------------|
| Core only | ~15KB | zustand |
| Core + ColorMode | ~18KB | zustand |
| Core + Utils | ~22KB | zustand, css-mediaquery |
| Core + Theme | ~122KB | zustand, zod, tinycolor |
| Everything | ~125KB | All |

## Migration Path

### Old Way (still supported for backward compatibility)
```typescript
import {
  createComponent,
  useTheme,
  useBreakPointValue
} from 'react-native-small-ui';
```

### New Way (recommended)
```typescript
import { createComponent } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import { useBreakPointValue } from 'react-native-small-ui/utils';
```

## Benefits

✅ Zero overhead for minimal use cases
✅ Tree-shaking works automatically
✅ Clear separation of concerns
✅ Users choose their bundle size
✅ Theme system becomes truly optional
✅ Aligns with "utilities without constraints" philosophy
✅ Better developer experience with focused imports
✅ Easier to understand what features are being used

## Backward Compatibility

To maintain backward compatibility, we can keep the old exports in `src/index.tsx` but mark them as deprecated:

```typescript
// Legacy exports (deprecated)
/**
 * @deprecated Import from 'react-native-small-ui/theme' instead
 */
export { useTheme, getTheme, registerTheme } from './hooks/useTheme/useTheme';
```

This allows gradual migration without breaking existing codebases.

## Success Metrics

- [ ] Core-only import is under 20KB (minified + gzipped)
- [ ] TypeScript autocomplete works for all import paths
- [ ] All existing tests pass
- [ ] Tree-shaking eliminates unused code
- [ ] Documentation clearly shows bundle impact
- [ ] Example app demonstrates all import patterns

## Timeline

- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Phase 3: 2-3 hours
- Phase 4: 1-2 hours

**Total estimated time**: 6-10 hours

## Notes

- Consider removing zod entirely if theme validation can be done with TypeScript
- @ctrl/tinycolor could potentially be replaced with a lighter color library
- Future: Consider publishing as a monorepo with separate packages (@react-native-small-ui/core, @react-native-small-ui/theme, etc.)
