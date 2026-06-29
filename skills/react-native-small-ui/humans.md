# react-native-small-ui skill — maintainer notes

Human-facing companion to SKILL.md. Never loaded as model context.

## What this skill covers

Consumer-facing usage of `react-native-small-ui` — the component factory API, interactive state styles (createPressable), color mode, custom color modes, responsive hooks, optional theming, ColorUtils, and presets. It does not cover library internals or contributor workflows (those belong in CLAUDE.md).

## Source of truth

- `src/index.tsx` — core exports (createComponent, createComponentGroup, createPressable, configure, cs, getResolvedStyles)
- `src/createPressable.tsx` — createPressable implementation and _pressed/_hovered behavior
- `src/colormode.tsx` — colormode subpath exports
- `src/utils-exports.tsx` — utils subpath exports
- `src/theme-exports.tsx` — theme subpath exports
- `src/breakpoints.ts` — BreakPoints type and defaultBreakPoints (shared leaf module)
- `src/config.store.ts` — _useSmallUIStore, configure, InitConfig, PlatformRegistry, ColorModeRegistry
- `src/init.ts` — auto-init lifecycle, teardownSmallUI
- `src/smallUI.tsx` — createComponent, configure, variant config shape, ctx factory
- `src/smallUI.types.ts` — PressableConfig, ComponentConfig, VariantConfig types
- `src/utils/colors.utils.ts` — ColorUtils implementation (8 functions)
- `src/hooks/useColorMode/useColorMode.tsx` — hook signatures and return types
- `src/hooks/useBreakPointValue/useBreakPointValue.tsx` — exports useBreakpointValue (camelCase); file retains legacy PascalCase directory name
- `src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts` — supported query features and units

## Structure decisions

**Why createPressable gets its own section in SKILL.md**
`createComponent(Pressable, ...)` silently breaks pressed state — it's a footgun developers will hit the moment they try to build an interactive component. `createPressable` is the correct path; the skill must make that clear immediately.

**Why the import block comes first**
It's the most-looked-up thing in any session. A model that has the correct subpath immediately writes correct imports without guessing.

**Why createComponent gets the most space in SKILL.md**
It's the entry point to everything else in the library. Getting it right — especially module scope — unblocks the rest. Getting it wrong (calling inside render) produces a catastrophic failure that's hard to debug.

**Why the `base:` rule is documented in both SKILL.md and refs/variants.md**
The rule applies to both `createComponent` with variants and `createComponentGroup` members. A model reading only SKILL.md gets it; a model going deep into refs/variants.md gets it again with examples. Both placements are intentional.

**Why `.extend()` has its own grounded antipattern**
The module-scope rule applies identically to `.extend()` but developers don't always connect them. A model that knows `createComponent` must be at module scope will still naturally write `Base.extend()` inside a `useMemo` or component body because it reads like a transformation, not a component definition. The antipattern makes the connection explicit.

**Why theming is marked optional in the heading**
The library has no default theme. A model that doesn't see "optional" will generate `registerTheme` boilerplate in every session where theme-related code appears, even when the consumer hasn't set up theming. Marking it optional suppresses that.

**Why refs/ files exist for variants, theming, responsive, presets**
These features have enough depth (variant config shape, named slots, breakpoint table, all preset keys, ColorUtils API) that inlining them in SKILL.md would push it well past the target and bury the 80% patterns under detail only needed occasionally.

## Footgun rationale

`createComponent` at module scope is the one footgun documented in SKILL.md because:
- The failure is catastrophic (unmount/remount every render, state/ref/animation loss)
- The failure is non-obvious (the component renders, just destroys internal state)
- It is the most natural mistake — every model writing a component will reach for `createComponent` inside the function body where it's used

`createPressable` is documented as the correct Pressable wrapper because `createComponent(Pressable, ...)` silently passes a static style array — Pressable never receives pressed state. This is a silent failure, not a crash.

## Maintenance checklist

When the library releases a new version, check:

1. `src/index.tsx`, `src/colormode.tsx`, `src/utils-exports.tsx`, `src/theme-exports.tsx`, `src/testing.tsx` — any new or removed exports
2. `src/createPressable.tsx` — any changes to _pressed/_hovered resolution or PressableConfig shape
3. `src/smallUI.tsx` — any changes to `createComponent` signature, variant config shape, ctx factory, or `configure()` options
4. `src/utils/colors.utils.ts` — ColorUtils function list (currently 8: getHexAlpha, toRgba, getContrastColor, getContrastMode, getContrastRatio, darken, lighten, mix)
5. `src/hooks/useMediaQuery/matchMedia/matchMediaQuery.ts` — any new supported query features or unit handling
6. Default breakpoint values in `src/smallUI.tsx` (`defaultBreakPoints`) — confirm they match the table in refs/responsive.md
7. Run `yarn test` — confirm all tests pass before updating any signature in the skill

## Decision log

- **Removed anti-pattern wall** (session: feat/expand-funtionality) — original skill v1 had 13 `❌` lines naming things that don't exist. Removed entirely.
- **Split refs/ structure** — adopted after identifying that variants, theming, responsive, and presets each have enough depth to fragment SKILL.md without adding value to the 80% case.
- **Removed identity paragraph** — "A component factory toolkit for React Native..." cut from SKILL.md top. The import block and first example convey this without prose.
- **Removed restatement comments** — six inline comments in SKILL.md that restated what the adjacent code already showed. Cut for token efficiency.
- **humans.md created** — per library-skill-builder process: SKILL.md is for models, humans.md is for maintainers.
- **createPressable added** (this session) — new factory for Pressable wrapping with _pressed/_hovered. Added to SKILL.md, refs/imports.md.
- **ColorUtils expanded** (this session) — 3 → 8 functions. refs/imports.md and refs/theming.md updated.
- **base: rule generalized** (this session) — was documented only for createComponentGroup. Now documented for createComponent with variants too, in both SKILL.md and refs/variants.md.
- **Custom color modes documented** (this session) — previously a known gap in humans.md. Now in SKILL.md and refs/theming.md.
- **ctx factory documented** (this session) — previously not mentioned in skill. Added to SKILL.md.
- **v1.0.0 breaking changes** (session: v1-readiness) — getStatusBarStyle moved from core to ./theme; useBreakPointValue deprecated alias removed (canonical: useBreakpointValue); _teardownSmallUI renamed to teardownSmallUI and moved from core to ./testing.
- **ComponentGroup<T> type inference fixed** (session: v1-readiness) — GroupMemberProps<E> helper added; ComponentGroup<T> now maps to SmallUIComponent<ComponentProps<T[K]['Component']>> per key. Option A (mapped type) succeeded; Option B (asGroupMember helper) not needed.
- **colorMode.store lazy init** (session: v1-readiness) — getColorSchemeDefault() no longer called at module eval time. Store initializer is a function reference; Appearance is guarded for SSR safety.
- **Module split** (session: v1-readiness) — config.store.ts, breakpoints.ts, breakpoint.helpers.ts, variant.helpers.ts, init.ts, factory.helpers.ts extracted from smallUI.tsx. smallUI.tsx reduced to 879 lines.
- **Intent skill wired** (session: v1-readiness) — sources: field added to SKILL.md frontmatter; package.json keywords/files/intent config updated; @tanstack/intent added to devDependencies.

## Evaluation record

This skill predates the formal three-task evaluation requirement. Informal validation was performed throughout the session that produced it.

Formal evaluation to run before next significant update:
1. **Baseline** (without skill): ask the model to write a pressable button — verify it uses createComponent(Pressable) or TouchableOpacity without _pressed support
2. **Gap check** (with skill): same task — verify it uses createPressable with _pressed and _hovered
3. **Adjacent task** (with skill): ask the model to debug a React Native performance issue unrelated to this library — verify the skill does not inject irrelevant createComponent guidance
