# Technical Specification: iOS Simulator E2E Testing

**Task**: Create a way to spawn an iOS simulator and run all E2E tests visually
**Complexity**: **Medium** — Moderate complexity: two distinct paths (Playwright visual + native Capacitor), macOS toolchain dependencies, prerequisite detection, and integration with existing scripts.
**Date**: 2026-02-14

---

## 1. Technical Context

### Language & Runtime

- **Shell scripts**: Bash (macOS-compatible, no `bash 4+` features)
- **TypeScript**: Playwright config additions (`apps/game/playwright.config.ts`, new `playwright.ios.config.ts`)
- **Node.js ≥ 20**, **pnpm 10.28.2**

### Key Dependencies

| Dependency         | Version                     | Role                                      |
| ------------------ | --------------------------- | ----------------------------------------- |
| `@playwright/test` | `^1.49.1`                   | E2E test runner                           |
| `playwright`       | `^1.49.1`                   | Browser binaries (WebKit = Safari engine) |
| `@capacitor/cli`   | (via npx)                   | Native iOS build & sync                   |
| `@capacitor/ios`   | To be added                 | iOS Capacitor platform                    |
| `xcrun simctl`     | System (requires Xcode.app) | iOS Simulator control                     |

### Current State Assessment

**What exists:**

- `apps/game/playwright.config.ts` — 4 device projects including `mobile-safari-iphone15` (WebKit browser emulation, not native)
- `apps/game/tests/e2e/helpers/mobile.ts` — 755-line mobile helper with iOS Safari-specific code
- `apps/game/capacitor.config.ts` — Capacitor config (Android only; no `ios` key)
- `apps/game/package.json` — `android:*` scripts; **no `ios:*` scripts**
- `scripts/e2e-local.sh` — basic local E2E runner

**What is missing:**

- An `ios:*` script set (build, sync, open, run)
- `@capacitor/ios` package
- A dedicated script to spawn the iOS Simulator
- A Playwright config variant for **headed WebKit on macOS** (visual Safari testing)
- A `scripts/ios-e2e.sh` orchestration script

### Platform Constraint

The current machine has **Command Line Tools only** (`/Library/Developer/CommandLineTools`). **`xcrun simctl` requires full Xcode.app**. The implementation must:

1. Detect Xcode.app installation and fail gracefully if absent.
2. Provide Playwright WebKit (headful) as a fully working visual path **without** Xcode.
3. Document the native Capacitor path as a bonus/optional flow.

---

## 2. Two Implementation Paths

### Path A — Playwright Headed WebKit (Primary, works today)

Playwright ships its own **WebKit browser binary** (the Safari engine). Running tests with `--headed --project=mobile-safari-iphone15` opens a visible browser window that renders exactly like Safari on iPhone 15. This is the **immediate, zero-Xcode path** for visual E2E testing.

**New script**: `scripts/ios-visual-e2e.sh`
**New npm script**: `ios:e2e:visual` in `apps/game/package.json`
**New Playwright config**: `apps/game/playwright.ios.config.ts`

### Path B — Native iOS Simulator via Capacitor (Optional, requires Xcode.app)

Uses `xcrun simctl` to boot a specific iPhone simulator, builds the app via `xcodebuild`, installs the `.app` bundle, and opens it. Playwright tests can then run against the WKWebView inside the native app via WebDriver (WebKit remote debugging). This is **full native testing** but requires Xcode.app.

**New script**: `scripts/ios-simulator-launch.sh`
**New npm scripts**: `ios:sync`, `ios:open`, `ios:run` in `apps/game/package.json`
**Capacitor iOS platform** added to the game app.

---

## 3. Source Code Changes

### Files to CREATE

#### `scripts/ios-visual-e2e.sh`

Bash script that:

1. Checks prerequisites (Node, pnpm, Playwright WebKit binary)
2. Ensures Playwright WebKit is installed (`playwright install webkit`)
3. Starts the Nuxt dev server (or reuses if running)
4. Runs `playwright test --headed --project=mobile-safari-iphone15` with the iOS config
5. On completion, optionally opens the HTML report

#### `scripts/ios-simulator-launch.sh`

Bash script that:

1. Checks for Xcode.app (`xcode-select -p` must point to Xcode, not CLT)
2. Lists available iPhone simulators via `xcrun simctl list devices available`
3. Selects target simulator (default: latest iPhone; configurable via `$IOS_DEVICE`)
4. Boots the simulator: `xcrun simctl boot <UDID>`
5. Opens Simulator.app: `open -a Simulator`
6. Waits for boot (polls `xcrun simctl list devices | grep Booted`)
7. Builds the Capacitor iOS app: `pnpm ios:build`
8. Installs the app: `xcrun simctl install booted <path/to/App.app>`
9. Launches the app: `xcrun simctl launch booted com.riddlerush.game`
10. Runs Playwright tests targeting `http://localhost:3000` (dev server WebView proxy)

#### `apps/game/playwright.ios.config.ts`

Dedicated Playwright config for iOS visual testing:

- Uses only `mobile-safari-iphone15` project
- Sets `--headed` as default (via `use.headless: false`)
- Reduced worker count (1–2) for visual clarity
- Longer timeouts for visual debugging
- Opens HTML report automatically after run

### Files to MODIFY

#### `apps/game/package.json`

Add scripts:

```json
"ios:sync": "pnpm build && npx cap sync ios",
"ios:open": "npx cap open ios",
"ios:run": "npx cap run ios",
"ios:build": "pnpm ios:sync && npx cap copy ios && npx cap sync ios",
"test:e2e:ios": "playwright test --config=playwright.ios.config.ts",
"test:e2e:ios:headed": "playwright test --config=playwright.ios.config.ts --headed",
"test:e2e:ios:ui": "playwright test --config=playwright.ios.config.ts --ui"
```

#### `apps/game/capacitor.config.ts`

Add `ios` configuration block:

```typescript
ios: {
  contentInset: 'automatic',
  allowsLinkPreview: false,
  scrollEnabled: true,
},
```

#### Root `package.json`

Add workspace-level convenience script:

```json
"ios:e2e": "pnpm --filter @riddle-rush/game run test:e2e:ios",
"ios:e2e:visual": "bash scripts/ios-visual-e2e.sh"
```

### Files to INSTALL (npm packages)

In `apps/game`:

- `@capacitor/ios@^8.0.0` (devDependency, matches existing `@capacitor/android@^8.0.0`)

---

## 4. Data Model / API / Interface Changes

No data model changes. The Playwright config additions follow existing TypeScript patterns:

```typescript
// apps/game/playwright.ios.config.ts shape
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  use: { headless: false }, // always visible
  projects: [{ name: 'mobile-safari-iphone15', use: { ...devices['iPhone 15'] } }],
  // ...
});
```

---

## 5. Verification Approach

### Prerequisites Check (in scripts)

```bash
# Path A
playwright install webkit && playwright --version  # WebKit available

# Path B
xcode-select -p | grep -v CommandLineTools  # Xcode.app installed
xcrun simctl list runtimes | grep iOS        # iOS runtime present
```

### Running the Tests

**Path A — Visual Playwright WebKit (works without Xcode):**

```bash
# From repo root
bash scripts/ios-visual-e2e.sh

# Or via npm script
cd apps/game && pnpm test:e2e:ios:headed

# Playwright UI mode (interactive, best for debugging)
cd apps/game && pnpm test:e2e:ios:ui
```

**Path B — Native iOS Simulator (requires Xcode.app):**

```bash
bash scripts/ios-simulator-launch.sh
```

### Quality Gates

```bash
# After changes:
pnpm run workspace:check          # TypeScript + ESLint + Syncpack

# Typecheck the new playwright.ios.config.ts
pnpm --filter @riddle-rush/game run typecheck

# Lint
pnpm --filter @riddle-rush/game run lint
```

### Manual Verification Steps

1. Run `bash scripts/ios-visual-e2e.sh` — a headed Safari-look browser window opens
2. Tests execute and are visually visible
3. HTML report opens automatically
4. All 9 existing E2E spec files pass in `mobile-safari-iphone15` project
5. Script exits with non-zero code on failure

---

## 6. Implementation Plan Breakdown

Given medium complexity, the Implementation step should be split into these sub-tasks:

### Step A: Install `@capacitor/ios` and update `capacitor.config.ts`

- `pnpm --filter @riddle-rush/game add -D @capacitor/ios@^8.0.0`
- Add `ios` config block to `capacitor.config.ts`
- Add `ios:*` scripts to `apps/game/package.json`
- Run `pnpm run workspace:check` + commit

### Step B: Create `apps/game/playwright.ios.config.ts`

- New Playwright config targeting only iPhone 15, headed by default
- Add `test:e2e:ios`, `test:e2e:ios:headed`, `test:e2e:ios:ui` to `package.json`
- Run typecheck to validate config
- Run `workspace:check` + commit

### Step C: Create `scripts/ios-visual-e2e.sh` (Path A)

- Prerequisite checks, WebKit install, dev server start, test run, report open
- Make executable
- Test manually: `bash scripts/ios-visual-e2e.sh`
- Run `workspace:check` + commit

### Step D: Create `scripts/ios-simulator-launch.sh` (Path B)

- Xcode detection, simctl boot/wait, Capacitor build, install, launch
- Graceful failure with clear error if Xcode not installed
- Make executable, document in README
- Run `workspace:check` + commit

### Step E: Root `package.json` scripts + documentation

- Add `ios:e2e` and `ios:e2e:visual` to root `package.json`
- Update `CLAUDE.md` Mobile Development section with new iOS commands
- Final `workspace:check` + commit

---

## 7. Risks & Mitigations

| Risk                               | Likelihood                | Mitigation                                                                     |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| Xcode not installed on dev machine | High (confirmed CLT only) | Path A (WebKit) works without Xcode; Path B fails fast with clear message      |
| iOS Simulator boot timeout         | Medium                    | Script polls with timeout (60s default), configurable via `$SIMULATOR_TIMEOUT` |
| `@capacitor/ios` sync failure      | Low                       | Capacitor iOS requires Xcode; guard with Xcode check before `cap sync ios`     |
| Playwright WebKit binary missing   | Low                       | Script runs `playwright install webkit` automatically                          |
| Port 3000 already in use           | Medium                    | Script checks for existing dev server; reuses it (`reuseExistingServer: true`) |

---

## 8. File Change Summary

| File                                 | Action     | Description                                             |
| ------------------------------------ | ---------- | ------------------------------------------------------- |
| `apps/game/playwright.ios.config.ts` | **CREATE** | iOS-specific Playwright config (headed, iPhone 15 only) |
| `scripts/ios-visual-e2e.sh`          | **CREATE** | Path A: WebKit visual E2E runner                        |
| `scripts/ios-simulator-launch.sh`    | **CREATE** | Path B: native Simulator launcher (requires Xcode)      |
| `apps/game/package.json`             | **MODIFY** | Add `ios:*` and `test:e2e:ios:*` scripts                |
| `apps/game/capacitor.config.ts`      | **MODIFY** | Add `ios` config block                                  |
| Root `package.json`                  | **MODIFY** | Add `ios:e2e` convenience scripts                       |
| `CLAUDE.md`                          | **MODIFY** | Document new iOS commands in Mobile Development section |
