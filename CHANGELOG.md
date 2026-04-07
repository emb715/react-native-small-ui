# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **`configure(config)`** — Plain function for setting library options (e.g. custom breakpoints) at module level, replacing the need for `useSmallUI(config)`. Safe to call multiple times — options are merged.

  ```typescript
  import { configure } from 'react-native-small-ui';
  configure({ breakPoints: { sm: 600, md: 900, lg: 1200 } });
  ```

- **Auto-initialization** — The library now self-initializes on import. The `Appearance` listener for system light/dark detection is attached automatically with zero setup required.

- **`createThemedComponent(Component, themedStyles)`** — Factory that bridges `useTheme()` with `createComponent`. Receives the full theme snapshot in the style callback, re-evaluates styles when the active theme changes.

  ```typescript
  const ThemedCard = createThemedComponent(View, (theme) => ({
    _light: { backgroundColor: theme.colors.light.surface },
    _dark:  { backgroundColor: theme.colors.dark.surface },
  }));
  ```

- **Named multi-theme registry** — `registerTheme` now accepts an optional name as the first argument. Named themes are added to the registry without activating, enabling runtime theme switching.

  ```typescript
  registerTheme('ocean', { colors: { light: { brand: '#0af' }, dark: { brand: '#08c' } } });
  registerTheme('warm',  { colors: { light: { brand: '#f80' }, dark: { brand: '#c60' } } });
  setTheme('ocean'); // switch at runtime
  ```

- **`setTheme(name)`** — Activates a previously registered named theme. Throws in `__DEV__` with a descriptive error listing available themes if the name is not found.

- **`useThemeName()`** — Hook that returns the currently active theme name string.

- **`useTheme` selector overload** — `useTheme` now accepts an optional selector for granular subscriptions, avoiding unnecessary re-renders.

  ```typescript
  const lightColors = useTheme((t) => t.colors.light);
  const space = useTheme((t) => t.space);
  ```

### Changed

- **`useSmallUI`** — Marked `@deprecated`. No longer required. The library auto-initializes on import. Use `configure()` for custom options instead. Existing code calling `useSmallUI()` continues to work unchanged.

- **Theme validation** — Removed Zod schema validation. `registerTheme` now accepts any object shape as a theme config — no required tokens. This removes the `zod` runtime dependency and reduces bundle size.

- **`registerTheme` (unnamed)** — Backward-compatible: calling `registerTheme(config)` without a name still registers and immediately activates the theme as `'default'`.

### Removed

- **`zod`** runtime dependency — Dropped from `package.json`. Schema validation (`colors.schema.ts`) has been removed entirely.

- **`colors.schema.ts`** — File deleted. The `Palette` type is now inlined as `Record<string, Record<string, string>>` in `theme.ts`.
