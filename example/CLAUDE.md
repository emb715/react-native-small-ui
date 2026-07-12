# Example App — Agent Context

This is the example app for `react-native-small-ui`. It demonstrates the library
in real production-like UI. It is **not** a component library — it consumes one.

## Directory map

```
example/
  app/
    (tabs)/          ← tab entry screens (NavigationGrid only — no createComponent)
    showcase/        ← API demo screens (one feature per screen)
    kitchen-sink/    ← production UI screens (real layouts, multiple features combined)
  src/
    components/      ← shared app-level UI (ShowcaseSection, NavigationGrid, ColorModeToggle)
    design-system/
      primitives/    ← createComponent wrappers — the design system building blocks
      themed/        ← createComponent outputs that use _light/_dark for color mode
      utils.ts       ← cross-screen helpers (getBadgeTextColor, etc.)
    theme/           ← AppTheme type + registered theme objects
```

## Before writing any screen

**Read these files first** — they are the source of truth for primitive contracts:

- `src/design-system/primitives/Box.ts` — base styles for Box, HStack, VStack, Center
- `src/design-system/primitives/Card.ts` — base styles for Card.Header, Card.Body, Card.Footer
- `src/design-system/primitives/Button.ts` — intent and size variant values
- `src/design-system/primitives/Badge.ts` — intent variant values
- `src/design-system/primitives/Text.tsx` — AppText preset and weight variant values
- `src/design-system/utils.ts` — what cross-screen helpers already exist

## Key primitive contracts (check source for current values)

- `VStack` — `flexDirection:'column', gap:8`. **No `alignItems`**. Use `Center` for centering.
- `HStack` — `flexDirection:'row', alignItems:'center', gap:8`. Override gap via prop.
- `Center` — `alignItems:'center', justifyContent:'center'`. Use instead of `VStack alignItems="center"`.
- `Card.Footer` — base `justifyContent:'flex-end'`. Override via prop: `<Card.Footer justifyContent="space-between">`.

## Cross-screen helpers

Helpers used by more than one screen **must** live in `src/design-system/utils.ts`, not
inlined per screen. If you are writing a helper that a parallel screen will also need,
put it in utils first, then import it in both.

Current exports: `getBadgeTextColor`, `BadgeIntent`.

## ShowcaseSection

`ShowcaseSection` is for API demo screens under `showcase/` only. Do **not** use it in
`kitchen-sink/` screens — those are production UI, not annotated demos.

## Routing

- `(tabs)/` screens link out via `NavigationGrid` — no JSX beyond the items array.
- `showcase/` and `kitchen-sink/` screens declare their own title via `<Stack.Screen options={{ title: '...' }} />`.
- `kitchen-sink/` has its own `_layout.tsx` stack — mirror `showcase/_layout.tsx` if adding a new group.

## Pre-commit verification

After writing or modifying any file in `example/`, run from the repo root:

```bash
yarn typecheck && yarn format:check
```

`yarn format:check` catches prettier formatting errors — the most common failure in
agent-written code. If it fails, run `yarn format` to auto-fix, then re-stage.

The pre-commit hook blocks on ESLint **errors** only — warnings are expected and do not block.
Known warnings that appear on every commit (do not suppress):
- `react-native/no-inline-styles` on `contentContainerStyle` — ScrollView prop, unavoidable
- `react/no-unstable-nested-components` on `headerRight: () => <Component />` in `_layout.tsx` files

## Library invariants (enforced across all screens)

See the library SKILL.md at `../skills/react-native-small-ui/SKILL.md` for the full rule set.
Critical ones:

- `createComponent` / `createComponentGroup` / `.extend()` — **module scope only**, never inside a component
- `createComponentGroup` member with `variants` → flat style props must be in `base:` (silent drop otherwise)
- `useTheme()` returns `unknown` — always cast: `const theme = useTheme() as AppTheme`
- No `import React from 'react'` — project uses React 17+ JSX transform
