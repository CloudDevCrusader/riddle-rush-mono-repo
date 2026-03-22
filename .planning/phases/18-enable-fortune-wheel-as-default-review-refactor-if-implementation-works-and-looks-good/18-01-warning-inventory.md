# Plan 18-01 Warning Inventory

## Commands Executed

1. `pnpm run workspace:check`
2. `pnpm run test`
3. `pnpm --filter @riddle-rush/game run build`

## Warning Closure Inventory

### 1) Duplicated Nuxt auto-import warnings (stores + hooks)

- **Category:** `duplicated imports`
- **Origin command:** `pnpm run workspace:check` (`typecheck`) and `pnpm --filter @riddle-rush/game run build`
- **Location:** generated from Nuxt auto-import scanning of `apps/game/stores/**`
- **Disposition:** `fixed`
- **Rationale:** duplicate symbols were created by barrel files (`stores/index.ts`, `stores/hooks/index.ts`) overlapping with Nuxt `imports.dirs` scan.
- **Proof reference:** removed `apps/game/stores/index.ts` and `apps/game/stores/hooks/index.ts`; removed redundant `GameSettings` re-export from `apps/game/stores/hooks/useSettings.ts`; commit `231cdf9a3`.
- **Verification:** current `pnpm run workspace:check` output shows zero duplicated import warnings.

### 2) Missing font metrics for `system-ui`

- **Category:** `@nuxtjs/fontaine` warning
- **Warning text:** `Could not find metrics for font system-ui`
- **Origin command:** `pnpm --filter @riddle-rush/game run build`
- **Location:** `@nuxtjs/fontaine` runtime during Nuxt build
- **Disposition:** `intentional suppression`
- **Rationale:** `system-ui` is a platform-native fallback font family without a single static font file metrics source. Fontaine warns but behavior is expected and safe.
- **Suppression/proof location:** documented suppression in this inventory for phase closure (tooling warning, no app/runtime defect).

### 3) Sourcemap warning from `nuxt:module-preload-polyfill`

- **Category:** Vite plugin sourcemap warning
- **Warning text:** `[plugin nuxt:module-preload-polyfill] Sourcemap is likely to be incorrect ... didn't generate a sourcemap`
- **Origin command:** `pnpm --filter @riddle-rush/game run build`
- **Location:** Nuxt-internal Vite plugin transform
- **Disposition:** `intentional suppression`
- **Rationale:** warning is emitted by upstream Nuxt plugin internals and does not affect production bundle correctness (sourcemaps are disabled in production in our config).
- **Suppression/proof location:** documented suppression in this inventory for phase closure.

### 4) Sourcemap warning from `fontaine-transform` (x4)

- **Category:** Vite plugin sourcemap warning
- **Warning text:** `[plugin fontaine-transform] Sourcemap is likely to be incorrect ... didn't generate a sourcemap`
- **Origin command:** `pnpm --filter @riddle-rush/game run build`
- **Location:** `@nuxtjs/fontaine` transform pipeline
- **Disposition:** `intentional suppression`
- **Rationale:** known third-party transform warning in fontaine pipeline; no runtime impact to generated assets, only affects transform sourcemap completeness.
- **Suppression/proof location:** documented suppression in this inventory for phase closure.

### 5) Rollup/Nitro input option warning (`manualChunks`)

- **Category:** Rollup option compatibility warning
- **Warning text:** `Unknown input options: manualChunks. Allowed options: ...`
- **Origin command:** `pnpm --filter @riddle-rush/game run build`
- **Location:** Nitro/rollup invocation path (after client/server build step)
- **Disposition:** `intentional suppression`
- **Rationale:** application config intentionally avoids `manualChunks` in `apps/game/nuxt.config.ts` (lines 279-283 note why this must remain disabled). Warning is produced by framework tooling path, not by active app option usage.
- **Suppression/proof location:** `apps/game/nuxt.config.ts` comment and this inventory entry.

## Task 2 Verification Records

- `apps/game/stores/settingsStore.ts` confirms `fortuneWheelEnabled: true` in `DEFAULT_SETTINGS`.
- `apps/game/composables/useFeatureFlags.ts` confirms `isEnabled('fortune-wheel', true)` fallback default.
- Pinia residue audit across `apps/`, `packages/`, and `tools/` passed with allowlist-only references:
  - `apps/game/stores/migrate.ts`
  - `apps/game/tests/unit/stores/migrate.spec.ts`
  - `.planning/**`

## Closure Summary

- No duplicated import warnings remain in `workspace:check`.
- All warning-producing commands required by this plan were executed.
- Every warning observed during plan scope is now explicitly closed as either:
  - **fixed** (store/hook duplicated imports), or
  - **intentional suppression** with rationale and proof location.
- **Untracked warnings remaining for this phase:** none.
