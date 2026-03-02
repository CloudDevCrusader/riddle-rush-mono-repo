---
created: 2026-02-13T06:44
title: Switch CI/CD from CircleCI to Vercel
area: tooling
files:
  - .circleci/config.yml
  - .circleci/test-deploy.yml
  - vercel.json
  - apps/game/nuxt.config.ts
  - apps/game/components/layout/GamePanel.vue:2
---

## Problem

CircleCI builds fail consistently and are unreliable. Vercel is already configured as the deployment target (CLI installed and logged in) and provides a more stable build pipeline. The current CircleCI setup should be disabled/removed in favor of Vercel-only CI/CD.

Additionally, the Vercel build itself is currently failing due to a SCSS import path resolution issue:

- `@use 'assets/scss/mixins' as *;` in `GamePanel.vue` (and likely other components) cannot resolve during the Vercel production build
- The path works locally via Nuxt's Vite config but Vercel's build environment resolves paths differently
- This is a Vite/Sass path aliasing issue that needs `vite.css.preprocessorOptions.scss` configuration or tilde/alias-prefixed imports

## Solution

1. **Disable CircleCI:** Remove or archive `.circleci/` config, or disable the project in CircleCI dashboard
2. **Fix Vercel build:** Resolve SCSS import paths so `@use 'assets/scss/mixins'` works in Vercel's build environment — likely needs Vite preprocessor options in `nuxt.config.ts` to add `includePaths` for the scss resolver
3. **Verify Vercel builds pass** after the SCSS fix
4. **Optional:** Configure Vercel environment variables flagged in build warnings (AUTONOMA_CLIENT_ID, AWS keys, EDGE_CONFIG) in `turbo.json` if needed
