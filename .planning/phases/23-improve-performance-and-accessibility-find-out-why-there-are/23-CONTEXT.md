# Phase 23: Improve Performance and Accessibility — Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Improve application performance (bundle size, loading speed, Lighthouse scores), fix broken production image loading, optimize image assets, and establish automated performance benchmarking tooling. Accessibility improvements are deferred to a future phase — this phase focuses on performance and image fixes.

</domain>

<decisions>
## Implementation Decisions

### Broken Production Images

- **D-01:** Remove all ~112 unreferenced PNG files from `public/assets/` (coins, profiles, old designer exports). These ship to production but are never loaded by any component. Saves ~6MB of transfer size.
- **D-02:** Standardize all image path references to use `getAssetPath()` from `useAssets.ts` composable. Currently `SettingsModal.vue`, `game/[[gameId]].vue`, `round-start.vue`, `layouts/menu.vue`, and `layouts/game.vue` use raw template literals `` `${baseUrl}assets/...` `` which duplicates baseUrl logic and is fragile.
- **D-03:** Rename remaining ~15 referenced image files to lowercase-kebab-case (no spaces, no special characters). Current files like `LOADING_.png`, `LOGO.png`, `CATEGORY.png` should become `loading.png`, `logo.png`, `category.png`.
- **D-04:** Fix `useAssets.ts` helpers `getIconAsset()` and `getGameAsset()` which reference non-existent directories `assets/icons/` and `assets/game/`. Either create the directories or remove the dead helper functions.

### Image Optimization

- **D-05:** Convert all remaining referenced PNGs to WebP format with PNG fallback for older browsers. Use `<picture>` element or `@nuxt/image` `<NuxtImg>` component for automatic format selection.
- **D-06:** Replace raw `<img>` tags with `<NuxtImg>` component from `@nuxt/image` (already installed as dependency). This provides automatic WebP conversion, responsive sizes, lazy loading, and placeholder blur.
- **D-07:** Add `loading="lazy"` to all non-critical images (everything except splash screen and above-the-fold content).

### Performance Tooling

- **D-08:** Install `unlighthouse` as a devDependency for automated Lighthouse audits. Create `pnpm run lighthouse` command that runs against the built static site. Generates HTML reports with scores.
- **D-09:** Target Lighthouse scores of 90+ across all four categories: Performance, Accessibility, Best Practices, SEO. This aligns with the Phase 12 target that was never verified.
- **D-10:** Measure current baseline scores BEFORE making changes so improvements are quantifiable.

### Performance Quick Wins

- **D-11:** Self-host Google Fonts (Baloo 2, Nunito) instead of loading from CDN. Add `font-display: swap`, preload critical fonts, leverage `@nuxtjs/fontaine` (already installed) for fallback font metrics. Eliminates render-blocking external request to `fonts.googleapis.com`.
- **D-12:** Add bundle size analysis tooling (e.g. `rollup-plugin-visualizer`). Audit for accidentally bundled dev dependencies. Verify `lodash-es` tree-shaking works correctly. Target under 500KB initial JavaScript.
- **D-13:** Lazy load non-critical components: `DebugPanel`, `StoryboardDevOverlay`, `SettingsModal`. Use dynamic imports (`defineAsyncComponent`) for heavy composables. This reduces initial bundle payload.

### Claude's Discretion

- Specific order of operations (which cleanup to do first)
- Exact WebP compression quality settings
- Whether to add `<picture>` elements vs rely entirely on `<NuxtImg>` auto-conversion
- Bundle size analysis tooling choice (rollup-plugin-visualizer vs alternatives)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Asset Management

- `apps/game/composables/useAssets.ts` — Asset path helper with getAssetPath() and category-specific helpers
- `apps/game/composables/useOptimizedImage.ts` — Existing image optimization composable
- `apps/game/composables/usePageSetup.ts:25` — Duplicate getAssetPath() implementation (should be consolidated)

### Image References (files that use <img> tags)

- `apps/game/components/SplashScreen.vue` — Splash screen images (uses getAssetPath)
- `apps/game/components/GlobalLoading.vue` — Loading screen images (uses getAssetPath)
- `apps/game/components/SettingsModal.vue` — Settings images (uses raw template literals — MUST migrate)
- `apps/game/pages/game/[[gameId]].vue` — Game page images (uses raw template literals — MUST migrate)
- `apps/game/pages/round-start.vue` — Round start background (uses raw template literal — MUST migrate)
- `apps/game/pages/index.vue` — Logo on main menu (uses getAssetPath)
- `apps/game/layouts/menu.vue` — Menu button image (uses raw template literal — MUST migrate)
- `apps/game/layouts/game.vue` — Back button image (uses raw template literal — MUST migrate)

### Performance

- `apps/game/app.vue:110-121` — Google Fonts CDN loading (needs self-hosting migration)
- `apps/game/nuxt.config.ts` — @nuxt/image config, @nuxtjs/fontaine config, build optimization
- `.planning/codebase/CONCERNS.md` §Performance Bottlenecks — Identified issues (oversized SFCs, unbatched IndexedDB, JSON deep clone)

### Project Constraints

- `.planning/PROJECT.md` — No coins, CSS-first approach, no new heavy dependencies

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `useAssets.ts` composable: Already provides `getAssetPath()`, `preloadImage()`, `preloadImages()` — should be the single source of truth for all image paths
- `useOptimizedImage.ts` composable: Exists but underused — should be evaluated for integration with NuxtImg migration
- `@nuxt/image` module: Already installed as dependency, barely used (7 file references) — ready for broader adoption
- `@nuxtjs/fontaine` module: Already installed for font fallback metrics — needs activation/configuration
- `usePerformance.ts` composable: Exists for performance monitoring

### Established Patterns

- CSS-first approach: Mockup effects achieved via CSS gradients, shadows, etc. — minimal image dependency
- `public/assets/{category}/` directory structure for designer exports
- `getAssetPath()` pattern for baseUrl-aware asset paths (but not universally applied)

### Integration Points

- `nuxt.config.ts` — Module configuration for @nuxt/image, @nuxtjs/fontaine, build optimization
- `app.vue` — Google Fonts link tags (will move to nuxt.config or self-hosted)
- `turbo.json` — New `lighthouse` task needs to be registered
- `package.json` (game) — New devDependency (unlighthouse) and script commands
- All components with `<img>` tags — Migration targets for `<NuxtImg>`

</code_context>

<specifics>
## Specific Ideas

- User wants a `pnpm run lighthouse` command for quick local benchmarking
- Baseline measurement before any changes to quantify improvement
- Focus on "free adjustment" / low-hanging fruit performance wins
- Accessibility was discussed but deferred — the user selected performance and image fixes as the priority for this phase

</specifics>

<deferred>
## Deferred Ideas

- **Accessibility compliance (WCAG 2.1 AA)** — Only 41 ARIA attributes across 14 components. Needs semantic HTML audit, keyboard navigation for game flow, screen reader announcements. Worth its own phase.
- **IndexedDB write batching** — Debounce `saveSessionToDB()` calls that fire on every answer. Would reduce main thread blocking during gameplay. Lower priority than image/font/bundle fixes.
- **CI/CD Lighthouse integration** — Adding `@lhci/cli` to GitHub Actions for automated score regression checks on PRs. Good follow-up after local tooling is established.
- **Fix mobile website not being full page (2/3 of screen is gray)** — Existing todo from STATE.md, potentially related to viewport/layout issues. Could be addressed alongside performance work but may warrant separate investigation.

</deferred>

---

_Phase: 23-improve-performance-and-accessibility-find-out-why-there-are_
_Context gathered: 2026-04-11_
