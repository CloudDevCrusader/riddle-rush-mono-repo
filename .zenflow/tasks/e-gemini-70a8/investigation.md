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

## Proposed Solution

1.  **Fix Static Keys:** Add the 9 missing keys to `de.json` and `en.json` with appropriate translations.
2.  **Fix Category Keys:**
    - Update `de.json` and `en.json` to include keys matching the `searchWord` from `categories.json`.
    - Map the existing translations (where applicable) to the new keys.
    - Ensure English translations are provided for all categories.
3.  **Automated Verification:**
    - Convert the analysis script into a unit test to prevent regression.
    - Add an E2E test to verify that category names are correctly translated in the app (e.g., check that "Animal" is shown in English mode, not "Tier").

## Testing Plan

### Unit Tests
- Create a test file `apps/game/tests/unit/translations.spec.ts`.
- Implement a test that scans code for `t()` usages and verifies keys exist in `de.json` and `en.json`.
- Verify that `categories.json` `searchWord`s have corresponding keys in `de.json` and `en.json`.

### E2E Tests
- Update or create an E2E test that switches the language to English.
- Verify that keys are not displayed on the screen.
- Verify that specific category names are displayed in English.
