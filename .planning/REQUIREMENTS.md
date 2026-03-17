# Requirements: Visual Redesign to Match Mockups

**Project:** Riddle Rush — Visual Redesign
**Created:** 2026-01-31
**Status:** Active

---

## v1 Requirements

### Foundation (Design System)

- [ ] **FOUND-01**: Create game color tokens — blue gradient backgrounds, orange/gold borders, green/blue/orange button colors, yellow display text with glow
- [ ] **FOUND-02**: Create game typography tokens — display fonts with multi-layer text-shadow for embossed effect
- [ ] **FOUND-03**: Create game effects mixins — glossy gradients, embossed borders, multi-layer drop shadows
- [ ] **FOUND-04**: Create responsive scaling utilities — convert 1080×1920 mockup values to `clamp()` + viewport units

### Game Components

- [ ] **COMP-01**: GamePanel component — orange/gold bordered container with rounded corners (18-24px radius), inner glow
- [ ] **COMP-02**: GameButton component — gradient buttons (green for primary, blue for secondary, orange for home/warning) with embossed 3D effect, active press state
- [ ] **COMP-03**: GameDisplay component — yellow/gold text with glow effect for scores, letters, and counters
- [ ] **COMP-04**: GameHeader component — page title styling with decorative text effects
- [ ] **COMP-05**: GameBackground component — blue radial gradient container with spotlight effect
- [ ] **COMP-06**: GameModal component — styled modal dialog with colored header bar (red for quit, blue for pause) and backdrop
- [ ] **COMP-07**: GameScrollList component — scrollable player/leaderboard lists with consistent card styling

### Pages

- [ ] **PAGE-01**: Splash screen matches `Splash screen.png` — "RIDDLE RUSH" title with 3D text effect, animated loading bar at bottom
- [ ] **PAGE-02**: Main menu (`index.vue`) matches `start.png` — PLAY/MENU/OPTIONS/CREDITS buttons stacked vertically, no coins, no profile avatar
- [ ] **PAGE-03**: Players page (`players.vue`) matches `players.png` — +/- stepper for player count (1-6), styled name inputs with placeholder text, START GAME button
- [ ] **PAGE-04**: Game page (`game/[[gameId]].vue`) matches `alphabet.png` — round indicator top center, category in orange panel, large letter display, text input field between letter and NEXT button, back button top-left, nothing top-right
- [ ] **PAGE-05**: Scoring page (`results/[[gameId]].vue`) matches `scoring.png` — player cards with name and score, green +pts / red -pts indicators, NEXT ROUND button
- [ ] **PAGE-06**: Leaderboard page (`leaderboard.vue`) matches `leaderboard.png` — "Ranking" header, crown icons for top 3, numbered badges for 4-6, player names and scores
- [ ] **PAGE-07**: Settings page (`settings.vue`) matches `settings.png` — "OPTIONS" title, Sound/Music sliders with custom styled track and thumb, OK button
- [ ] **PAGE-08**: Language page (`language.vue`) matches `language-selector.png` — "LANGUAGE" title in panel, English/German rows with flag icons and checkmark indicator, OK button

### Modals

- [ ] **MODAL-01**: Quit Game modal matches `QUIT GAME.png` — red header bar with "QUIT GAME" title, "Are you sure you want to quit game?" text, red NO button, green YES button
- [ ] **MODAL-02**: Pause modal matches `menu.png` — blue header "Game Paused", resume message, green Resume button, blue Restart button, orange Home button
- [ ] **MODAL-03**: Post-round prompt modal — after all players score, ask to play another round or go to leaderboard

### Visual Polish & Refactoring

- [ ] **POLISH-01**: Audit all pages against docs/mockups/ — map each mockup to its page, document CSS gaps (colors, spacing, shadows, borders, fonts)
- [ ] **POLISH-02**: Prepare Figma sync pipeline — ensure design tokens flow through a CSS custom property layer that Figma variables can override (build on existing figma-tokens.generated.css pattern)
- [ ] **POLISH-03**: Add smooth page transition animations — consistent enter/leave transitions, component mount stagger effects, eliminate jarring navigation cuts
- [ ] **POLISH-04**: Refactor duplicated CSS/code — extract shared patterns into design system mixins or composables, eliminate copy-paste styling across pages
- [ ] **POLISH-05**: Fix known bugs — multiplayer round flow bug (skipping last player), game store complexity, intermittent nuxi typecheck error, any visual regressions

### State Management Migration (Pinia to Zustand)

- [ ] **MIGRATE-01**: Game store state and actions work via Zustand — raw store at stores/gameStore.ts with all getters and actions
- [ ] **MIGRATE-02**: Settings store works via Zustand with persist-only middleware — no manual load/save methods
- [ ] **MIGRATE-03**: All consumer files (composables, components, plugins, pages) import from focused Zustand hooks
- [ ] **MIGRATE-04**: Pinia fully removed — no @pinia/nuxt module, no pinia package, no old store files
- [ ] **MIGRATE-05**: All unit tests rewritten for Zustand — use store.setState() for isolation, no Pinia setup
- [ ] **MIGRATE-06**: localStorage migration from old Pinia format to Zustand persist envelope format
- [ ] **MIGRATE-07**: Feature flags and E2E test helpers work with Zustand stores

---

## v2 Requirements (Deferred)

- [ ] Dark mode theme variant
- [ ] Animated background particles/elements
- [ ] Sound effect integration with UI interactions
- [ ] Advanced micro-interactions (spring animations, haptic feedback)
- [ ] Custom slider component with visual fill indicator

---

## Out of Scope

| Exclusion                       | Reason                                                       |
| ------------------------------- | ------------------------------------------------------------ |
| Coin/currency system            | Not part of game mechanics — designer included speculatively |
| Profile avatar                  | No user account system in current game flow                  |
| Additional pages beyond mockups | Visual redesign only — no new features                       |
| Backend/API changes             | Frontend visual work only                                    |
| Desktop-optimized layouts       | Mobile-first PWA (tablets max, not desktop)                  |

---

## Traceability

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| FOUND-01    | Phase 1  | Pending  |
| FOUND-02    | Phase 1  | Pending  |
| FOUND-03    | Phase 2  | Complete |
| FOUND-04    | Phase 2  | Complete |
| COMP-01     | Phase 3  | Pending  |
| COMP-02     | Phase 4  | Pending  |
| COMP-03     | Phase 4  | Pending  |
| COMP-04     | Phase 5  | Pending  |
| COMP-05     | Phase 3  | Pending  |
| COMP-06     | Phase 5  | Pending  |
| COMP-07     | Phase 5  | Pending  |
| PAGE-01     | Phase 6  | Pending  |
| PAGE-02     | Phase 6  | Pending  |
| PAGE-03     | Phase 7  | Pending  |
| PAGE-04     | Phase 8  | Pending  |
| PAGE-05     | Phase 9  | Pending  |
| PAGE-06     | Phase 9  | Pending  |
| PAGE-07     | Phase 10 | Pending  |
| PAGE-08     | Phase 10 | Pending  |
| MODAL-01    | Phase 11 | Pending  |
| MODAL-02    | Phase 11 | Pending  |
| MODAL-03    | Phase 13 | Pending  |
| MIGRATE-01  | Phase 19 | Pending  |
| MIGRATE-02  | Phase 19 | Pending  |
| MIGRATE-03  | Phase 19 | Pending  |
| MIGRATE-04  | Phase 19 | Pending  |
| MIGRATE-05  | Phase 19 | Pending  |
| MIGRATE-06  | Phase 19 | Pending  |
| MIGRATE-07  | Phase 19 | Pending  |

---

_Last updated: 2026-03-17_
