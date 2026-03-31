# Phase 13: Visual Polish, Animations & Bug Fixes - Research

**Researched:** 2026-02-21
**Domain:** CSS fidelity, animations, Figma integration, code deduplication, bug fixing
**Confidence:** HIGH

## Summary

Phase 13 addresses five requirements: mockup CSS audit (POLISH-01), Figma sync pipeline preparation (POLISH-02), smooth page/component animations (POLISH-03), code deduplication (POLISH-04), and known bug fixes (POLISH-05).

The codebase is in strong shape after 12 completed phases. A comprehensive design system already exists with SCSS tokens, mixins (glossy, embossed, scaling, shadows), and 7 game-specific components (GameButton, GamePanel, GameBackground, GameHeader, GameModal, GameSlider, GameScrollList). Most pages use these components, but several visual gaps remain when comparing current implementations to the mockup images. Animation infrastructure exists (`@vueuse/motion`, Vue `<Transition>`, CSS keyframes) but is inconsistently applied. Significant CSS duplication exists across pages (keyframe definitions, page layout patterns, back button styles). Three known bugs require investigation.

**Primary recommendation:** Structure work in 5 streams matching the 5 POLISH requirements, starting with the mockup audit (POLISH-01) since it produces the gap analysis all other work depends on, followed by Figma prep (POLISH-02), then animations (POLISH-03), deduplication (POLISH-04), and bugs (POLISH-05) in parallel where possible.

<phase_requirements>

## Phase Requirements

| ID        | Description                                                                                                                  | Research Support                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| POLISH-01 | Audit all pages against docs/mockups/ -- map each mockup to its page, document CSS gaps                                      | Mockup-to-page mapping complete (see Mockup Audit section); visual gap analysis per page documented                                  |
| POLISH-02 | Prepare Figma sync pipeline -- ensure design tokens flow through CSS custom property layer that Figma variables can override | Existing infrastructure analyzed (figma-tokens.generated.css pattern, sync script); architecture for token override layer documented |
| POLISH-03 | Add smooth page transition animations -- consistent enter/leave transitions, component mount stagger effects                 | Current animation state audited; @vueuse/motion already installed; Nuxt page transition patterns documented                          |
| POLISH-04 | Refactor duplicated CSS/code -- extract shared patterns into design system mixins or composables                             | Duplication hotspots identified (keyframes, page layouts, back buttons, min-height patterns)                                         |
| POLISH-05 | Fix known bugs -- multiplayer round flow, game store complexity, nuxi typecheck error, visual regressions                    | All 3 bugs documented with root cause analysis and fix strategies                                                                    |

</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library            | Version  | Purpose                                 | Why Standard                                                        |
| ------------------ | -------- | --------------------------------------- | ------------------------------------------------------------------- |
| `@vueuse/motion`   | latest   | Directive-based animations (`v-motion`) | Already in nuxt.config modules; provides spring physics and stagger |
| Vue `<Transition>` | Built-in | Page/component enter/leave animations   | Native Vue; no extra dependency                                     |
| SCSS (via Vite)    | N/A      | Design system tokens, mixins, effects   | Already the established pattern in this project                     |
| UnoCSS             | latest   | Utility-first CSS classes               | Already configured; references SCSS CSS variables                   |

### Supporting

| Library               | Version  | Purpose                                     | When to Use                        |
| --------------------- | -------- | ------------------------------------------- | ---------------------------------- |
| `@vueuse/core`        | latest   | `useTransition`, `useMotion` composable API | For programmatic animation control |
| Nuxt `definePageMeta` | Built-in | Per-page transition configuration           | To set page-level transition names |

### Alternatives Considered

| Instead of               | Could Use          | Tradeoff                                                                         |
| ------------------------ | ------------------ | -------------------------------------------------------------------------------- |
| `@vueuse/motion`         | GSAP               | More powerful but adds 30KB+ bundle; overkill for this project's needs           |
| CSS keyframes            | Web Animations API | Better JS control but less browser support and unnecessary complexity            |
| Manual Figma sync script | Style Dictionary   | More structured token pipeline but adds tooling complexity for a small token set |

**No new dependencies needed.** All animation and styling work can be accomplished with the existing stack.

## Architecture Patterns

### Mockup-to-Page Mapping (POLISH-01)

Complete mapping of all 11 mockup files to their target pages/components:

| Mockup File             | Target                         | Current State                                                                                                         | Key Gaps                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Splash screen.png`     | `pages/splash.vue`             | Uses GameBackground + GameHeader. Loading bar exists.                                                                 | Title "RIDDLE RUSH" in mockup has thick gold 3D text with strong emboss; current uses GameHeader which is close but may need size/shadow tweaks. Loading bar track in mockup is orange/gold bordered; current uses white/transparent.                                                                                                                                             |
| `start.png`             | `pages/index.vue`              | Uses GameBackground + GameButton. 4 buttons stacked.                                                                  | Mockup shows "RIDDLE RUSH" title text above buttons (not a logo image); current uses `LOGO.png` image. Mockup has no coins/avatar (correct - already excluded). Button colors match: green PLAY, blue MENU, orange OPTIONS, orange CREDITS. Current CREDITS uses `secondary` variant (yellow) instead of `warning` (orange).                                                      |
| `players.png`           | `pages/players.vue`            | Functional but needs visual review.                                                                                   | Mockup shows stepper in orange-bordered panel at top; player name rows with label:input side-by-side. Greyed-out rows for inactive player slots. Green "Start Game" button with play icon at bottom.                                                                                                                                                                              |
| `alphabet.png`          | `pages/game/[[gameId]].vue`    | Complex page with category panel, letter display, input.                                                              | Mockup shows clean layout: back arrow (left), round indicator (center), no pause button (right is coins - excluded). Category panel has gold-bordered two-part design (orange "CATEGORY" header + cream "ANIMAL" body). Large 3D blue letter. Green NEXT button at bottom. Current has extra pause button and input form not in mockup (input is needed for multiplayer -- keep). |
| `scoring.png`           | `pages/results/[[gameId]].vue` | Uses GamePlayerCard with v-motion.                                                                                    | Mockup shows blue gradient player cards with name + answer + score badge. Scrollbar on right. Green "Next Round" button with play icon. Current implementation is close; verify card styling matches blue gradient with embossed borders.                                                                                                                                         |
| `leaderboard.png`       | `pages/leaderboard.vue`        | Uses GameScrollList with rank badges.                                                                                 | Mockup shows "Ranking" sub-header in bordered panel, crown icons for top 3, numbered badges for 4+. Clean white/cream player rows. Current implementation is close; verify crown/badge styling.                                                                                                                                                                                   |
| `settings.png`          | `pages/settings.vue`           | Uses GameHeader + GamePanel + GameSlider.                                                                             | Mockup shows blue panel with gold border containing Sound/Music sliders. Speaker/note icons on left. Sliders have wooden barrel track with green fill and brown peg thumb. Current GameSlider already implements this pattern. Verify icon placement matches mockup (icons should be to the left of labels).                                                                      |
| `language-selector.png` | `pages/language.vue`           | Uses GamePanel with emoji flags.                                                                                      | Mockup shows "LANGUAGE" title in bordered panel. Two rows: flag + name + checkmark. Green OK button. Current uses emoji flags (design decision). Verify panel styling and checkmark indicator match.                                                                                                                                                                              |
| `menu.png`              | `PauseModal.vue`               | Uses GameModal with stacked buttons.                                                                                  | Mockup shows blue panel with gold border. "Game Paused" header, message text, green Resume, blue Restart, orange Home buttons. Current implementation follows this pattern. Verify button icons (play, refresh, home) are present.                                                                                                                                                |
| `QUIT GAME.png`         | `QuitModal.vue`                | Uses GameModal with danger variant.                                                                                   | Mockup shows orange/gold bordered panel with red header bar "QUIT GAME". Text question. Red NO, green YES buttons side by side. Current implementation follows this pattern.                                                                                                                                                                                                      |
| `credits.jpeg`          | `pages/credits.vue`            | **OLD PATTERN** -- uses image-based approach with `BACKGROUND.png`, `CREDITS.png` title image, `ok.png` button image. | Major gap: credits.vue still uses the old image-based approach instead of game design system components. Should be refactored to use GameBackground, GameHeader, GamePanel, GameButton like settings.vue and language.vue.                                                                                                                                                        |

### Pages WITHOUT Mockups

| Page                       | Strategy                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/round-start.vue`    | **OLD PATTERN** -- uses `BACKGROUND.png` image, custom CSS. Should adopt GameBackground + design system tokens. Fortune wheel styling is custom (acceptable). |
| `pages/websocket-demo.vue` | Dev-only page. No styling work needed.                                                                                                                        |
| `pages/component-test.vue` | Dev-only page. No styling work needed.                                                                                                                        |

### Duplicated Code Hotspots (POLISH-04)

1. **`@keyframes` duplication** -- `fadeIn`, `scaleIn`, `slideUp` are redefined in:
   - `design-system.scss` (global)
   - `credits.vue` (scoped, duplicate)
   - `round-start.vue` (scoped, duplicate)
   - `SplashScreen.vue` (scoped, duplicate)
   - `SettingsModal.vue` (scoped, duplicate)

   **Fix:** Remove scoped duplicates; use global definitions from design-system.scss. Add `.animate-*` utility classes for common patterns.

2. **Page layout boilerplate** -- Every page repeats:

   ```css
   min-height: 100vh;
   min-height: 100dvh;
   position: relative;
   overflow: hidden;
   ```

   Found in 9 pages (splash, index, players, game, results, leaderboard, language, credits, round-start).

   **Fix:** Extract `.page-shell` utility class or use GameBackground which already provides full-height layout.

3. **Back button styling** -- Duplicated in:
   - `credits.vue` (image-based)
   - `game/[[gameId]].vue` (image-based)
   - `settings.vue` (CSS arrow)
   - `game.vue` layout (image-based)

   **Fix:** GameHeader already has a `#left` slot pattern (used by settings.vue). Standardize all pages to use GameHeader with back button slot, or extract a GameBackButton component.

4. **`.page-bg` pattern** -- Full-screen background image CSS duplicated in credits.vue, round-start.vue, game layout.

   **Fix:** These pages should use GameBackground component instead.

5. **Old image-based pages** -- `credits.vue` and `round-start.vue` use PNG images for UI elements (backgrounds, title text, buttons) instead of the CSS design system built in phases 1-5.

   **Fix:** Refactor to use GameBackground, GameHeader, GamePanel, GameButton.

### Figma Sync Pipeline Architecture (POLISH-02)

The existing infrastructure is partially set up (per MEMORY.md):

```
Current state:
- MCP server: figma-developer-mcp in .mcp.json
- Sync script: scripts/sync-figma-tokens.mjs (uses Figma Variables REST API)
- Output: apps/game/assets/css/figma-tokens.generated.css
- Load order: design-system.scss FIRST, then figma-tokens.generated.css (cascade overrides)
```

However, the sync script and generated CSS file do **not currently exist on disk** (glob returned no results). The pipeline needs to be created/restored.

**Architecture for token override:**

```
Layer 1: SCSS tokens → CSS custom properties (design-system.scss :root)
Layer 2: Figma tokens → CSS custom properties (figma-tokens.generated.css :root)
Layer 3: Runtime overrides → JavaScript (if needed)
```

Key requirement: Figma-generated CSS must use the **same custom property names** as design-system.scss so the cascade naturally overrides. The sync script must map Figma variable names to `--color-*`, `--font-size-*`, `--spacing-*` etc.

**Tasks needed:**

1. Create/restore `scripts/sync-figma-tokens.mjs` that reads Figma Variables API and writes CSS
2. Create empty `apps/game/assets/css/figma-tokens.generated.css` as placeholder
3. Add it to `nuxt.config.ts` CSS array (after design-system.scss)
4. Document the mapping convention (Figma variable name -> CSS property name)

### Animation Strategy (POLISH-03)

**Current state:**

- `@vueuse/motion/nuxt` is installed and configured with 4 directives: `pop-bottom`, `slide-left`, `slide-right`, `fade`
- `v-motion` is used in only 2 places: `results/[[gameId]].vue` and `GamePlayerCard.vue`
- Page transitions use Vue `<Transition>` with `opacity + translateY` in `app.vue`
- `PageTransition.vue` component exists with 4 transition types but is **not used anywhere**
- Many pages use CSS animation classes (`.animate-fade-in`, `.animate-scale-in`) inconsistently

**Recommended animation plan:**

1. **Page transitions:** Configure `definePageMeta({ pageTransition: { name: 'page' } })` or use Nuxt's built-in `app.vue` transition (already partially working). Make the existing `page-enter/leave` transition smoother with a slight scale + opacity.

2. **Component mount animations:** Use `v-motion` directives for staggered element reveals on page mount. Apply to:
   - Menu buttons on index.vue (stagger from top)
   - Player inputs on players.vue (stagger)
   - Score cards on results page (already done)
   - Leaderboard items (stagger)

3. **Modal animations:** GameModal should use scale + fade transition (verify current implementation).

4. **Micro-interactions:** Button press effects already exist via glossy-button mixin. Verify active states feel responsive.

5. **Reduced motion:** Honor `prefers-reduced-motion` (partially done in app.vue, needs to be consistent).

## Don't Hand-Roll

| Problem                        | Don't Build                  | Use Instead                                      | Why                                                       |
| ------------------------------ | ---------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Spring animations              | Custom spring physics        | `@vueuse/motion` spring directive                | Edge cases in physics simulation, already installed       |
| Page transitions               | Custom transition manager    | Nuxt `<NuxtPage>` with `pageTransition`          | Built-in, handles route changes correctly                 |
| CSS custom properties pipeline | Complex build-time transform | Simple CSS cascade (SCSS :root then Figma :root) | Cascade already handles priority; no build tooling needed |
| Staggered animations           | Manual `setTimeout` chains   | `v-motion` with `:delay="index * 100"`           | Cleaner, declarative, handles unmount                     |
| Reduced motion                 | Per-component checks         | CSS `@media (prefers-reduced-motion)`            | One rule covers all animations                            |

**Key insight:** The existing stack already has everything needed. The work is about consistently applying patterns that are already established, not adding new tools.

## Common Pitfalls

### Pitfall 1: Scoped CSS Specificity Conflicts

**What goes wrong:** Scoped styles in Vue SFC conflict with global design system styles, causing unexpected overrides.
**Why it happens:** Vue's scoped CSS adds `[data-v-xxx]` attribute selectors which can increase specificity.
**How to avoid:** Use `:deep()` for targeting child component styles. Prefer CSS custom properties (which cascade) over direct property overrides.
**Warning signs:** Component looks different when used in different pages.

### Pitfall 2: Animation Performance on Mobile

**What goes wrong:** Animations cause jank on low-end mobile devices.
**Why it happens:** Animating properties that trigger layout (width, height, margin) instead of compositor-only properties.
**How to avoid:** Only animate `transform` and `opacity`. Use `will-change` sparingly. Test on actual devices.
**Warning signs:** Choppy transitions on Pixel 5 viewport (Playwright mobile config).

### Pitfall 3: Figma Token Name Mismatch

**What goes wrong:** Figma variable names don't map cleanly to CSS custom property names, causing silent failures.
**Why it happens:** Figma uses its own naming convention (e.g., `color/primary/500`) while CSS uses `--color-primary`.
**How to avoid:** Define an explicit mapping table in the sync script. Log warnings for unmapped variables.
**Warning signs:** Colors don't change after running `figma:sync-tokens`.

### Pitfall 4: Removing Image Assets Breaks Offline/PWA

**What goes wrong:** Removing PNG assets that are cached by service worker causes 404s for offline users.
**Why it happens:** Service worker has cached old asset URLs. New CSS-only approach doesn't serve those URLs.
**How to avoid:** Keep image files in place during transition. Only remove after a full cache bust cycle. Update workbox globPatterns if needed.
**Warning signs:** Broken images when testing offline mode.

### Pitfall 5: Multiplayer Bug Root Cause Misidentification

**What goes wrong:** Fix addresses symptoms but not root cause of the "skipping last player" bug.
**Why it happens:** The round flow involves multiple async operations (submitPlayerAnswer, completeRound, startNextRound) and reactive state (allPlayersSubmitted getter).
**How to avoid:** Write a focused unit test reproducing the exact sequence: 2 players, both submit in round 1, verify allPlayersSubmitted transitions correctly. Check if the issue is in hasSubmitted reset timing during round transitions.
**Warning signs:** Bug reappears with different player counts.

## Code Examples

### Pattern 1: Staggered v-motion Animation (Already Used)

```vue
<!-- From results/[[gameId]].vue -->
<GamePlayerCard
  v-for="(player, index) in players"
  :key="player.id"
  v-motion
  :initial="{ opacity: 0, y: 50 }"
  :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
/>
```

### Pattern 2: Page Shell Utility Class (To Create)

```scss
// Add to design-system.scss
.page-shell {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  width: 100%;
}
```

### Pattern 3: Nuxt Page Transition Configuration

```vue
<!-- In each page that needs a specific transition -->
<script setup>
definePageMeta({
  pageTransition: {
    name: 'page',
    mode: 'out-in',
  },
})
</script>
```

### Pattern 4: Figma Token Override CSS

```css
/* figma-tokens.generated.css */
/* Auto-generated by scripts/sync-figma-tokens.mjs -- DO NOT EDIT */
:root {
  /* These override design-system.scss values via cascade */
  --color-bg-blue-light: #1cc6ff;
  --color-btn-green-light: #b7ff6d;
  /* ... */
}
```

### Pattern 5: Reduced Motion Global Rule

```scss
// Add to design-system.scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Known Bug Analysis (POLISH-05)

### Bug 1: Multiplayer Round Flow Skipping Last Player

**Symptom:** With 2-3 players, the last player in round 1 is skipped.
**Location:** `usePlayerManager.ts` -> `getCurrentPlayerTurn()`, `allPlayersSubmitted()`, and the game page `submitAnswer()` flow.
**Analysis:**

- `getCurrentPlayerTurn()` returns `players.find(p => !p.hasSubmitted)` -- straightforward
- `allPlayersSubmitted()` returns `players.every(p => p.hasSubmitted)` -- straightforward
- Potential issue: In `startNextRound()`, `resetPlayerRoundState()` is called which resets `hasSubmitted` for all players. If this races with the UI check for `allPlayersSubmitted`, the last player's submission could be missed.
- Another potential cause: The `submitAnswer()` function in the game page checks `allPlayersSubmitted` after submitting, but since Pinia state updates are synchronous, this should be reliable. The issue may be in the **round transition logic** in `round-start.vue` or how `startNextRound` interacts with the round count.
  **Confidence:** MEDIUM -- need to reproduce with unit test
  **Fix strategy:** Write targeted unit test with exact 2-player sequence. Add logging to `submitPlayerAnswer` and `allPlayersSubmitted` to trace state transitions.

### Bug 2: Game Store Complexity (~352 lines)

**Symptom:** Store is large and has been partially refactored (composables extracted in phase 12).
**Current state:** Store is now a thin delegation layer (~334 lines) calling composables. The 12-06 through 12-08 plans already extracted `useCategoryManager`, `useSessionManager`, `usePlayerManager`, `useScoringEngine`, `usePersistence`, `useGameLifecycle`.
**Assessment:** This is largely resolved. Remaining simplification could include removing unused getters or consolidating similar actions, but it's no longer a high-priority concern.
**Confidence:** HIGH
**Fix strategy:** Review for any remaining dead code or getter simplification opportunities. Low priority.

### Bug 3: Intermittent `nuxi typecheck` Error Related to `@vite-pwa/nuxt`

**Symptom:** TypeScript check sometimes fails with errors related to PWA module types.
**Analysis:** `nuxt.config.ts` has `typeCheck: false` so this only surfaces when running `nuxi typecheck` explicitly. The issue is likely caused by `@vite-pwa/nuxt` generating types that conflict with Nuxt's type system, especially during parallel type generation.
**Confidence:** LOW -- intermittent, hard to reproduce
**Fix strategy:**

1. Check if `@vite-pwa/nuxt` has a newer version that fixes the type issue
2. Add PWA types to `tsconfig.json` excludes if needed
3. Consider adding `@vite-pwa/nuxt` to the `skipLibCheck` scope

## State of the Art

| Old Approach                                 | Current Approach                               | When Changed            | Impact                                                                      |
| -------------------------------------------- | ---------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| Image-based UI (PNG buttons, backgrounds)    | CSS design system components                   | Phase 1-11 (2026-01-31) | Most pages migrated; credits.vue and round-start.vue still use old approach |
| Global CSS keyframes scattered in components | Centralized in design-system.scss              | Phase 1-2               | But scoped duplicates still exist in 4+ components                          |
| Manual state management                      | Extracted composables (usePlayerManager, etc.) | Phase 12 (2026-02-16)   | Store is now thin delegation layer                                          |

**Deprecated/outdated:**

- `PageTransition.vue` component: Created but never integrated. Consider using Nuxt's built-in `pageTransition` config instead.
- Image-based UI in `credits.vue` and `round-start.vue`: Should migrate to design system components.

## Open Questions

1. **Figma Access Token availability**
   - What we know: MCP config references `FIGMA_ACCESS_TOKEN`; sync script path is documented
   - What's unclear: Whether the token is currently configured and whether Figma file has variables defined
   - Recommendation: Create the pipeline code assuming token exists; fail gracefully with helpful error if not

2. **Mockup visual fidelity threshold**
   - What we know: Requirement says "pixel-perfect CSS fidelity"
   - What's unclear: How strictly to match given CSS-first approach (mockups were designed as high-fidelity renders)
   - Recommendation: Match layout, colors, shadows, and proportions; accept minor rendering differences as inherent to CSS vs raster image comparison

3. **round-start.vue fortune wheel redesign scope**
   - What we know: Fortune wheel is a custom component with its own visual style
   - What's unclear: Whether fortune wheel itself needs visual polish (no mockup exists for it)
   - Recommendation: Apply GameBackground and design system tokens to the page wrapper; leave FortuneWheel internals as-is unless specifically requested

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis of all 12 pages, 27 components, design system files
- Visual comparison of 11 mockup images against current page implementations
- Git status showing current modifications (useAssets.ts, useAudio.ts, useGameActions.ts, useGameActions.spec.ts)

### Secondary (MEDIUM confidence)

- `@vueuse/motion` documentation (already installed and configured in nuxt.config.ts)
- Nuxt 4 page transition API (compatible with Vue 3 Transition component)
- Figma Variables REST API documentation (referenced in MEMORY.md)

### Tertiary (LOW confidence)

- Root cause of multiplayer round flow bug (needs reproduction to confirm)
- Intermittent nuxi typecheck error (needs reproduction to confirm)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all tools already installed, no new dependencies
- Architecture: HIGH -- patterns established in phases 1-12, just need consistent application
- Mockup gaps: HIGH -- direct visual comparison completed for all 11 mockups
- Bug fixes: MEDIUM -- bugs documented but need reproduction to confirm root causes
- Figma pipeline: MEDIUM -- infrastructure references exist but actual files are missing from disk

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (stable domain, no fast-moving dependencies)
