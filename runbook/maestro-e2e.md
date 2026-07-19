# Maestro E2E Test Plan

**Scope:** Local validation only — runs against the example app on iOS Simulator or Android Emulator.
**Tool:** Maestro (https://maestro.mobile.dev)
**Runner:** Local (`maestro test`) — not in CI (macOS runner cost, device provisioning complexity)
**When to run:** Before cutting a release tag. After any change to `createComponent`, `createPressable`, `createComponentGroup`, or color mode hooks.

---

## Setup

### 1. Install Maestro

```bash
# macOS — one-line install
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify
maestro --version
```

Maestro requires Java 11+. On macOS with Homebrew:

```bash
brew install openjdk@17
export JAVA_HOME=$(brew --prefix openjdk@17)
```

### 2. Build and start the example app on simulator

```bash
# From the repo root
cd example

# iOS (recommended — fastest iteration)
npx expo run:ios --device   # pick a simulator from the list

# Android (if testing Android-specific paths like _android elevation)
npx expo run:android
```

The app must be **running on a simulator/emulator** before executing flows.
Maestro connects to the running app by `appId` — it does not build anything itself.

**Bundle ID:** `com.embsmallui.example` (from `example/app.json`)

### 3. Confirm Maestro can see the device

```bash
maestro studio   # opens browser IDE — confirms device connection
# or
maestro test example/.maestro/001-app-launches.yaml
```

---

## Flow inventory

| Flow file | What it proves | APIs validated |
|-----------|---------------|----------------|
| `001-app-launches.yaml` | App boots, tab bar initialises from Expo Router file-based routing, all 8 NavigationGrid items render (including below-fold items) | `createComponent` (auto-init), Expo Router tabs |
| `002-static-styles-dark-mode.yaml` | Toggling the header `ColorModeToggle` causes the Zustand colorMode store to publish, subscribers re-render, and `_light`/`_dark` style props resolve to the correct values | `createComponent`, `_light`, `_dark`, `toggleColorScheme`, `useColorMode` |
| `003-variants-button-gallery.yaml` | All 5 intent variants and 4 size variants render as tappable elements; compound variant (xs + destructive, ghost + sm) and defaultVariants (md + primary) produce valid native style shapes | `variants`, `compoundVariants`, `defaultVariants` |
| `004-pressable-interactive-states.yaml` | A real long-press event fires through the iOS/Android gesture responder pipeline and triggers `onPressIn` → `_pressed` style resolution → re-render | `createPressable`, `_pressed`, `_hovered` |
| `005-color-mode-toggle.yaml` | `toggleColorScheme()` flips the store state; `setColorScheme('dark'/'light')` sets it explicitly; both paths cause the dynamic label text to update correctly | `useColorMode`, `toggleColorScheme`, `setColorScheme` |
| `006-multi-theme-switch.yaml` | `setTheme(name)` writes to the theme Zustand slice; `useThemeName()` subscribers update; `ThemedCard` and `ThemedText` re-render with the new token set; cycling through 3 themes leaves no stale state | `registerTheme`, `setTheme`, `useThemeName`, `useTheme` |
| `007-kitchen-sink-form.yaml` | Native keyboard input works; `createComponentGroup` `FormInput` with `status` variants switches from `idle` → `error` → `success` on real state changes; `Button` intent changes from `primary` → `destructive` on `hasErrors` | `createComponentGroup`, `variants`, `defaultVariants` |

---

## What Maestro proves that unit tests cannot

- **Real gesture responder pipeline.** `createPressable`'s `_pressed` styles are triggered by `onPressIn`. Jest fires synthetic events via `act()`; Maestro fires a real touch through the iOS UIKit / Android MotionEvent pipeline. The gesture responder negotiation (`onStartShouldSetResponder`, `pressRetentionOffset`) only runs on device.

- **Zustand cross-component subscriber propagation.** Unit tests reset the store between runs with `teardownSmallUI()`. On device, the store persists across navigation. Flow 005 proves that `toggleColorScheme()` triggers all subscribers in the live tree — including the `ColorModeToggle` in the header (mounted in the tab layout) and the `colorMode` text in the showcase body (mounted in the screen stack). Two separately-mounted subtrees must both update.

- **Metro bundler alias resolution.** The `@/` path alias maps to `example/src/` via Metro config. If this alias breaks, the app silently fails to resolve imports at runtime — Jest's module resolver uses its own mock map and would not catch this. Flow 001 proves the full bundle is loadable.

- **Native TextInput on real keyboard.** `createComponentGroup`'s `FormInput` wraps `TextInput`. Jest's `fireEvent.changeText` bypasses the native text input system. Flow 007 types real characters through the iOS software keyboard and confirms the `onChangeText` → state → re-render chain works end-to-end, including the `status` variant switching from `idle` to `error` or `success` based on actual text content.

---

## Running all flows

```bash
# Run the full suite (from the repo root)
maestro test example/.maestro/

# Run a single flow
maestro test example/.maestro/004-pressable-interactive-states.yaml

# Run with video recording (useful for CI-like documentation)
maestro test example/.maestro/ --format junit --output maestro-results/
```

Flows run sequentially in filename order. Each flow calls `launchApp` at the start to guarantee a clean app state — flows are independent and can be run in any order or individually.

---

## Triage guide

### A flow fails at `assertVisible`

**Check first:** Is the text exactly right? Maestro's `assertVisible` matches the string literally against the accessibility tree. Emoji, non-breaking spaces, and unicode characters must match exactly.

- Open `maestro studio` — it shows the live accessibility tree. Find the element's exact text.
- If the element is below the fold, check whether the flow uses `scrollUntilVisible` before the assertion.

### A flow fails at `tapOn`

**Check first:** Does the element exist in the accessibility tree at that moment? Expo Router navigation is async — the screen may not have mounted yet.

- Add `- waitForAnimationToEnd` before the failing `tapOn`.
- Alternatively, add an `assertVisible` for a static element on the target screen before the `tapOn` — this acts as an implicit wait.

### Flow 004 (`_pressed`) passes but the visual state change is not visible

Maestro does not assert on pixel color, only on accessibility tree content. The `longPressOn` in flow 004 proves the gesture fires and the app does not crash — it does not pixel-verify the `_pressed` background color. If you suspect the `_pressed` style is wrong, use `maestro studio` to inspect the component's style prop after a long press.

### Flow 007 (`typeText`) fails after `tapOn` a text field

**Check first:** Did the keyboard appear? On iOS simulators with hardware keyboard enabled, the software keyboard does not appear and `typeText` may not work.

- In Simulator: `I/O → Keyboard → Toggle Software Keyboard` (or `⌘K`).
- Then re-run the flow.

### All flows fail with `App not found`

The app must be running on the simulator before Maestro can attach to it. Confirm with:

```bash
xcrun simctl list devices | grep Booted   # iOS
adb devices                               # Android
```

If the simulator shows as booted but Maestro still cannot connect, restart Maestro's driver:

```bash
maestro kill-server && maestro test example/.maestro/001-app-launches.yaml
```
