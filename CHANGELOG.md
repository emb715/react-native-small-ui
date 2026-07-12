# Changelog

Changelog is now generated automatically by [Release Please](https://github.com/googleapis/release-please) from conventional commit messages.

**Releases and changelogs are published to [GitHub Releases](https://github.com/emb715/react-native-small-ui/releases).**

---

## [0.4.0] — Archived entry

> This entry was written manually before the switch to Release Please.
> Future versions will have auto-generated entries in GitHub Releases.

### Added

- `configure(config)` — plain function replacing `useSmallUI(config)` for setting library options (breakpoints, platform registry, custom color modes). Safe to call multiple times — options are merged.
- Auto-initialization — library self-initializes on import. No setup hook required.
- `createThemedComponent(Component, (theme) => styles)` — factory that receives the active theme in the style callback.
- Named multi-theme registry — `registerTheme(name, config)` adds themes without activating; `setTheme(name)` switches at runtime.
- `setTheme(name)` — activates a registered named theme. Throws in `__DEV__` if name not found.
- `useThemeName()` — hook returning the active theme name string.
- `useTheme(selector)` — optional selector overload for granular subscriptions.
- Variant system — `variants`, `compoundVariants`, `defaultVariants` in `createComponent`.
- `.extend(styles)` — compose components without re-calling `createComponent`.
- `.withSlots(slots)` — dot-notation compound component pattern.
- `createComponentGroup(group)` — sibling components sharing reactive context.
- Platform registry — `configure({ platforms: { tablet: () => ... } })`.
- Custom color mode registry — `configure({ colorModes: { highContrast: true } })`.
- `setCustomColorMode(name)` / `clearCustomColorMode()` / `useCustomColorMode()`.
- `ctx` reactive style factory — `createComponent(View, (ctx) => ({ ... }))`.
- `ctx.breakpoint(values)` — responsive values inside the style factory.
- `cs()` — style merge utility, React Native equivalent of `cn()`.
- `getResolvedStyles()` — pure-function style resolver, no render needed.
- `__meta`, `__variants`, `__resolveStyles` — static introspection properties on every component.
- Style presets — `react-native-small-ui/presets` (`elevation`, `shadow`, `inset`, `text`, `layout`, `border`).
- Testing utilities — `react-native-small-ui/testing` (`renderWithSmallUI`, `assertStyles`).
- ESLint plugin — `no-createcomponent-in-render` rule.

### Changed

- `useSmallUI()` removed — library auto-initializes on import.
- `defaultProps` removed from `createComponent` — meta moves to position 3.
- Theme system is now shape-agnostic — no enforced token structure, no default colors.
- `registerTheme(config)` (unnamed) still registers and activates as `'default'`.

### Removed

- `zod` runtime dependency — never shipped; schema validation was planned but not implemented.
- `colors.schema.ts` — dropped with the opinionated theme system.
- `defaultProps` argument from `createComponent` and `createThemedComponent`.
