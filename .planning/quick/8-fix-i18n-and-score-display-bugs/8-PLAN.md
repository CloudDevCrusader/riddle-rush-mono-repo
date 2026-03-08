---
phase: quick-008
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/pages/game/[[gameId]].vue
  - apps/game/pages/settings.vue
  - apps/game/pages/results/[[gameId]].vue
autonomous: true
requirements: [BUG-001, BUG-002, BUG-003, BUG-004]

must_haves:
  truths:
    - "Game page shows translated 'KATEGORIE' label (not hardcoded 'CATEGORY') when locale is de"
    - "Game page shows translated 'WEITER' button text (not hardcoded 'NEXT') when locale is de"
    - 'Settings page shows translated header, slider labels, and page title when locale is de'
    - 'Results page score label next to player name updates reactively when +/- buttons are pressed'
  artifacts:
    - path: 'apps/game/pages/game/[[gameId]].vue'
      provides: 'i18n-ified category label and next button'
      contains: "t('common.category')"
    - path: 'apps/game/pages/settings.vue'
      provides: 'i18n-ified settings page'
      contains: "t('settings.sound')"
    - path: 'apps/game/pages/results/[[gameId]].vue'
      provides: 'Reactive pending score display'
      contains: 'pendingScores.get(player.id)'
  key_links:
    - from: 'apps/game/pages/game/[[gameId]].vue'
      to: 'translations/locales/de.json'
      via: 'usePageSetup() t() function'
      pattern: "t\\('common\\.(category|next)'\\)"
    - from: 'apps/game/pages/settings.vue'
      to: 'translations/locales/de.json'
      via: 'usePageSetup() t() function'
      pattern: "t\\('(settings|menu)\\."
    - from: 'apps/game/pages/results/[[gameId]].vue'
      to: 'pendingScores reactive Map'
      via: 'template binding'
      pattern: "pendingScores\\.get\\(player\\.id\\)"
---

<objective>
Fix 4 bugs: 3 hardcoded English strings (game page, settings page) and 1 score display reactivity issue (results page).

Purpose: All visible text must use i18n translation keys so the app displays correctly in German (default locale). The results page score label must reflect pending score changes in real-time.
Output: 3 patched Vue files with correct i18n usage and reactive bindings.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/game/translations/locales/de.json

Available i18n keys (from de.json):

- `common.category` = "Kategorie"
- `common.next` = "WEITER"
- `menu.options` = "Optionen"
- `settings.sound` = "Sound"
- `settings.music` = "Musik"
- `settings.title` = "Einstellungen"

The `usePageSetup()` composable returns `{ t, baseUrl, toast, ... }`.
The game page already uses `usePageSetup()` at line 158.
The settings page does NOT import `t` — it only uses `useRouter()` and `useSettingsStore()`.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix hardcoded English on game page and settings page</name>
  <files>apps/game/pages/game/[[gameId]].vue, apps/game/pages/settings.vue</files>
  <action>
**Game page (`apps/game/pages/game/[[gameId]].vue`):**
- Line 60: Replace `<div class="category-label">CATEGORY</div>` with `<div class="category-label">{{ t('common.category').toUpperCase() }}</div>`
- Line 151: Replace `<span class="next-text">NEXT</span>` with `<span class="next-text">{{ t('common.next') }}</span>`
- Note: `t` is already destructured from `usePageSetup()` on line 158, so no script changes needed.

**Settings page (`apps/game/pages/settings.vue`):**

- In `<script setup>`, add `const { t } = usePageSetup()` after the existing `const router = useRouter()` line (line 36). Keep the router line since `usePageSetup` returns `router` but the existing code uses `router.back()` which is fine.
- Line 11: Replace `OPTIONS` (slot content of GameHeader) with `{{ t('menu.options') }}`
- Line 19: Replace `<span class="slider-label">Sound</span>` with `<span class="slider-label">{{ t('settings.sound') }}</span>`
- Line 25: Replace `<span class="slider-label">Music</span>` with `<span class="slider-label">{{ t('settings.music') }}</span>`
- Line 100: Replace `title: 'Settings'` with `title: t('settings.title')`
- Line 104: Replace `content: 'Game settings'` with `content: t('settings.title')`
  </action>
  <verify>
  <automated>cd /Users/markuswagner/projects/riddle-rush-mono-repo && pnpm run workspace:check</automated>
  </verify>
  <done>Game page category label and next button use i18n keys. Settings page header, slider labels, and page title all use i18n keys. No hardcoded English remains in either file.</done>
  </task>

<task type="auto">
  <name>Task 2: Fix results page score label reactivity</name>
  <files>apps/game/pages/results/[[gameId]].vue</files>
  <action>
In `apps/game/pages/results/[[gameId]].vue`, line 28-30, the base score span shows `player.totalScore` which is the cumulative score from prior rounds and does NOT update when +/- buttons are pressed (those modify `pendingScores`).

Replace the base score display:

```html
<span class="scoring-page__base-score" data-testid="base-score">
  {{ player.totalScore }} {{ t('scoring.points', 'pts') }}
</span>
```

With:

```html
<span class="scoring-page__base-score" data-testid="base-score">
  {{ pendingScores.get(player.id) ?? 0 }} {{ t('scoring.points', 'pts') }}
</span>
```

This ensures the points label next to each player name updates reactively as +/- buttons are pressed, matching the value shown in the GameDisplay counter below.
</action>
<verify>
<automated>cd /Users/markuswagner/projects/riddle-rush-mono-repo && pnpm run workspace:check</automated>
</verify>
<done>The score label next to each player name on the results page updates in real-time when +/- buttons are clicked, displaying `pendingScores` value instead of the static `totalScore`.</done>
</task>

</tasks>

<verification>
1. `pnpm run workspace:check` passes (TypeScript, ESLint, Syncpack)
2. Grep for hardcoded strings removed:
   - `grep -n "CATEGORY" apps/game/pages/game/\[\[gameId\]\].vue` should NOT find line 60 match
   - `grep -n '"NEXT"' apps/game/pages/game/\[\[gameId\]\].vue` should NOT find line 151 match
   - `grep -n "OPTIONS\|>Sound<\|>Music<\|title: 'Settings'" apps/game/pages/settings.vue` should return no matches
3. Grep for i18n usage added:
   - `grep -n "t('common.category')" apps/game/pages/game/\[\[gameId\]\].vue` returns match
   - `grep -n "t('common.next')" apps/game/pages/game/\[\[gameId\]\].vue` returns match
   - `grep -n "t('menu.options')" apps/game/pages/settings.vue` returns match
   - `grep -n "pendingScores.get(player.id)" apps/game/pages/results/\[\[gameId\]\].vue` returns match at base-score span
</verification>

<success_criteria>

- All 4 bugs fixed: no hardcoded English on game page, settings page fully translated, results score label reactive
- `pnpm run workspace:check` passes
- No regressions introduced
  </success_criteria>

<output>
After completion, create `.planning/quick/8-fix-i18n-and-score-display-bugs/8-SUMMARY.md`
</output>
