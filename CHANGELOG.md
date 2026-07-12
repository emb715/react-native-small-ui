# Changelog

Changelog is now generated automatically by [Release Please](https://github.com/googleapis/release-please) from conventional commit messages.

**Releases and changelogs are published to [GitHub Releases](https://github.com/emb715/react-native-small-ui/releases).**

---

## [1.0.0](https://github.com/emb715/react-native-small-ui/compare/v0.3.7...v1.0.0) (2026-07-12)


### ⚠ BREAKING CHANGES

* none — public API unchanged

### Features

* add docs ([6f300c2](https://github.com/emb715/react-native-small-ui/commit/6f300c2ab4f9b46737152c84de7760532d95a98e))
* expand funtionality ([#5](https://github.com/emb715/react-native-small-ui/issues/5)) ([2582bd2](https://github.com/emb715/react-native-small-ui/commit/2582bd2188992cf96dbafe1f0d354443948e5b48))


### Bug Fixes

* **ci:** install docs dependencies before building docs site ([829423f](https://github.com/emb715/react-native-small-ui/commit/829423f0b2b65d13caf0264e836888dbc95e4c34))
* **deps:** pin @babel/plugin-transform-modules-systemjs 7.29.4 (high CVE-193) ([3446633](https://github.com/emb715/react-native-small-ui/commit/3446633532d5b588464940b9cfc4190cf03fe0a2))
* **deps:** upgrade shell-quote (critical CVE) ([db003fb](https://github.com/emb715/react-native-small-ui/commit/db003fb79ae5e407356cf49140116325613e2ded))
* docs build library ([a37d515](https://github.com/emb715/react-native-small-ui/commit/a37d515ebc7c6bf4953e64e6a2e1c9549eb0e52a))
* harden deps, ci pipeline, and lint scope ([fd679e6](https://github.com/emb715/react-native-small-ui/commit/fd679e606f5ebb3704d309db2d6e336ed3d31a3e))
* **hooks:** remove slow size check from pre-push, point size-limit to built output" ([6259bda](https://github.com/emb715/react-native-small-ui/commit/6259bdaf693480d7375b19c26fc97e05910810cb))
* index button href ([1a7d20f](https://github.com/emb715/react-native-small-ui/commit/1a7d20fe43b5139fbe1c161a7997468db3527745))
* update test, check for keys instead of matching 1 to 1 with expected array ([904cf21](https://github.com/emb715/react-native-small-ui/commit/904cf214629a282ab8fe49a2477192de6cc6b305))

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
