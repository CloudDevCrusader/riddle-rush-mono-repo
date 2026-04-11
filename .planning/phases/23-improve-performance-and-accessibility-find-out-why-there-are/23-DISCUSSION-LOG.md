# Phase 23: Improve Performance and Accessibility — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-11
**Phase:** 23-improve-performance-and-accessibility-find-out-why-there-are
**Areas discussed:** Broken prod images, Performance tooling, Image optimization, Current state review

---

## Current State Review

User requested a review of the current state before diving into decisions. Agent performed codebase scout and found:

- 127 PNG files (7.3MB) in `public/assets/`, only ~15 referenced in code
- 30+ files with spaces/special characters in filenames
- Two inconsistent asset path patterns (getAssetPath vs raw template literals)
- `assets/icons/` and `assets/game/` directories referenced in code but don't exist
- Minimal accessibility coverage (41 ARIA attributes across 14 components)
- @nuxt/image installed but barely used
- Google Fonts loaded from CDN (render-blocking)

---

## Broken Production Images

| Option                            | Description                                                                                     | Selected           |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| Remove unused + standardize paths | Delete ~112 unreferenced PNGs, standardize to getAssetPath(), rename to kebab-case. Saves ~6MB. | :white_check_mark: |
| Remove unused only                | Delete unreferenced PNGs but keep current path patterns as-is.                                  |                    |
| Audit first on production         | Check actual production site for 404s before removing anything.                                 |                    |

**User's choice:** Remove unused + standardize paths (Recommended)
**Notes:** None — straightforward selection.

---

## Image Format Conversion

| Option                              | Description                                                                               | Selected           |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| Convert to WebP + keep PNG fallback | Convert remaining PNGs to WebP with `<picture>` or `<NuxtImg>`. Typically 25-35% smaller. | :white_check_mark: |
| Just optimize PNGs                  | Run pngquant/optipng without format change.                                               |                    |
| You decide                          | Claude picks best approach.                                                               |                    |

**User's choice:** Convert to WebP + keep PNG fallback (Recommended)
**Notes:** None.

---

## Performance Benchmarking Tool

| Option                        | Description                                                                | Selected           |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------ |
| Lighthouse CI (unlighthouse)  | Free, open-source, runs on every route. Add `pnpm run lighthouse` command. | :white_check_mark: |
| @lhci/cli (Google's official) | More configuration, better CI/CD integration. Heavier setup.               |                    |
| Both + CI integration         | unlighthouse local + @lhci/cli in GitHub Actions.                          |                    |

**User's choice:** Lighthouse CI (unlighthouse) (Recommended)
**Notes:** User specifically mentioned wanting a command to run benchmarks and a free tool.

---

## Lighthouse Score Targets

| Option                    | Description                                                | Selected           |
| ------------------------- | ---------------------------------------------------------- | ------------------ |
| 90+ all categories        | Performance, Accessibility, Best Practices, SEO all >= 90. | :white_check_mark: |
| 95+ performance, 90+ rest | Higher performance bar for game PWA.                       |                    |
| 80+ baseline first        | Measure current scores before setting targets.             |                    |

**User's choice:** 90+ all categories (Recommended)
**Notes:** Aligns with Phase 12 target that was set but never verified.

---

## Performance Quick Wins

| Option                         | Description                                                                 | Selected           |
| ------------------------------ | --------------------------------------------------------------------------- | ------------------ |
| Font optimization              | Self-host Google Fonts, font-display: swap, preload, @nuxtjs/fontaine.      | :white_check_mark: |
| Bundle analysis + tree shaking | Add bundle analyzer, check for bundled dev deps, verify lodash-es.          | :white_check_mark: |
| Lazy loading + code splitting  | Lazy load DebugPanel, StoryboardDevOverlay, SettingsModal. Dynamic imports. | :white_check_mark: |
| IndexedDB write batching       | Debounce saveSessionToDB() calls. Batch at round boundaries.                |                    |

**User's choice:** Font optimization, Bundle analysis + tree shaking, Lazy loading + code splitting
**Notes:** IndexedDB batching deferred — lower priority than image/font/bundle wins.

---

## Image Optimization Strategy

| Option                       | Description                                                                                    | Selected           |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| Use @nuxt/image with NuxtImg | Replace `<img>` with `<NuxtImg>`. Auto WebP, responsive sizes, lazy loading, blur placeholder. | :white_check_mark: |
| Build-time optimization only | sharp-based build script for WebP conversion. Keep raw `<img>` tags.                           |                    |
| You decide                   | Claude picks for static SPA with ssr:false.                                                    |                    |

**User's choice:** Use @nuxt/image with NuxtImg (Recommended)
**Notes:** @nuxt/image already installed as dependency, just needs broader adoption.

---

## Claude's Discretion

- Specific order of operations (cleanup sequencing)
- WebP compression quality settings
- `<picture>` vs `<NuxtImg>` auto-conversion choice
- Bundle analyzer tooling selection

## Deferred Ideas

- Accessibility compliance (WCAG 2.1 AA) — deferred to future phase
- IndexedDB write batching — lower priority
- CI/CD Lighthouse integration (@lhci/cli in GitHub Actions) — follow-up after local tooling
- Fix mobile website not full page (existing todo)
