# Web E2E Runbook (agent-browser / SSR Hydration)

**Scope:** Local validation only — runs against the Expo web build of the example app.
**Tool:** agent-browser 0.31.2 (https://github.com/agentbrowserhq/agent-browser)
**Runner:** Local (`agent-browser` CLI or MCP) — not in CI
**When to run:** After any change to `useMediaQuery`, `useBreakPointValue`, or `useOrientation`. After any `useSyncExternalStore` change. Before cutting a release tag (alongside the Maestro suite). When a hydration bug is reported on the docs site.

<!--
  Why this matters — the class of bug this suite exists to catch:

  React error #418 (hydration mismatch) was reported on
  https://small-ui.embthings.com/example/responsive when clicking "Breakpoint Value".

  Root cause: useMediaQuery used useState(false) + useEffect.
  SSR always rendered false. The client rendered the real matchMedia value.
  React saw a mismatch between server HTML and client VDOM → #418.

  Fix: useSyncExternalStore with getServerSnapshot: () => false.
  The server snapshot always returns false; the client snapshot returns the real value.
  React knows the snapshots differ by design and does not error.

  Jest and Maestro both run in a fully-initialized client environment.
  Neither can reproduce a real SSR/hydration cycle.
  agent-browser tests the actual Expo web/SSR output in a real Chrome instance.
-->

---

## Setup

### 1. Install agent-browser

agent-browser is already installed globally at version 0.31.2. If reinstalling:

```bash
npm install -g agent-browser
agent-browser install
```

Chrome is installed at `~/.agent-browser/browsers/chrome-150.0.7871.124`. The `install` subcommand places it there — no manual Chrome installation needed.

### 2. Activate MCP (opencode-driven mode)

The MCP entry lives in `~/.config/opencode/opencode.json` under key `"agent-browser"`. By default `enabled` is `false` — the server does not start with opencode.

To let the model drive the browser directly:

1. Open `~/.config/opencode/opencode.json`
2. Set `"enabled": true` under `"agent-browser"`
3. Restart opencode

With MCP active, every `agent-browser_*` tool is available to the model in-session. No sub-agent is needed. Flip `enabled` back to `false` when not running web tests — the browser process adds startup overhead to every session.

### 3. Start the web server

The server must be running before any `agent-browser` command. The test protocol uses Metro's built-in web server via the Expo CLI:

```bash
cd example
yarn web --port 8081 &
```

Wait for HTTP 200 before running tests:

```bash
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 2>/dev/null)
  if [ "$CODE" = "200" ]; then echo "Server ready"; break; fi
  sleep 1
done
```

First compile after a clean install can take 60–90 seconds. If the loop exits without printing "Server ready", increase the iteration count from 30 to 90.

---

## Flow inventory

| Check | Pass condition | What it catches |
|---|---|---|
| `agent-browser errors` after clicking nav item | `errors: []` | React hydration mismatches (#418), uncaught JS exceptions |
| `agent-browser get text body` | contains expected column/fontSize/padding values | Render failures, wrong hook values, blank page |
| `agent-browser errors` after viewport resize × 3 | `errors: []` | Breakpoint re-subscription bugs, stale matchMedia listeners |
| `agent-browser vitals --json` | `cls: 0.0`, no Errored phases | Layout shift from hydration, failed render lifecycle |

---

## What this proves that other tests cannot

- **SSR hydration correctness.** Jest and Maestro both run in a fully-initialized client environment. `useState(false)` initializes the same way in both — the mismatch only surfaces when a real server renders HTML with one value and the client hydrates with another. `agent-browser` tests the actual Expo web/SSR output.

- **`window.matchMedia` availability at render time.** Unit tests mock `matchMedia` synchronously. In a real browser, `matchMedia` is available but the initial render may have already committed before `useEffect` fires — `useSyncExternalStore` solves this, but only a real browser can confirm it.

- **Cross-viewport reactivity without remount.** Maestro tests fixed device screen sizes. `agent-browser set viewport` resizes mid-session and checks that breakpoint hooks resubscribe correctly without erroring.

- **React DevTools hydration phases.** `agent-browser vitals --json` reads the React DevTools hydration timeline directly. "Errored" phases in the output indicate a hydration failure that may not surface as a visible error in the page.

---

## Running the protocol

Run the steps in order. Each step's output determines whether to proceed.

### Step 1 — Start server

```bash
cd example
yarn web --port 8081 &
# Wait for HTTP 200
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 2>/dev/null)
  if [ "$CODE" = "200" ]; then echo "Server ready"; break; fi
  sleep 1
done
```

### Step 2 — Open with React DevTools

```bash
agent-browser open --enable react-devtools http://localhost:8081/responsive
agent-browser wait --load networkidle
agent-browser wait 2000
agent-browser errors --clear
```

`--clear` resets the error buffer. Any errors that arrive after this point are from the test interaction, not from initial page load.

### Step 3 — The critical path (exact reported scenario)

```bash
agent-browser find text "Breakpoint Value" click
agent-browser wait --load networkidle
agent-browser wait 2000
agent-browser errors   # PASS = empty array; FAIL = any hydration/418 error
```

This is the step that reproduced React error #418 before the `useSyncExternalStore` fix. If this step returns a non-empty errors array, stop — the hydration regression is confirmed.

### Step 4 — Verify the page rendered

```bash
agent-browser get text "body"
# Expected output includes: columns, fontSize, padding values
```

If the text output is empty or does not contain layout values, the hook is returning no value — likely a silent render failure. Check the console for uncaught errors that were not surfaced in Step 3.

### Step 5 — Viewport resize (breakpoint behavior)

```bash
agent-browser set viewport 375 812 && agent-browser wait 500
agent-browser get text "body"   # columns: 1, fontSize: 14, padding: 12

agent-browser set viewport 700 900 && agent-browser wait 500
agent-browser get text "body"   # columns: 2, fontSize: 14, padding: 16

agent-browser set viewport 1280 900 && agent-browser wait 500
agent-browser get text "body"   # columns: 3, fontSize: 18, padding: 24

agent-browser errors   # must still be empty after all resizes
```

Each resize triggers `matchMedia` listener callbacks. If `useBreakPointValue`'s subscribe function is not stable across renders, this step may produce errors or return stale values.

### Step 6 — Vitals

```bash
agent-browser vitals --json
# Check: CLS = 0.0, no hydration errors in phases
```

CLS (Cumulative Layout Shift) above 0.0 indicates the page reflowed after hydration — a symptom of a server/client mismatch that React recovered from silently. "Errored" in the hydration phases output is a hard failure.

### Step 7 — Teardown

```bash
agent-browser close
kill $(lsof -ti:8081) 2>/dev/null || true
```

Always kill the Metro process. Leaving it running on port 8081 will cause "port in use" errors on the next run.

---

## Triage guide

### `agent-browser errors` returns a non-empty array with "Minified React error #418" or "hydration"

Root cause: server snapshot and client snapshot disagree. Check `useMediaQuery.tsx` — the `getServerSnapshot` argument to `useSyncExternalStore` must return `false`. Any hook that reads `window` or `Dimensions` at SSR time will produce a mismatch.

### Page renders but breakpoint values don't update on resize

The `subscribe` function is not reregistering after viewport change. Check that `useCallback([mediaQueryString])` wraps the subscribe argument — without it, React detects a new function reference every render and unsubscribes/resubscribes unnecessarily (or not at all if the bug is the reverse).

### `agent-browser vitals` shows "Errored" phases but `errors` is empty

Silent hydration failure — React recovered but logged a warning-level mismatch. Check the React DevTools hydration timeline via `agent-browser react suspense` for boundary-level detail.

### Server returns non-200 before test starts

Metro bundler hasn't finished compiling. Increase the wait loop timeout. First compile after a clean install can take 60–90 seconds.

### `agent-browser find text "Breakpoint Value" click` fails

The nav item may not be visible — check if the Responsive tab is active. Add `agent-browser open http://localhost:8081/responsive` before the find command.
