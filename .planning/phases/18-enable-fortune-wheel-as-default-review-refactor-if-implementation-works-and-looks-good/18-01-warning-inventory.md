# Plan 18-01 Warning & Verification Inventory

## Task 2 Verification: Fortune Wheel Default

- `apps/game/stores/settingsStore.ts` confirms `fortuneWheelEnabled: true` in `DEFAULT_SETTINGS`.
- `apps/game/composables/useFeatureFlags.ts` confirms `isEnabled('fortune-wheel', true)` fallback when GitLab client is present.

## Task 2 Verification: Pinia Residue Audit

- Scoped repository scan (apps/packages/tools) for `defineStore`, `storeToRefs`, `setActivePinia`, `createPinia`, `@pinia/nuxt`, and direct `pinia` imports passed.
- Only allowlisted references remain:
  - `apps/game/stores/migrate.ts`
  - `apps/game/tests/unit/stores/migrate.spec.ts`
  - `.planning/**` historical artifacts

Task 3 extends this document with warning-by-warning closure from quality/build commands.
