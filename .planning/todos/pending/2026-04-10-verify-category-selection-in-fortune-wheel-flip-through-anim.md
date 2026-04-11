---
created: 2026-04-10T20:20:55.583Z
title: Verify category selection in fortune wheel flip-through animation
area: ui
files:
  - apps/game/pages/round-start.vue
  - apps/game/components/game/FlipThroughAnimation.vue
---

## Problem

The fortune wheel was replaced by a flip-through animation on the round-start page. Need to verify that when a category is not explicitly selected via the fortune wheel mechanism, the words (categories) should appear randomly and then stop — settling on one final category.

Current behavior needs verification: do the categories flip through randomly and decelerate to a stop, or is there an issue with the selection logic? The user noted the words should "just appear random and then stop" — this needs to be confirmed as working correctly.

## Solution

1. Manually test the round-start page flip-through animation in the browser
2. Verify that categories cycle randomly and decelerate to a final selection
3. Check `FlipThroughAnimation.vue` component logic for proper random selection and deceleration
4. Confirm the selected category is correctly passed to the game session
5. Add E2E test coverage if behavior is confirmed correct, or fix if broken
