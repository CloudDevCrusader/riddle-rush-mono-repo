# Investigation Report: Missing Translations

## Findings

### 1. Missing Static Keys

A script analysis revealed 9 missing static translation keys in both `de.json` and `en.json`. These keys are used in the code but defined in the translation files.

**Missing Keys:**

- `menu.menu`
- `menu.options`
- `leaderboard.ranking`
- `leaderboard.finish`
- `leaderboard.finish_error`
- `scoring.title`
- `scoring.player`
- `scoring.next_round`
- `scoring.description`

### 2. Category Key Mismatch

There is a systematic mismatch between how category translations are looked up in the code and how they are defined in the translation files.

- **Code Usage:** `t('categories.' + cat.searchWord, cat.name)` (in `round-start.vue`)
- **Data Source:** `public/data/categories.json` defines `searchWord` (e.g., `Weiblicher_Vorname`, `Tier`, `Blumen`).
- **Translation Files:** `de.json` and `en.json` contain English-like keys for categories (e.g., `female_name`, `animal`, `flowers`), which **do not match** the `searchWord` values.

**Consequence:**

- The translation lookup fails (e.g., looking for `categories.Weiblicher_Vorname` but it doesn't exist).
- The fallback value `cat.name` is used.
- Since `cat.name` in `categories.json` is in German (e.g., "Weiblicher Vorname"), **English users see German category names**.

### 3. Missing Translations in Code

The following files were found to have missing translations based on the script analysis:

- `apps/game/pages/index.vue`
- `apps/game/pages/leaderboard.vue`
- `apps/game/pages/results/[[gameId]].vue`

## Implementation Notes

- **Added Missing Translations**: Integrated 150+ category translations and several missing static keys (menu, leaderboard, scoring) into `de.json` and `en.json`.
- **Localized UI Components**: Updated `game/[[gameId]].vue`, `GameHistory.vue`, and `Leaderboard.vue` to use translated category names instead of raw data.
- **Fixed Nuxt Configuration**: Resolved a path duplication issue in `nuxt.config.ts` where `langDir` was causing Nitro to look in `i18n/i18n/locales`.
- **Improved E2E Tests**: Refined the translation check E2E test to be robust against navigation reloads and asynchronous feature flags (Fortune Wheel).

## Test Results

- **Unit Tests**: `apps/game/tests/unit/translations.spec.ts` passes, verifying all categories have translations in both languages.
- **E2E Tests**: `apps/game/tests/e2e/translations-check.spec.ts` passes, confirming no raw translation keys are visible in the UI and category names are correctly localized.
- **Workspace Quality**: `pnpm run workspace:check` passed successfully (Syncpack + TypeScript + ESLint).
