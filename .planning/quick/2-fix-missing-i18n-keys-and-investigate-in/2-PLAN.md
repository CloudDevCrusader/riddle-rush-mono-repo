---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/translations/locales/de.json
  - apps/game/translations/locales/en.json
  - apps/game/nuxt.config.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - 'Translation keys always resolve correctly on first load, hard refresh, and PWA reinstall'
    - 'No duplicate top-level keys exist in de.json or en.json'
    - 'The scoring section contains all required keys (title, player, description, confirm_scores, next_round, finish_game, play_another_round, round_complete, error_saving)'
    - 'Locale messages are bundled into the app chunk — not lazy-loaded at runtime — so they are always available'
  artifacts:
    - path: 'apps/game/translations/locales/de.json'
      provides: 'German translations — single canonical scoring block'
    - path: 'apps/game/translations/locales/en.json'
      provides: 'English translations — single canonical scoring block'
    - path: 'apps/game/nuxt.config.ts'
      provides: 'i18n config with lazy loading disabled and PWA caching of JSON files'
  key_links:
    - from: 'apps/game/translations/i18n.config.ts'
      to: 'apps/game/nuxt.config.ts i18n.bundle'
      via: 'static import + bundle.runtimeOnly: false'
      pattern: 'runtimeOnly.*false'
---

<objective>
Fix two distinct i18n problems:
1. Intermittent key loading failures caused by a dual-loading conflict: `i18n.config.ts` statically bundles messages while the `file` property on each locale also triggers @nuxtjs/i18n v10's runtime lazy-loading. Whichever loads last wins, causing race conditions — especially with PWA service workers.
2. Silent data loss from duplicate `scoring` top-level keys in both locale files. JSON parsers silently discard the first duplicate; the initial `scoring` block (lines ~198-203) is dropped, overwritten by the second block starting at line ~247.

Purpose: Reliable translations on every load, including offline/PWA, hard refresh, and cold start.
Output: Clean locale files (no duplicates) and a single message-loading strategy (static bundle only).
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

# Key files

@apps/game/nuxt.config.ts
@apps/game/translations/i18n.config.ts
@apps/game/translations/locales/de.json
@apps/game/translations/locales/en.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix duplicate scoring keys in both locale files</name>
  <files>
    apps/game/translations/locales/de.json
    apps/game/translations/locales/en.json
  </files>
  <action>
Both de.json and en.json contain two separate `scoring` top-level blocks. JSON parsers silently keep the last one, discarding the first. The first block (around line 198) has basic keys; the second (around line 247) has the full set used by the scoring page. The fix is to remove the first (orphaned) `scoring` block from each file and keep only the second complete one.

In de.json, remove the first `scoring` block (the one with only these 4 keys):

```json
"scoring": {
    "title": "Punktestand",
    "player": "Spieler",
    "next_round": "Nächste Runde",
    "description": "Hier sind die Ergebnisse der letzten Runde"
  },
```

In en.json, remove the first `scoring` block (the one with only these 4 keys):

```json
"scoring": {
    "title": "Scoring",
    "player": "Player",
    "next_round": "Next Round",
    "description": "Here are the results of the last round"
  },
```

The surviving `scoring` block in both files contains the full key set required by the scoring page (`confirm_scores`, `description`, `error_saving`, `finish_game`, `next_round`, `play_another_round`, `player`, `round_complete`, `title`).

After editing, validate JSON is well-formed:

```bash
python3 -c "import json; json.load(open('apps/game/translations/locales/de.json')); print('de.json OK')"
python3 -c "import json; json.load(open('apps/game/translations/locales/en.json')); print('en.json OK')"
```

  </action>
  <verify>
Run from the repo root:
```bash
python3 -c "
import json
for lang in ['de', 'en']:
    with open(f'apps/game/translations/locales/{lang}.json') as f:
        d = json.load(f)
    keys = list(d.get('scoring', {}).keys())
    print(f'{lang}.json scoring keys:', keys)
    required = ['title', 'player', 'next_round', 'description', 'confirm_scores', 'finish_game', 'play_another_round', 'round_complete', 'error_saving']
    missing = [k for k in required if k not in keys]
    print('  Missing:', missing or 'none')
"
```
  </verify>
  <done>Both locale files parse as valid JSON, each has exactly one `scoring` block, and all required scoring keys are present. No `missing` keys reported.</done>
</task>

<task type="auto">
  <name>Task 2: Fix intermittent loading by disabling runtime lazy-loading</name>
  <files>apps/game/nuxt.config.ts</files>
  <action>
The root cause of intermittent key loading: `translations/i18n.config.ts` statically imports and bundles all messages into the app chunk via `messages: { en, de }`. BUT the locale entries in `nuxt.config.ts` also have a `file` property (`file: 'en.json'`, `file: 'de.json'`), which tells @nuxtjs/i18n v10 to also lazy-load those locale files at runtime as separate network requests.

These two mechanisms conflict: sometimes the runtime fetch completes and overwrites the already-bundled messages with an empty/partial result mid-navigation, producing intermittent missing keys with no console errors.

The fix has two parts:

**Part A — Remove the `file` property from locale entries** to prevent @nuxtjs/i18n from issuing runtime fetch requests for locale JSON files. Messages are already bundled via `i18n.config.ts`, so `file` is redundant and harmful here.

Change the locales array from:

```ts
locales: [
  { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
  { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
],
```

To:

```ts
locales: [
  { code: 'en', iso: 'en-US', name: 'English' },
  { code: 'de', iso: 'de-DE', name: 'Deutsch' },
],
```

Also remove `langDir: 'translations/locales'` from the i18n config since it's only needed when using file-based lazy loading. The `vueI18n: 'translations/i18n.config'` remains — this is what loads messages.

**Part B — Add JSON locale files to PWA precache** so that if file-based loading is ever re-enabled, locale files are always available offline. In the `pwa.workbox.globPatterns` array, change:

```ts
globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
```

to:

```ts
globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2,json}'],
```

Note: `langDir` can be removed from the i18n config object since it's only used for file-based loading which we're eliminating. Keep `restructureDir: '.'` as it affects other path resolution.
</action>
<verify>

1. Confirm `file` property is gone from locale entries:

```bash
grep -n "file:" apps/game/nuxt.config.ts | grep -i "json"
```

Should return no output.

2. Confirm `vueI18n` config reference still exists:

```bash
grep -n "vueI18n" apps/game/nuxt.config.ts
```

Should show `vueI18n: 'translations/i18n.config'`.

3. Confirm globPatterns now includes json:

```bash
grep -n "globPatterns" apps/game/nuxt.config.ts
```

Should show `json` in the pattern.

4. TypeScript check passes:

```bash
cd apps/game && pnpm run typecheck 2>&1 | tail -5
```

  </verify>
  <done>No `file:` property on locale entries, `vueI18n` reference intact, globPatterns includes json, TypeScript passes. Dev server starts and translations display on first load without hard refresh.</done>
</task>

</tasks>

<verification>
After both tasks:

1. JSON validity check:

```bash
python3 -c "import json; [json.load(open(f'apps/game/translations/locales/{l}.json')) for l in ['de','en']]; print('Both JSON files valid')"
```

2. No duplicate keys:

```bash
python3 -c "
import json, re
for lang in ['de', 'en']:
    with open(f'apps/game/translations/locales/{lang}.json') as f:
        content = f.read()
    keys = re.findall(r'^\s{2}\"([^\"]+)\":', content, re.MULTILINE)
    from collections import Counter
    dupes = {k: v for k, v in Counter(keys).items() if v > 1}
    print(f'{lang}.json duplicates:', dupes or 'none')
"
```

3. Dev server starts cleanly:

```bash
cd apps/game && timeout 15 pnpm run dev 2>&1 | grep -E "ready|error|warn" | head -10
```

</verification>

<success_criteria>

- Both locale JSON files are valid and duplicate-free
- The `scoring` section in each locale has all 9 required keys
- No `file:` property on locale entries in nuxt.config.ts (eliminates lazy-load race)
- PWA globPatterns includes `json` for offline resilience
- `pnpm run typecheck` passes
  </success_criteria>

<output>
After completion, create `.planning/quick/2-fix-missing-i18n-keys-and-investigate-in/2-SUMMARY.md`
</output>
