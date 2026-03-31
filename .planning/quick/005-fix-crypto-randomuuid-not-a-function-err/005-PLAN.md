---
phase: quick-005
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/utils/uuid.ts
  - apps/game/composables/usePlayerManager.ts
  - apps/game/composables/useSessionManager.ts
  - services/GameService.ts
autonomous: true

must_haves:
  truths:
    - 'Game starts without error on Safari (including older versions and non-secure contexts)'
    - 'Generated IDs are valid UUID v4 format strings'
    - 'All existing crypto.randomUUID() call sites use the new utility'
  artifacts:
    - path: 'apps/game/utils/uuid.ts'
      provides: 'Cross-browser UUID v4 generation utility'
      exports: ['generateUUID']
    - path: 'apps/game/composables/usePlayerManager.ts'
      provides: 'Player creation using generateUUID()'
      contains: 'generateUUID'
    - path: 'apps/game/composables/useSessionManager.ts'
      provides: 'Session creation using generateUUID()'
      contains: 'generateUUID'
    - path: 'services/GameService.ts'
      provides: 'GameService using generateUUID()'
      contains: 'generateUUID'
  key_links:
    - from: 'apps/game/composables/usePlayerManager.ts'
      to: 'apps/game/utils/uuid.ts'
      via: 'import generateUUID'
      pattern: 'import.*generateUUID.*uuid'
    - from: 'apps/game/composables/useSessionManager.ts'
      to: 'apps/game/utils/uuid.ts'
      via: 'import generateUUID'
      pattern: 'import.*generateUUID.*uuid'
---

<objective>
Fix `crypto.randomUUID is not a function` TypeError that crashes game start on Safari (older versions and non-secure contexts).

Purpose: The game is completely broken on affected browsers — users cannot start a game at all. This is a critical production bug.
Output: A cross-browser UUID utility used by all ID generation call sites, eliminating the Safari crash.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/game/utils/environment.ts (existing utils directory pattern)
@apps/game/composables/usePlayerManager.ts (uses crypto.randomUUID at line 31)
@apps/game/composables/useSessionManager.ts (uses crypto.randomUUID at lines 39, 60)
@services/GameService.ts (uses crypto.randomUUID at lines 38, 55)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create cross-browser UUID utility</name>
  <files>apps/game/utils/uuid.ts</files>
  <action>
Create `apps/game/utils/uuid.ts` with a `generateUUID()` function that:

1. Tries `crypto.randomUUID()` first (native, fast, available in modern browsers over HTTPS)
2. Falls back to a `crypto.getRandomValues()`-based UUID v4 implementation when `randomUUID` is unavailable

Implementation:

```typescript
/**
 * Generate a UUID v4 string with cross-browser compatibility.
 *
 * Uses `crypto.randomUUID()` when available (modern browsers, secure contexts).
 * Falls back to a `crypto.getRandomValues()`-based implementation for older
 * browsers (e.g., Safari < 15.4) or non-secure HTTP contexts.
 *
 * @returns A lowercase UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback: RFC 4122 version 4 UUID using crypto.getRandomValues()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set version (4) and variant (10xx) bits per RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
```

Key design decisions:

- Named export `generateUUID` (not default) — matches Nuxt auto-import convention for utils/
- No external dependencies — uses only Web Crypto API which has near-universal support
- `crypto.getRandomValues()` is available in all browsers including Safari 11+ and non-secure contexts
- The function is synchronous (no async needed)
- Nuxt auto-imports from `utils/` so consumers can call `generateUUID()` directly in the game app

Do NOT use `Math.random()` as a fallback — it is not cryptographically random and produces predictable UUIDs.
</action>
<verify>
Verify the file exists and TypeScript compiles:

```bash
cat apps/game/utils/uuid.ts
pnpm run typecheck
```

  </verify>
  <done>
`apps/game/utils/uuid.ts` exports `generateUUID()` with native-first + getRandomValues fallback. TypeScript compiles cleanly.
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace all crypto.randomUUID() usages with generateUUID()</name>
  <files>
    apps/game/composables/usePlayerManager.ts
    apps/game/composables/useSessionManager.ts
    services/GameService.ts
  </files>
  <action>
Replace every `crypto.randomUUID()` call in production source files with `generateUUID()`.

**File 1: `apps/game/composables/usePlayerManager.ts`** (line 31)

- Replace `id: crypto.randomUUID(),` with `id: generateUUID(),`
- `generateUUID` is auto-imported by Nuxt from `utils/uuid.ts` — no import statement needed in composables

**File 2: `apps/game/composables/useSessionManager.ts`** (lines 39, 60)

- Replace both `id: crypto.randomUUID(),` with `id: generateUUID(),`
- Same auto-import applies — no import needed

**File 3: `services/GameService.ts`** (lines 38, 55)

- Replace both `id: crypto.randomUUID(),` with `id: generateUUID(),`
- This file is in `services/` at the repo root, NOT inside `apps/game/` — Nuxt auto-import does NOT apply here
- Add an explicit import: `import { generateUUID } from '~/utils/uuid'` at the top of the file
- NOTE: Check if this file uses `~/` alias. If not (it imports from `~/types/game` on line 6, so it does), use the same alias pattern.

**Do NOT modify:**

- `templates/RULES.yaml` (documentation/template, not runtime code)
- `.planning/` files (planning docs, not runtime code)
- `docs/REFACTORING-GUIDE.md` (documentation)
- Test factory files (`apps/game/tests/utils/factories.ts`) — these already use `faker.string.uuid()`, not `crypto.randomUUID()`

After making changes, run:

```bash
pnpm run workspace:check
```

Fix any lint or type errors that arise. The ESLint auto-fix (`pnpm run lint:fix`) should handle formatting.
</action>
<verify>

1. Confirm no remaining `crypto.randomUUID` in production source files:

```bash
grep -rn "crypto\.randomUUID" apps/game/composables/ apps/game/utils/ services/GameService.ts
```

Should return zero results.

2. Full workspace validation:

```bash
pnpm run workspace:check
```

Should pass with no errors.

3. Unit tests still pass:

```bash
pnpm run test:unit
```

  </verify>
  <done>
All 5 `crypto.randomUUID()` call sites in production code replaced with `generateUUID()`. No remaining direct `crypto.randomUUID` usage in runtime code. `pnpm run workspace:check` passes. Unit tests pass.
  </done>
</task>

</tasks>

<verification>
1. `grep -rn "crypto\.randomUUID" apps/ services/ --include="*.ts" --include="*.vue"` returns zero results (excluding test files if any used it)
2. `pnpm run workspace:check` passes (syncpack + typecheck + lint)
3. `pnpm run test:unit` passes
4. Manual verification: open the app in Safari (or simulate by temporarily deleting `crypto.randomUUID` in devtools console) — starting a game should work without TypeError
</verification>

<success_criteria>

- Zero `crypto.randomUUID()` calls remain in production source files
- `generateUUID()` utility exists with native-first + fallback implementation
- All quality checks pass (`pnpm run workspace:check`)
- Game can start on browsers where `crypto.randomUUID` is undefined
  </success_criteria>

<output>
After completion, create `.planning/quick/005-fix-crypto-randomuuid-not-a-function-err/005-SUMMARY.md`
</output>
