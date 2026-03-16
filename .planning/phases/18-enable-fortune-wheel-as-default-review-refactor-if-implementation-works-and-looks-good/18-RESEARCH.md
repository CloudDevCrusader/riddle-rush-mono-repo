# Phase 18: Enable fortune-wheel as default review/refactor if implementation works and looks good - Research

**Researched:** 2026-03-15
**Domain:** Game flow default-mode behavior, feature flag precedence, round-start UX quality
**Confidence:** HIGH (repo-specific behavior), MEDIUM (visual-quality assessment criteria needs runtime verification)

## User Constraints

No `*-CONTEXT.md` exists for Phase 18, so there are no locked decisions from `/gsd-discuss-phase`.

- Locked decisions: none provided
- Claude's discretion: full planning discretion within roadmap/STATE constraints
- Deferred ideas: none explicitly provided for this phase

## Summary

Phase 18 is primarily a **default-behavior and quality-gate phase**, not a new feature build. The fortune wheel already exists and is integrated in `round-start.vue`; current behavior is controlled by `useFeatureFlags().isFortuneWheelEnabled`. When disabled, the app skips wheel UI and starts game immediately with random category/letter. When enabled, two wheels auto-spin, show result state briefly, then transition to game.

The critical planning insight is that "default" is currently split across **two control planes**:

1. local settings default (`stores/settings.ts`) and
2. GitLab Unleash remote flags (`plugins/gitlab-feature-flags.client.ts` + `useFeatureFlags.ts`).
   If GitLab client is configured, GitLab is authoritative. So changing local default alone will not guarantee wheel-default in deployed environments.

**Primary recommendation:** Plan Phase 18 as a staged rollout with explicit go/no-go quality criteria, then implement default change at the true source of authority (GitLab flag state and/or code fallback rules), with regression coverage for round flow, scoring flow, and refresh/resume behavior.

## Standard Stack

The established implementation stack for this domain:

### Core

| Library/Module                                 | Purpose                             | Why Standard Here                                                                |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| Nuxt 4 SPA (`apps/game`)                       | Page flow and UI rendering          | Existing architecture is client-only (`ssr: false`) and all game flow lives here |
| Pinia (`stores/settings.ts`, `stores/game.ts`) | Local defaults + game session state | Existing single state mechanism used across gameplay                             |
| Unleash via GitLab (`unleash-proxy-client`)    | Remote feature flags                | Already integrated and authoritative when configured                             |
| Playwright + Vitest                            | Behavior safety net                 | Existing unit + E2E suite already includes wheel-related assumptions             |

### Supporting

| Module                        | Purpose                                      | When to Use                           |
| ----------------------------- | -------------------------------------------- | ------------------------------------- |
| `useFeatureFlags.ts`          | Central flag resolution and precedence       | Any wheel default/flag logic change   |
| `pages/round-start.vue`       | Wheel vs random branch and transition timing | Any UX/default flow change            |
| `components/FortuneWheel.vue` | Wheel spin mechanics and visuals             | Refactor only if quality issues found |
| `docs/GAME-STATE-FLOW.md`     | Source of truth for documented transitions   | Update if flow semantics change       |

### Alternatives Considered

| Instead of                     | Could Use                             | Tradeoff                                                                                         |
| ------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Existing feature-flag pipeline | New custom toggle system              | Not justified; increases state complexity and conflicts with pending TODO to simplify mode state |
| Round-start flow branch        | New dedicated game-mode router branch | Adds architecture complexity before resolving single-source-of-truth concerns                    |

## Architecture Patterns

### Pattern 1: Feature-flag precedence for mode decisions

**What:** `useFeatureFlags()` resolves `isFortuneWheelEnabled` with GitLab client priority, then local settings fallback.

**When to use:** Any decision that claims "fortune wheel is default".

**Verified behavior:**

- `useFeatureFlags.ts`: if GitLab client exists, `isEnabled('fortune-wheel', false)` is used.
- Local `settingsStore.fortuneWheelEnabled` is only authoritative when GitLab is not configured.

### Pattern 2: Round-start bifurcation is the true mode switch

**What:** `pages/round-start.vue` contains explicit branch:

- disabled wheel -> choose random category+letter -> `startGame()` immediately
- enabled wheel -> render dual wheels -> auto-spin -> result reveal -> `startGame()`

**When to use:** Defining acceptance criteria and regression tests for mode default.

### Pattern 3: Multi-round lifecycle tied to store roundHistory/currentRound

**What:** `startGame()` in round-start chooses between initial setup, refresh recovery, and true next-round increment.

**When to use:** Any refactor touching wheel-default must preserve round increment semantics and refresh behavior.

### Recommended project touchpoints for this phase

1. `apps/game/composables/useFeatureFlags.ts`
2. `apps/game/stores/settings.ts`
3. `apps/game/pages/round-start.vue`
4. `apps/game/tests/unit/settings-store.spec.ts`
5. `apps/game/tests/unit/use-feature-flags.spec.ts`
6. `apps/game/tests/e2e/round-start.spec.ts` (+ related flow specs)
7. `docs/GAME-STATE-FLOW.md` / `CLAUDE.md` (if behavior contract changes)

## Don't Hand-Roll

| Problem                       | Don't Build                              | Use Instead                                                          | Why                                                                       |
| ----------------------------- | ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| "Default mode" config         | New parallel config object for game mode | Existing `useFeatureFlags()` + settings store                        | Avoids duplicate state ownership and conflicts with pending refactor TODO |
| Mode transition orchestration | New navigation state machine             | Existing `round-start.vue` + `gameStore.startNextRound/setupPlayers` | Current flow already encodes transition rules and DB persistence          |
| Flag transport                | Custom remote flag fetcher               | Existing GitLab Unleash plugin                                       | Already integrated, tested, and environment-aware                         |

**Key insight:** The lowest-risk path is to tighten and clarify current flag/default precedence rather than introducing any new mode system.

## Common Pitfalls

### Pitfall 1: Changing only local default does not change deployed default

**What goes wrong:** `fortuneWheelEnabled: true` in settings appears correct locally, but production still follows GitLab remote result.

**Why it happens:** `useFeatureFlags.ts` gives GitLab authority when client exists.

**How to avoid:** Include explicit rollout task for GitLab flag state and environment mapping (dev/staging/prod).

### Pitfall 2: "Works and looks good" is underspecified

**What goes wrong:** Default flips without clear UX quality baseline (timing, responsiveness, visual consistency), causing subjective review loops.

**How to avoid:** Add measurable gate criteria (mobile/desktop rendering, spin duration perception, no jank, no blocked flow).

### Pitfall 3: E2E fragility around round-start timing/selectors

**What goes wrong:** Tests flake because round-start can transition quickly and some tests rely on timing/specific classes.

**How to avoid:** Prefer stable `data-testid` hooks and branch-aware assertions (round-start or immediate game) where intended.

### Pitfall 4: Regressing round counter semantics during refactor

**What goes wrong:** Refresh/back to round-start accidentally increments rounds.

**How to avoid:** Preserve current checks using `roundHistory.length >= currentRound` and keep explicit regression tests.

## Code Examples

### Current mode gate in round-start

```ts
// apps/game/pages/round-start.vue
if (!isFortuneWheelEnabled.value) {
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
  const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)]
  selectedCategory.value = randomCategory ?? null
  selectedLetter.value = randomLetter ?? null
  await startGame()
  return
}
```

### Current flag precedence contract

```ts
// apps/game/composables/useFeatureFlags.ts
const isFortuneWheelEnabled = computed(() => {
  if (gitlabClient) {
    return isEnabled('fortune-wheel', false)
  }
  const settingsStore = useSettingsStore()
  return settingsStore.fortuneWheelEnabled
})
```

### Current local default (not authoritative with GitLab)

```ts
// apps/game/stores/settings.ts
const DEFAULT_SETTINGS = {
  fortuneWheelEnabled: false,
  websocketEnabled: false,
  answerInputEnabled: false,
}
```

## Planning Guidance for Phase 18

Recommended plan shape (prescriptive):

1. **Baseline audit + acceptance gate definition**
   - Define "works and looks good" criteria with measurable checks (flow correctness + visual quality + responsiveness).
   - Validate current wheel behavior against those criteria in local/dev env.

2. **Default enable implementation at real authority layer(s)**
   - Decide and implement default enable path across both local fallback and GitLab-configured environments.
   - If GitLab is used in target environments, include operational step to set `fortune-wheel` default on remote.

3. **Refactor only if quality audit fails**
   - Scope limited to issues proven by audit (e.g., timing constants, wheel UX clarity, duplicated logic).
   - Avoid broad game-mode redesign in this phase; track large refactor separately (already pending TODO).

4. **Regression test hardening**
   - Update/expand unit tests around settings/feature-flag precedence.
   - Update E2E around round-start behavior with stable selectors and deterministic expectations.

5. **Docs/state alignment**
   - Update flow docs if effective default semantics changed.
   - Reflect decisions in `.planning/STATE.md` and phase summaries.

## Open Questions

1. **Target environment authority for "default"**
   - What we know: GitLab is authoritative when configured.
   - Unclear: Which environments in active deployment actually provide GitLab flag config today.
   - Recommendation: Include an explicit environment matrix task in planning.

2. **Quality bar definition for "looks good"**
   - What we know: No explicit requirement IDs exist for phase 18.
   - Unclear: Exact visual/performance threshold for acceptance.
   - Recommendation: Define objective checklist at plan start (screen sizes, transition duration, no clipping/jank).

3. **Whether to expose wheel toggle in Settings UI**
   - What we know: Settings store has toggle action, settings page currently does not expose it.
   - Unclear: Should users retain manual override post-default change.
   - Recommendation: Treat as discretionary subtask only if required by product intent; otherwise keep hidden and controlled via flags.

## Sources

### Primary (HIGH confidence)

- `apps/game/pages/round-start.vue` - actual wheel/default branch and startup flow
- `apps/game/composables/useFeatureFlags.ts` - flag precedence contract
- `apps/game/plugins/gitlab-feature-flags.client.ts` - GitLab Unleash initialization/authority conditions
- `apps/game/stores/settings.ts` - local default values
- `apps/game/stores/game.ts` - round lifecycle and persistence-sensitive transitions
- `docs/GAME-STATE-FLOW.md` - documented state-machine expectations
- `.planning/STATE.md` - phase sequencing and pending refactor concerns
- `.planning/ROADMAP.md` - Phase 18 intent and dependency context

### Secondary (MEDIUM confidence)

- `apps/game/tests/e2e/round-start.spec.ts`
- `apps/game/tests/e2e/translations-check.spec.ts`
- `apps/game/tests/unit/settings-store.spec.ts`
- `apps/game/tests/unit/use-feature-flags.spec.ts`

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - directly derived from active repo implementation
- Architecture patterns: HIGH - confirmed in runtime flow code
- Pitfalls: HIGH - inferred from concrete precedence and test structure
- Quality gate recommendations: MEDIUM - requires runtime visual validation to finalize

**Research date:** 2026-03-15
**Valid until:** 2026-04-14 (or until feature-flag architecture/default semantics change)
