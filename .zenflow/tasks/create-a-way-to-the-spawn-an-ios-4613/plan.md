# Spec and build

## Configuration

- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

<!-- chat-id: 1c06daab-5bcd-441e-9329-bd035d9d5d0b -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.

- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:

- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [ ] Step: Install @capacitor/ios and update capacitor config

Install the iOS Capacitor platform and add iOS-specific configuration:

- `pnpm --filter @riddle-rush/game add -D @capacitor/ios@^8.0.0`
- Add `ios` config block to `apps/game/capacitor.config.ts`
- Add `ios:sync`, `ios:open`, `ios:run`, `ios:build` scripts to `apps/game/package.json`
- Run `pnpm run workspace:check` to validate
- Commit: `feat(mobile): add capacitor ios platform and config`

Reference: `spec.md` Step A

---

### [ ] Step: Create playwright.ios.config.ts

Create a dedicated Playwright config for iOS visual testing:

- New file: `apps/game/playwright.ios.config.ts` (iPhone 15 only, headless: false by default)
- Add `test:e2e:ios`, `test:e2e:ios:headed`, `test:e2e:ios:ui` to `apps/game/package.json`
- Run typecheck to validate config types
- Run `pnpm run workspace:check`
- Commit: `feat(testing): add playwright ios config for visual e2e`

Reference: `spec.md` Step B

---

### [ ] Step: Create scripts/ios-visual-e2e.sh (Path A — no Xcode needed)

Create the primary visual E2E runner that works without Xcode:

- New file: `scripts/ios-visual-e2e.sh`
- Checks prerequisites (pnpm, Playwright WebKit binary — auto-installs if missing)
- Starts Nuxt dev server or reuses existing one on port 3000
- Runs `playwright test --config=playwright.ios.config.ts --headed --project=mobile-safari-iphone15`
- Opens HTML report on completion
- Make executable: `chmod +x scripts/ios-visual-e2e.sh`
- Test manually: `bash scripts/ios-visual-e2e.sh`
- Commit: `feat(scripts): add ios visual e2e runner using playwright webkit`

Reference: `spec.md` Step C

---

### [ ] Step: Create scripts/ios-simulator-launch.sh (Path B — requires Xcode)

Create the native iOS Simulator launcher:

- New file: `scripts/ios-simulator-launch.sh`
- Detects Xcode.app installation; exits with clear error message if absent
- Lists available iPhone simulators, selects default (latest iPhone) or `$IOS_DEVICE`
- Boots simulator via `xcrun simctl boot`, opens Simulator.app
- Waits for boot completion with configurable timeout
- Builds Capacitor iOS app and installs it in simulator
- Launches the app
- Make executable: `chmod +x scripts/ios-simulator-launch.sh`
- Commit: `feat(scripts): add ios simulator launcher for native e2e`

Reference: `spec.md` Step D

---

### [x] Step: Create GitHub Actions workflow for iOS E2E

Created `.github/workflows/ios-e2e.yml` with two jobs:

- `e2e-webkit-visual` — Playwright WebKit on Ubuntu (no Xcode needed, video artifacts)
- `e2e-ios-simulator` — Real iOS Simulator on `macos-15` with Xcode 16

Workflow is **manual-only** (`workflow_dispatch`) to avoid macOS runner costs on every push.
Inputs: `job` (which job to run) and `test_filter` (Playwright `--grep` filter).

---

### [ ] Step: Root scripts and documentation

Wire everything up at the workspace level:

- Add `ios:e2e` and `ios:e2e:visual` to root `package.json`
- Update `CLAUDE.md` Mobile Development section with new iOS commands
- Final `pnpm run workspace:check`
- Commit: `docs: document ios simulator and e2e commands`

Reference: `spec.md` Step E
