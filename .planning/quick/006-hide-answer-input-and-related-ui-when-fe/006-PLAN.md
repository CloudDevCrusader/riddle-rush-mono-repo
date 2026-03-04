---
phase: quick-006
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/components/game/GamePlayerCard.vue
  - apps/game/pages/results.vue
  - apps/game/pages/results/[[gameId]].vue
autonomous: true

must_haves:
  truths:
    - 'Answer text is hidden on results pages when NUXT_PUBLIC_FEATURE_ANSWER_INPUT is false'
    - 'Answer input field and submit button on game page remain visible regardless of flag'
    - 'No visual regression when feature flag is true (default)'
  artifacts:
    - path: 'apps/game/components/game/GamePlayerCard.vue'
      provides: 'showAnswer prop controlling answer text visibility'
      contains: 'showAnswer'
    - path: 'apps/game/pages/results/[[gameId]].vue'
      provides: 'Feature flag gating answer display via GamePlayerCard prop'
      contains: 'isAnswerInputEnabled'
    - path: 'apps/game/pages/results.vue'
      provides: 'Feature flag gating answer display in legacy results page'
      contains: 'isAnswerInputEnabled'
---

<objective>
Hide the display of submitted answers on results/scoring pages when the `NUXT_PUBLIC_FEATURE_ANSWER_INPUT` feature flag is set to false.

Purpose: When the answer input feature is disabled, showing empty/irrelevant answer text on results pages is confusing. The answer input field and submit button remain visible (answers are optional).
Output: Answer text conditionally rendered based on existing `isAnswerInputEnabled` feature flag on both results pages.
</objective>

<context>
@apps/game/composables/useFeatureFlags.ts (defines isAnswerInputEnabled)
@apps/game/components/game/GamePlayerCard.vue (displays player answer text)
@apps/game/pages/results.vue (legacy results page with answer text)
@apps/game/pages/results/[[gameId]].vue (new results page using GamePlayerCard)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add showAnswer prop to GamePlayerCard and gate both results pages</name>
  <files>
    apps/game/components/game/GamePlayerCard.vue
    apps/game/pages/results/[[gameId]].vue
    apps/game/pages/results.vue
  </files>
  <action>
1. In `GamePlayerCard.vue`: Add `showAnswer` boolean prop (default: true) and change `v-if="player.currentRoundAnswer"` to `v-if="showAnswer && player.currentRoundAnswer"`
2. In `results/[[gameId]].vue`: Import `isAnswerInputEnabled` from `useFeatureFlags()` and pass `:show-answer="isAnswerInputEnabled"` to `<GamePlayerCard>`
3. In `results.vue`: Import `isAnswerInputEnabled` from `useFeatureFlags()` and add `v-if="isAnswerInputEnabled"` to the answer span
  </action>
  <verify>
    pnpm run workspace:check
    pnpm run test:unit
  </verify>
  <done>
Answer display gated by isAnswerInputEnabled on both results pages. All checks pass.
  </done>
</task>

</tasks>

<verification>
1. `pnpm run workspace:check` passes (syncpack + typecheck + lint)
2. `pnpm run test:unit` passes
3. GamePlayerCard has showAnswer prop defaulting to true (no regression when flag enabled)
4. Both results pages use isAnswerInputEnabled to control answer visibility
</verification>

<success_criteria>

- Answer text hidden on results pages when feature flag is false
- Answer input field and submit button on game page unaffected
- All quality checks pass
- No visual regression when feature flag is true (default)
  </success_criteria>

<output>
After completion, create `.planning/quick/006-hide-answer-input-and-related-ui-when-fe/006-SUMMARY.md`
</output>
