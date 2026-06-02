---
name: library-skill-builder
description: Use when creating or rewriting an opencode skill for a software library, framework, or tool. Triggers on "create a skill for X", "write a skill for Y", "generate a skill from the docs", or "refactor this skill".
---

# library-skill-builder

A process for turning a library's source of truth into a well-structured opencode skill.

## Skill quality checklist

A good skill is:

- **Concise** — every line earns its place
- **Responsible for one thing** — not a multi-step workflow
- **Composable** — routes to `docs/` files instead of dumping everything inline
- **Progressively disclosed** — SKILL.md covers the 80% case, depth lives in `docs/`
- **Harness-agnostic** — works regardless of which AI tool loads it
- **Well-documented** — the skill itself explains its own structure and routing table
- **Portable** — no assumptions about the consumer's project structure
- **Secure** — never instructs the model to output secrets, tokens, or credentials; redacts sensitive values in examples
- **Affirmative** — describes what the library does, not what it doesn't have

---

## Process

### Step 1 — Find the source of truth

Read the library's actual exports before reading any documentation.

For a local library: read index files and barrel exports directly.
For a published library: read the official docs, changelog, and TypeScript definitions — in that order. Official docs over blog posts, types over docs where they conflict.

What to capture:
- Every public export, grouped by entry point / subpath
- The exact type signatures of the 5–10 most-used APIs
- Any subpath structure (`/utils`, `/theme`, `/colormode`) that affects imports

### Step 2 — Find the one footgun

Every non-trivial library has one pattern that looks harmless but causes catastrophic or subtle failure. This earns a warning in the skill. Everything else does not.

Signals that something is a real footgun:
- The failure is **non-obvious** — it works initially, breaks later, or breaks in ways that are hard to trace
- The failure is **severe** — data loss, state destruction, memory leaks, silent wrong output
- Developers **naturally write the wrong version** — the error is the path of least resistance

Examples by category:
- **React**: `createComponent` inside a render function (new type every render → unmount/remount)
- **Async**: fire-and-forget mutations without error handling
- **State**: reading derived state instead of subscribing to it
- **Types**: casting `unknown` to a concrete type without validating

One footgun per skill. If you find more than one, rank by severity and document only the top one in the main SKILL.md. The rest can go in `docs/`.

### Step 3 — Audit existing docs or skill (if rewriting)

If a skill or documentation already exists, compare it against the source of truth found in Step 1.

Look for:
- APIs documented that no longer exist
- APIs that exist but are not documented
- Type signatures that don't match reality (`null` in a return type that's never null)
- Warnings about things that don't exist (the AI now knows to try them)
- Bundle/version claims that are stale

Do not carry forward any claim you cannot verify from the source of truth.

### Step 4 — Decide the structure

**SKILL.md** covers:
- One-sentence identity (what the library does, not what it isn't)
- Import paths — the thing developers look up most
- The 3–5 most-used APIs with minimal working examples
- The one footgun with a correct alternative
- Explicit routes to `docs/` files for depth

**`docs/` files** cover (one file per concern):
- Full API tables for each subpath
- Detailed feature examples (variants, theming, routing patterns)
- Configuration options
- Anything that would only be needed by someone already using the feature

Naming is by concern, not by API:
- `docs/imports.md` — full export reference
- `docs/routing.md` — routing patterns (Expo Router)
- `docs/theming.md` — theme system depth
- `docs/variants.md` — variant config
- `docs/data-fetching.md` — fetching patterns (React Query, SWR, etc.)

### Step 5 — Write affirmatively

Every sentence describes what the library does and how to use it correctly.

**Do not include:**
- Lists of APIs that don't exist
- Warnings about removed features
- "Note: X is not supported" unless X is something developers will actively reach for and the absence is genuinely non-obvious

**The test:** if a developer has never seen the library before, does the skill give them enough to write correct code? If yes, it's ready.

### Step 6 — Write the trigger description

The `description` field in the frontmatter controls when the skill auto-activates. It should name:
- The library's package name (e.g. `react-native-small-ui`, `expo-router`, `react`)
- The 4–6 most common function/hook names a developer would type
- The task contexts that indicate the library is in use

```yaml
description: Use when writing React components with useState, useEffect, useContext,
  or building with React 19. Triggers on React server components, actions, use(),
  or the transition API.
```

Avoid generic phrases like "when working with JavaScript" — the description must be specific enough to not false-trigger on unrelated sessions.

---

## Output structure

```
skills/<library-name>/
├── SKILL.md              ← trigger + identity + import paths + 80% patterns + footgun + routes
└── docs/
    ├── imports.md        ← full export table by entry point
    ├── <concern-a>.md    ← depth for feature A
    ├── <concern-b>.md    ← depth for feature B
    └── ...
```

SKILL.md target: 100–180 lines
Each docs file target: 60–100 lines
Total cap: ~600 lines across all files

---

## Routing table pattern

At the end of each section in SKILL.md that has a corresponding `docs/` file:

```md
→ See [docs/theming.md](docs/theming.md) for named themes, selectors, and runtime switching.
```

One line. Points to the file. Describes what's there in 5–10 words so the model knows whether to follow it.

---

## Example: applying this to a new library

**React 19:**
1. Source of truth: react.dev/reference, TypeScript types in `@types/react`
2. Footgun: calling `use()` conditionally (violates Rules of Hooks in a new, non-obvious way)
3. Structure: SKILL.md covers hooks + `use()` + actions; `docs/` covers server components, transitions, `useOptimistic`, `useFormStatus`

**Expo Router:**
1. Source of truth: expo.github.io/router, file-system routing conventions, `expo-router` package exports
2. Footgun: using `router.push()` with a hardcoded string instead of typed routes (breaks at rename, no TS error without `expo-router/types`)
3. Structure: SKILL.md covers file conventions + `Link` + `useRouter`; `docs/` covers layouts, groups, dynamic segments, API routes, typed routes
