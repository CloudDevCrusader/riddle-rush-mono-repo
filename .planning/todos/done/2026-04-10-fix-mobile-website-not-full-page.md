---
created: 2026-04-10T20:45:00.000Z
title: Fix mobile website not being full page (2/3 of screen is gray)
area: ui
files:
  - apps/game/layouts/default.vue
  - apps/game/app.vue
---

## Problem

On mobile browsers, the website only occupies approximately 2/3 of the screen, with the remaining portion displaying as gray. This is a viewport/layout issue where the app content does not fill the full mobile viewport height.

## Solution

1. Inspect the root layout and app container CSS for height constraints
2. Check for missing `min-height: 100dvh` or equivalent on the root container
3. Verify viewport meta tag is correctly set (especially `viewport-fit=cover` for notched devices)
4. Test with mobile Safari and Chrome dev tools to identify the gray area source
5. Fix the CSS to ensure full-page rendering on all mobile viewports
6. Verify the fix on multiple device sizes (iPhone SE, iPhone 15 Pro, Pixel 5, iPad)


---

## Completed 2026-04-11
- `layouts/default.vue`: `layout-container` / `page-content` flex column, `min-height: 100dvh`, full width.
