---
name: react-native-small-ui-contributor
description: Use when editing files inside the react-native-small-ui library source (src/), contributing hooks, modifying smallUI.tsx, extending the matchMedia polyfill, working on MediaQueryList.native, or running the library's own test suite.
---

## Project Identity

- Working in: `libs/emb-tinybase/src/`
- Single runtime dep: `zustand` only — `package.json` dependencies must stay minimal
- Test command: `yarn test` · Lint: `yarn eslint src/` · Types: `npx tsc --noEmit`

## Internal Architecture

### matchMediaQuery — hand-rolled, no external dep

```
File: src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts
NOT css-mediaquery. That dependency was removed.
Supports: min/max-width, min/max-height, min/max-device-width, min/max-device-height, orientation
Units: px (default), rem and em converted at REM_PX = 16 (hardcoded — document any change)
Logic: comma = OR, `and` = AND, `not` prefix inverts the full segment result
Bare media types (screen, all): skipped (treated as matched) — not filtered by type identity
Unsupported features: return false — fail-safe, never throws
Empty/whitespace query: returns false (early guard at entry)
```

### MediaQueryList.native.ts — NativeMQL contract

```
File: src/hooks/useMediaQuery/matchMedia/MediaQueryList.native.ts

matches getter: LIVE-COMPUTED on every read
  → calls Dimensions.get('window') synchronously
  → derives orientation = width > height ? 'landscape' : 'portrait'
  → calls matchMediaQuery(this.query, { width, height, device-width, device-height, orientation })
  → NO cache. Do not add one without considering subscription invalidation.

_unmount(): removes the Dimensions.addEventListener('change', ...) subscription
  → MUST be called in useEffect cleanup or the subscription leaks permanently
  → Called via mq._unmount?.() — optional chaining is intentional (web impl has no _unmount)

addListener / removeListener: the real native API — used internally by the hook
addEventListener / removeEventListener / onchange / dispatchEvent: DOM compatibility STUBS
  → Present for structural typing against @types/react-native's MediaQueryList
  → Never called at runtime. Do not put logic in them.

orientation source for resize callback: data.screen (not data.window)
  → Intentional: screen dimensions are stable across soft keyboard events
  → Window dimensions shrink when keyboard opens; screen does not
```

### useMediaQuery.tsx — hook lifecycle contract

```
File: src/hooks/useMediaQuery/useMediaQuery.tsx

Single instance pattern: window.matchMedia() called ONCE inside useEffect, not during render
  → useState initializes to false
  → useEffect: const mq = window.matchMedia(query) as unknown as NativeMQL
  → setMatches(mq.matches) — sync initial value from the single instance
  → mq.addListener(onChange)
  → cleanup: mq.removeListener(onChange); mq._unmount?.();

_warnedNoMatchMedia: module-level flag (not instance-level)
  → Prevents console.warn spam across re-renders
  → Exposed as __resetWarnFlagForTesting for test isolation
  → __resetWarnFlagForTesting must NOT appear in any public barrel export
  → Tests that use it need to call it in beforeEach/afterEach for isolation

NativeMQL interface: typed intersection (not `as any`) for mq cast
  → Defined locally in useMediaQuery.tsx, not exported
  → Members: matches, media, addListener, removeListener, _unmount?
```

### discoverBreakpoints — definition-time static analysis

```
Called inside createComponent/createThemedComponent at module load time (never during render)
Runs a dry-run of the style factory with a recording StyleCtx proxy
Discovers which breakpoint keys the factory reads → fixes hook count for that component (Rules of Hooks)
Only referenced breakpoints get a useMediaQuery subscription — critical for render performance

CONTRACT: style factory functions must not throw unrecoverable exceptions when called with a dummy context
  → They will be called once with a proxy at definition time
  → Mutations to external state inside a style factory will execute during dry-run — do not do this
```

### Zustand store topology

```
_useSmallUIStore     → { init, config: { breakPoints, platforms, colorModes } }
useColorModeStore    → { colorMode: 'light' | 'dark' }
useThemeStore        → { themes: Record<string, unknown>, activeTheme: string }
useCustomColorModeStore → { activeMode: string | null }

These are four separate stores. Do not merge them.
_autoInit() at bottom of smallUI.tsx: attaches Appearance listener on first import
  → Guarded against double-init — do not remove the guard
```

### configure() merge semantics

```
configure({ breakPoints, platforms, colorModes }) merges SHALLOW:
  { ...current.config, ...config }

breakPoints is replaced entirely — not deep-merged.
configure({ breakPoints: { sm: 600 } }) drops all other breakpoints.
To extend defaults, the caller must spread: configure({ breakPoints: { ...DEFAULT_BREAKPOINTS, sm: 600 } })
```

### Style resolution merge order (later = higher priority)

```
colorModeStyle
  → generatedStyles.component
    → platformStyle
      → customPlatformStyle
        → customColorModeStyle
```

### Subpath bundle budget

```
core (src/index.tsx):        ~15KB — zustand only. No new runtime deps.
/colormode:                  ~18KB
/utils:                      ~22KB — matchMediaQuery.ts is internal (~0KB external)
/theme:                      size TBD (tinycolor removed) — ColorUtils is pure WCAG math
/presets:                    +0KB — plain objects, no runtime
/testing:                    dev only
```

## Contributor Anti-Patterns

```
// ❌ Adding any runtime dep to core (src/index.tsx subpath) — budget is ~15KB, zustand only
// ❌ Adding @ctrl/tinycolor back — it was removed; ColorUtils is pure hand-rolled WCAG math
// ❌ Importing css-mediaquery anywhere — it was removed; use matchMediaQuery.ts
// ❌ Calling window.matchMedia() during render (outside useEffect) — creates throwaway instances that leak Dimensions subscriptions
// ❌ Forgetting mq._unmount?.() in useEffect cleanup — Dimensions subscription leaks permanently
// ❌ Using addEventListener/removeEventListener on MediaQueryList.native — stubs, no-ops
// ❌ Reading mq.matches and caching it — it's live-computed; caching skips Dimensions updates
// ❌ Calling configure() inside a component or hook — it's not reactive; module level only
// ❌ Breaking the discoverBreakpoints dry-run — style factories must not throw with a proxy context
// ❌ Using useMediaQuery in a loop with a dynamic length — violates Rules of Hooks; existing usage in useBreakpointMatches uses a stable frozen array intentionally
// ❌ Exporting __resetWarnFlagForTesting from any barrel — test-only, must stay internal
// ❌ Deep-merging configure() options — it shallow-merges; partial breakPoints objects replace defaults entirely
// ❌ Removing the _autoInit() guard at bottom of smallUI.tsx — prevents double Appearance listener
```

## Test Infrastructure

```
Test runner: Jest with React Native preset
Existing suites: yarn test runs 23 suites, 351 tests
Target: yarn test src/hooks/useMediaQuery (runs matchMediaQuery + warnFlag suites)

Key test utilities:
  - renderWithSmallUI from /testing: store overrides via Zustand setState, not React Context providers
  - assertStyles from /testing: pure style resolver, no render needed
  - __resetWarnFlagForTesting from useMediaQuery.tsx: call in beforeEach for warn-flag test isolation

When adding a new hook or utility:
  1. Place tests alongside the source: src/hooks/<name>/__tests__/<name>.test.ts
  2. Adversarial cases required: boundaries, zero values, empty input, unmount behavior
  3. If the hook has a subscription (Dimensions, Appearance, etc.) — test that cleanup fires
```
