---
created: 2026-03-02T03:50:42.395Z
title: Research and select feature flag solution
area: general
files:
  - apps/game/composables/useFeatureFlags.ts
  - apps/game/nuxt.config.ts
---

## Problem

The project currently references Unleash for feature flags (via `useFeatureFlags()` composable), but the setup may be tied to GitLab's feature flag integration. Need to evaluate whether to:

1. **Stay with Unleash** (unleash.io) — open-source, self-hosted or cloud, GitLab has built-in integration
2. **Switch to GitHub-native solution** — GitHub doesn't have built-in feature flags, would need a third-party service
3. **Use a standalone service** — LaunchDarkly, Flipt, Flagsmith, PostHog feature flags, etc.

Key considerations:

- Project is moving/has moved CI/CD from GitLab to GitHub
- Unleash works independently of GitLab (it's a separate service)
- Cost, complexity, and self-hosting vs managed trade-offs
- Current `useFeatureFlags()` composable would need updating if switching providers

## Solution

Research phase:

1. Audit current `useFeatureFlags.ts` to understand existing Unleash integration depth
2. Evaluate options: Unleash standalone, Flagsmith (open-source), PostHog flags, LaunchDarkly
3. Consider whether feature flags are even needed at current project scale
4. If switching, update the composable and any env vars / config references
