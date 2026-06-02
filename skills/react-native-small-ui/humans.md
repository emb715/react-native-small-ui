# react-native-small-ui skill — maintainer notes

Human-facing companion to SKILL.md. Never loaded as model context.

## What this skill covers

Consumer-facing usage of `react-native-small-ui` — the component factory API, color mode, responsive hooks, optional theming, and presets. It does not cover library internals or contributor workflows (those belong in CLAUDE.md).

## Source of truth

All API signatures and exports verified against source files at commit `69e9acd` (feat/expand-funtionality branch):

- `src/index.tsx` — core exports
- `src/colormode.tsx` — colormode subpath exports
- `src/utils-exports.tsx` — utils subpath exports
- `src/theme-exports.tsx` — theme subpath exports
- `src/smallUI.tsx` — createComponent, configure, variant config shape
- `src/hooks/useColorMode/useColorMode.tsx` — hook signatures and return types
- `src/hooks/useBreakPointValue/useBreakPointValue.tsx` — breakpoint resolution logic
- `src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts` — supported query features and units

## Structure decisions

**Why the import block comes first**
It's the most-looked-up thing in any session. A model that has the correct subpath immediately writes correct imports without guessing.

**Why createComponent gets the most space in SKILL.md**
It's the entry point to everything else in the library. Getting it right — especially module scope — unblocks the rest. Getting it wrong (calling inside render) produces a catastrophic failure that's hard to debug.

**Why `.extend()` has its own grounded antipattern**
The module-scope rule applies identically to `.extend()` but developers don't always connect them. A model that knows `createComponent` must be at module scope will still naturally write `Base.extend()` inside a `useMemo` or component body because it reads like a transformation, not a component definition. The antipattern makes the connection explicit.

**Why theming is marked optional in the heading**
The library has no default theme. A model that doesn't see "optional" will generate `registerTheme` boilerplate in every session where theme-related code appears, even when the consumer hasn't set up theming. Marking it optional suppresses that.

**Why docs/ files exist for variants, theming, responsive, presets**
These features have enough depth (variant config shape, named slots, breakpoint table, all preset keys) that inlining them in SKILL.md would push it well past the 180-line target and bury the 80% patterns under detail only needed occasionally.

**Why imports.md exists as a separate file**
The full export table — especially types — is long and rarely needed in full during a normal session. A model that needs `ComponentConfig` or `VariantProps` can follow the routing link. A model that doesn't need them doesn't pay the token cost.

## Footgun rationale

`createComponent` at module scope is the one footgun documented in SKILL.md because:
- The failure is catastrophic (unmount/remount every render, state/ref/animation loss)
- The failure is non-obvious (the component renders, just destroys internal state)
- It is the most natural mistake — every model writing a component will reach for `createComponent` inside the function body where it's used

`.extend()` is documented as a grounded antipattern (not a second footgun) because the failure mode is identical but secondary — you don't call `.extend()` without first understanding `createComponent`.

## Known gaps

- `createThemedComponent` is in the import block but has no dedicated example in SKILL.md — add to docs/variants.md if usage questions surface
- `getResolvedStyles` is in docs/imports.md but has no example — it's a testing/tooling utility, low consumer priority
- Custom color modes (`setCustomColorMode`, `configure({ colorModes })`) are in the import block and imports.md but have no example in SKILL.md — add to docs/theming.md if needed
- `utils-exports.tsx` still has a stale JSDoc comment: `"Bundle Impact: Includes css-mediaquery (~4KB)"` — this should be cleaned up in the source

## Maintenance checklist

When the library releases a new version, check:

1. `src/index.tsx`, `src/colormode.tsx`, `src/utils-exports.tsx`, `src/theme-exports.tsx` — any new or removed exports
2. `src/smallUI.tsx` — any changes to `createComponent` signature, variant config shape, or `configure()` options
3. `src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts` — any new supported query features or unit handling
4. Default breakpoint values in `src/smallUI.tsx` (`defaultBreakPoints`) — confirm they match the table in docs/responsive.md
5. Run `yarn test` — all 351 tests must pass before updating any signature in the skill

## Decision log

- **Removed anti-pattern wall** (session: feat/expand-funtionality) — original skill v1 had 13 `❌` lines naming things that don't exist. Removed entirely. An LLM that has never heard of `initSmallUI()` now knows to try it if it's in the skill.
- **Split docs/ structure** — adopted after identifying that variants, theming, responsive, and presets each have enough depth to fragment SKILL.md without adding value to the 80% case.
- **Removed identity paragraph** — "A component factory toolkit for React Native..." cut from SKILL.md top. The import block and first example convey this without prose.
- **Removed restatement comments** — six inline comments in SKILL.md that restated what the adjacent code already showed. Cut for token efficiency.
- **humans.md created** — per library-skill-builder process: SKILL.md is for models, humans.md is for maintainers.
