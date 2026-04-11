---
created: 2026-04-11T16:52:45.761Z
title: Audit Figma mockups and implement design gaps
area: ui
files:
  - README.md (Figma file link and design section)
  - apps/game/assets/css/figma-tokens.generated.css
  - scripts/sync-figma-tokens.mjs
---

## Problem

Visual implementation should stay aligned with the **Riddle Rush** Figma file (source of truth per README). There is no tracked checklist of screen-by-screen parity: Dev Mode specs, tokens (`pnpm run figma:sync-tokens`), and `apps/game/assets/figma/` exports may drift from the live app without periodic review.

## Solution

1. Open the Figma file in Dev Mode (link in root `README.md` → Design section) and walk frames for main flows (menu, players, round, game, results, settings, modals).
2. Compare spacing, typography, colors, and component states to Nuxt pages/components; note gaps in this todo or spawn a small phase if scope is large.
3. Run or refresh token sync where variables changed; update `figma-tokens.generated.css` / SCSS cascade as documented in Phase 15 research.
4. Prefer incremental PRs per screen or component cluster; use existing game design components (`components/game/`) before adding one-off styles.

## Seeded checklist (copy to PR or tick as you audit)

- [ ] Menu (`pages/index.vue`) — spacing, typography, submenu
- [ ] Players (`pages/players.vue`)
- [ ] Round start (`pages/round-start.vue`) + wheel strip
- [ ] Game (`pages/game/[[gameId]].vue`)
- [ ] Results / scoring (`pages/results/[[gameId]].vue`)
- [ ] Leaderboard (`pages/leaderboard.vue`)
- [ ] Settings + language (`settings.vue`, `language.vue`)
- [ ] Pause / quit / post-round modals
- [ ] Tokens: `pnpm run figma:sync-tokens` when Figma variables change
