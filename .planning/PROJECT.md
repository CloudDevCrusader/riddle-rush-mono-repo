# Riddle Rush — Visual Redesign to Match Mockups

## What This Is

A visual overhaul of all Riddle Rush screens to match the designer's mockups pixel-for-pixel. The app is a Nuxt 4 PWA word-guessing game that already works functionally — this project brings the UI in line with the original design vision. No new features, no coins system — just making every screen look like the mockups.

## Core Value

Every screen in the app must visually match its corresponding mockup at 1080×1920 base resolution while scaling responsively to all screen sizes.

## Requirements

### Validated

- ✓ Game flow works (menu → players → round-start → game → results → leaderboard) — existing
- ✓ IndexedDB persistence for game sessions — existing
- ✓ Multi-player support (up to 6 players) — existing
- ✓ i18n support (German/English) — existing
- ✓ PWA with offline support — existing
- ✓ Answer validation via PetScan API + offline data — existing
- ✓ Pause and Quit modals — existing

### Active

- [ ] Game page (`game/[[gameId]].vue`) matches `alphabet.png` mockup — no coins, text input between letter and NEXT, back button left, round indicator centered, nothing top-right
- [ ] Main menu (`index.vue`) matches `start.png` mockup — no coins, no profile avatar
- [ ] Players page (`players.vue`) matches `players.png` mockup — no coins, +/- player count, styled name inputs
- [ ] Scoring/Results page (`results/[[gameId]].vue`) matches `scoring.png` mockup — no coins, player cards with +/- point indicators
- [ ] Leaderboard page (`leaderboard.vue`) matches `leaderboard.png` mockup — no coins, crown/badge rankings
- [ ] Settings page (`settings.vue`) matches `settings.png` mockup — Sound/Music sliders with styled controls
- [ ] Language page (`language.vue`) matches `language-selector.png` mockup — flag icons with checkmark selection
- [ ] Splash/Loading screen matches `Splash screen.png` mockup — "RIDDLE RUSH" title with loading bar
- [ ] Quit Game modal matches `QUIT GAME.png` mockup — styled YES/NO buttons in card dialog
- [ ] Pause modal matches `menu.png` mockup — Resume/Restart/Home buttons in styled card

### Out of Scope

- Profile avatar / user accounts — not part of current game flow
- New game features — this is a visual alignment project only
- Back-end / API changes — frontend-only work

## Context

- Designer delivered mockups at 1080×1920 (9:16 mobile portrait)
- Current app has working game logic but UI doesn't match mockups
- The app uses CSS custom properties via a design system (`assets/scss/design-system.scss`)
- Components use scoped styles in Vue SFCs
- Some mockup assets already exist in `public/assets/alphabets/` (back.png, CATEGORY.png, next.png, BACKGROUND.png)
- The app is a client-side SPA (SSR disabled) deployed to AWS via S3 + CloudFront

## Constraints

- **Tech stack**: Nuxt 4 + Vue 3 + TypeScript — no changes to framework
- **No coins**: The coin/currency display from mockups is explicitly excluded everywhere
- **Text input stays**: Game page keeps the player answer text field (not in mockup but required for gameplay)
- **Responsive**: Must scale from small phones to tablets despite 1080×1920 base
- **Existing assets**: Use assets already in `public/assets/` where possible, create new CSS for the rest
- **No new dependencies**: Achieve mockup look with CSS/SVG, avoid adding image-heavy UI libraries

## Key Decisions

| Decision                     | Rationale                                                                          | Outcome    |
| ---------------------------- | ---------------------------------------------------------------------------------- | ---------- |
| Keep text input on game page | Required for multiplayer answer submission                                         | -- Pending |
| No pause button top-right    | Simplify game header; pause via ESC key or back button                             | -- Pending |
| CSS-first approach           | Mockup style (gradients, borders, shadows) achievable with CSS, avoid heavy images | -- Pending |

---

_Last updated: 2026-01-31 after initialization_
