---
created: 2026-04-11T06:41:49.797Z
title: Add polished animations throughout the app
area: ui
files: []
---

## Problem

The app currently lacks visual polish in terms of animations and transitions. Pages load/switch without smooth transitions, interactive elements (buttons, cards, score counters) don't have satisfying micro-interactions, and component mounts/unmounts are abrupt. This makes the game feel less engaging and "game-like" than it should.

## Solution

Audit the entire app for animation opportunities and add tasteful, performant animations where they fit:

- **Page transitions**: Smooth route-to-route transitions (e.g., fade, slide)
- **Component mounts**: Staggered entry animations for lists (player names, leaderboard entries, score rows)
- **Interactive feedback**: Button press effects, score increment/decrement animations, coin counter changes
- **Game flow moments**: Letter reveal on game page, category panel appearance, round indicator updates
- **Fortune wheel**: Enhanced spin feedback, result celebration
- **Modals/overlays**: Smooth open/close for pause, quit, decision modals
- **Leaderboard**: Rank change animations, score bar growth

Use Vue `<Transition>` / `<TransitionGroup>`, CSS animations, and consider a lightweight library if needed. Keep animations short (150-300ms) and respect `prefers-reduced-motion`. This is an optional polish task — prioritize the most impactful spots first.

## Progress (2026-04-11)

- **Global route transition:** `app.vue` — `<NuxtPage>` `page-opacity` transition (~200ms fade, disabled when `prefers-reduced-motion`).
- **Next increments:** modal enter/leave, list stagger (players/leaderboard), score +/- micro-feedback.
