---
name: react-native-small-ui-contributor
description: Use when editing files inside the react-native-small-ui library source (src/), contributing hooks, modifying smallUI.tsx, extending the matchMedia polyfill, working on MediaQueryList.native, or running the library's own test suite.
---

# react-native-small-ui — Contributor Skill

## Project Identity

- Working directory: `libs/emb-tinybase/src/`
- **Single runtime dep: `zustand` only.** `package.json` dependencies must stay minimal.
- Test: `yarn test` · Lint: `yarn eslint src/` · Types: `npx tsc --noEmit`
- All three must exit 0 before any commit.

---

## Internal Architecture

### `matchMediaQuery` — hand-rolled, no external dep

```
File: src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts
NOT css-mediaquery. That dependency was removed.

Supports: min/max-width, min/max-height, min/max-device-width, min/max-device-height, orientation
Units:    px (default) · rem and em converted at REM_PX = 16 (hardcoded — document any change)
Logic:    comma = OR · `and` = AND · `not` prefix inverts the full segment result
Bare media types (screen, all): skipped (treated as matched), not filtered by type identity
Unsupported features: return false — fail-safe, never throws
Empty/whitespace query: returns false (early guard at entry)
Zero-value threshold (e.g. min-width: 0px): valid — guard is isNaN, not === 0
```

---

### `MediaQueryList.native.ts` — NativeMQL contract

```
File: src/hooks/useMediaQuery/matchMedia/MediaQueryList.native.ts

matches getter: LIVE-COMPUTED on every read
  → calls Dimensions.get('window') synchronously
  → derives orientation = width > height ? 'landscape' : 'portrait'
  → calls matchMediaQuery(this.query, { width, height, 'device-width', 'device-height', orientation })
  → NO cache. Do not add one without considering subscription invalidation.

_unmount(): removes the Dimensions.addEventListener('change', ...) subscription
  → MUST be called in useEffect cleanup — if not, the subscription leaks permanently
  → Called via mq._unmount?.() — optional chaining is intentional (web impl has no _unmount)

addListener / removeListener: the real native API — used internally by the hook
addEventListener / removeEventListener / onchange / dispatchEvent: DOM compatibility STUBS
  → Present for structural typing against @types/react-native's MediaQueryList interface
  → Never called at runtime. Do not put logic in them.

orientation source for resize callback: data.screen (not data.window)
  → Intentional: screen dimensions are stable across soft keyboard events
  → Window dimensions shrink when keyboard opens; screen does not
```

---

### `useMediaQuery.tsx` — hook lifecycle contract

```
File: src/hooks/useMediaQuery/useMediaQuery.tsx

Single instance pattern: window.matchMedia() called ONCE inside useEffect, not during render
  → useState initializes to false
  → useEffect:
      const mq = window.matchMedia(mediaQueryString) as unknown as NativeMQL;
      setMatches(mq.matches);   // sync initial value from the single instance
      mq.addListener(onChange);
      return () => {
        mq.removeListener(onChange);
        mq._unmount?.();        // removes Dimensions subscription on native
      };

_warnedNoMatchMedia: module-level flag (not instance-level)
  → Prevents console.warn spam across re-renders
  → Exposed as __resetWarnFlagForTesting for test isolation
  → __resetWarnFlagForTesting must NOT appear in any public barrel export
  → Tests that use it need beforeEach/afterEach calls for proper isolation

NativeMQL interface: typed cast (not `as any`) — defined locally, not exported
  → Members: matches, media, addListener, removeListener, _unmount?
```

---

### `discoverBreakpoints` — definition-time static analysis

```
Called inside createComponent / createThemedComponent at module load time (never during render)
Runs a dry-run of the style factory with a recording StyleCtx proxy
Discovers which breakpoint keys the factory reads → fixes hook count for that component (Rules of Hooks)
Only referenced breakpoints get a useMediaQuery subscription — critical for render performance

CONTRACT: style factory functions must not throw when called with a proxy context
  → They will be called once with a dummy context at definition time
  → Mutations to external state inside a style factory will execute during dry-run — never do this
```

---

### Zustand store topology

```
_useSmallUIStore        → { init, config: { breakPoints, platforms, colorModes } }
useColorModeStore       → { colorMode: 'light' | 'dark' }
useThemeStore           → { themes: Record<string, unknown>, activeTheme: string }
useCustomColorModeStore → { activeMode: string | null }

Four separate stores. Do not merge them.

_autoInit() at bottom of smallUI.tsx:
  → Attaches Appearance listener on first import
  → Guarded against double-init — do not remove the guard
```

---

### `configure()` merge semantics

```
configure({ breakPoints, platforms, colorModes }) merges SHALLOW:
  { ...current.config, ...config }

breakPoints is replaced entirely — not deep-merged.
configure({ breakPoints: { sm: 600 } }) drops all other breakpoints.
To extend defaults the caller must spread:
  configure({ breakPoints: { ...DEFAULT_BREAKPOINTS, sm: 600 } })
```

---

### Style resolution merge order (later = higher priority)

```
colorModeStyle
  → generatedStyles.component
    → platformStyle
      → customPlatformStyle
        → customColorModeStyle
```

---

### Subpath bundle budget

```
core (/index.tsx):   ~15KB — zustand only. No new runtime deps ever.
/colormode:          ~18KB
/utils:              ~22KB — matchMediaQuery.ts is internal (~0KB external dep)
/theme:              size TBD (tinycolor removed; ColorUtils is pure WCAG math)
/presets:            +0KB  — plain objects, zero runtime
/testing:            dev only
```

---

## Contributor Anti-Patterns

```
// ❌ Adding any runtime dep to core — budget is ~15KB, zustand only
// ❌ Adding @ctrl/tinycolor back — removed; ColorUtils is pure hand-rolled WCAG math
// ❌ Importing css-mediaquery anywhere — removed; use matchMediaQuery.ts
// ❌ Calling window.matchMedia() during render (outside useEffect) — leaks Dimensions subscriptions
// ❌ Forgetting mq._unmount?.() in useEffect cleanup — Dimensions subscription leaks permanently
// ❌ Using addEventListener/removeEventListener on MediaQueryList.native — stubs, no-ops at runtime
// ❌ Reading mq.matches and caching it — live-computed; caching skips Dimensions updates
// ❌ Calling configure() inside a component or hook — not reactive; module level only
// ❌ Breaking the discoverBreakpoints dry-run — style factories must not throw with a proxy context
// ❌ useMediaQuery in a loop with a dynamic length — violates Rules of Hooks
//    (existing usage in useBreakpointMatches uses a stable frozen array intentionally)
// ❌ Exporting __resetWarnFlagForTesting from any barrel — test-only, must stay internal
// ❌ Partial breakPoints in configure() expecting a merge — it replaces, not extends
// ❌ Removing the _autoInit() guard at bottom of smallUI.tsx — prevents double Appearance listener
// ❌ Casting mq as `any` — use `as unknown as NativeMQL` with the typed interface
```

---

## Test Infrastructure

```
Runner:   Jest with React Native preset
Suites:   23 suites, 351 tests — all must stay green
Target:   yarn test src/hooks/useMediaQuery

Key utilities:
  renderWithSmallUI  — store overrides via Zustand setState, NOT React Context providers
  assertStyles       — pure style resolver, no render needed
  __resetWarnFlagForTesting — call in beforeEach for warn-flag test isolation

When adding a hook or utility:
  1. Place tests at: src/hooks/<name>/__tests__/<name>.test.ts
  2. Required: boundaries, zero values, empty input, unmount behavior
  3. If the hook has a subscription (Dimensions, Appearance) — test that cleanup fires on unmount
```
