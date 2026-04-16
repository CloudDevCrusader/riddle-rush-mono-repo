# Phase 23 Performance Results

Generated: 2026-04-11T04:36:00Z
Phase: 23-improve-performance-and-accessibility-find-out-why-there-are
Comparison: Baseline (pre-optimization) vs Final (post-optimization)

## Baseline

**Source:** `23-PERF-BASELINE.md` — captured against production (`https://riddlerush.de`, commit `bf3f2d051`)
**Tool:** unlighthouse-ci v0.17.7

| Category       | Baseline Score |
| -------------- | -------------- |
| Performance    | 81             |
| Accessibility  | 76             |
| Best Practices | 100            |
| SEO            | 99             |

**JS Bundle:** ~928KB total (456KB main chunk) — measured from build output prior to Phase 23 changes
**Image Assets:** 8.2MB (127 files in `public/assets/`)
**Font Loading:** Google Fonts CDN (render-blocking external `<link>` to `fonts.googleapis.com`)
**LCP Average:** 4.8s across all routes

## Final

**Source:** Build output analysis after Phase 23 plans 01-04 (commit on `main` branch)
**Build command:** `pnpm --filter @riddle-rush/game build`

### Bundle Metrics (Post-Optimization)

| Metric                | Value              | Measurement Method                 |
| --------------------- | ------------------ | ---------------------------------- |
| Total JS (all chunks) | 649KB              | Sum of `_nuxt/*.js` file sizes     |
| Main chunk            | 482KB (493,322 B)  | Largest JS file in `_nuxt/`        |
| Total CSS             | 259KB              | Sum of `_nuxt/*.css` file sizes    |
| Image assets          | 1,774KB (34 files) | Sum of `public/assets/**/*` sizes  |
| Self-hosted fonts     | 9 woff2 files      | `_nuxt/*.woff2` (bundled via CSS)  |
| External font CDN     | 0 requests         | No `fonts.googleapis.com` in build |

### Structural Improvements Applied

| Change                   | Before                                         | After                                                           |
| ------------------------ | ---------------------------------------------- | --------------------------------------------------------------- |
| Font loading             | Google Fonts CDN `<link>` (render-block)       | Self-hosted `@fontsource-variable` (bundled in CSS, no CDN)     |
| Font fallback metrics    | `Inter, system-ui` (wrong fonts)               | `Baloo 2 Variable, Nunito Variable, Inter, system-ui` (correct) |
| Dev overlays             | Eager `<DebugPanel>`, `<StoryboardDevOverlay>` | Lazy `<LazyDebugPanel>`, `<LazyStoryboardDevOverlay>`           |
| Image files in build     | 127 files (8.2MB)                              | 34 files (1,774KB) — 78% reduction                              |
| PWA Google Fonts caching | Runtime caching rules for googleapis/gstatic   | Removed (no CDN dependency)                                     |
| Lighthouse tooling       | Not installed                                  | `unlighthouse` + `lighthouse:ci` scripts                        |

### Estimated Lighthouse Improvement

Lighthouse scores cannot be measured in this build environment (requires running the app on a server and Chrome DevTools Protocol). The following are **structural predictions** based on the changes applied:

| Category       | Baseline | Predicted Impact                                                                                                   |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| Performance    | 81       | **+5-10 pts**: Eliminated render-blocking CDN font request, reduced asset payload by 78%, lazy-loaded dev overlays |
| Accessibility  | 76       | **+0 pts**: No accessibility-specific changes in this phase (deferred)                                             |
| Best Practices | 100      | **+0 pts**: Already at maximum                                                                                     |
| SEO            | 99       | **+0 pts**: Already near maximum                                                                                   |

**Note:** Final Lighthouse scores should be captured against the deployed production site after these changes are deployed. Use:

```bash
npx unlighthouse-ci --site https://riddlerush.de --build-static --output-path /tmp/lighthouse-final
```

## Delta

| Metric                 | Baseline          | Final             | Delta                        |
| ---------------------- | ----------------- | ----------------- | ---------------------------- |
| Total JS bundle        | 928KB             | 649KB             | **−279KB (−30%)**            |
| Main chunk             | 456KB             | 482KB             | +26KB (+6%) (font CSS added) |
| Image payload          | 8.2MB (127 files) | 1.8MB (34 files)  | **−6.4MB (−78%)**            |
| External font requests | 2-3 round trips   | 0                 | **−100%**                    |
| Font fallback accuracy | Wrong (Inter)     | Correct (Baloo 2) | Fixed — CLS benefit          |
| Dev overlay JS         | Eager (in bundle) | Lazy (on demand)  | Deferred from initial load   |

### Key Observations

- **Image cleanup was the biggest win**: 93 unreferenced files (5.7MB) removed, remaining 17 files converted to WebP format
- **Font self-hosting eliminates render-blocking CDN**: Removes DNS + connect + download latency for `fonts.googleapis.com` and `fonts.gstatic.com`
- **fontMetrics correction**: Fontaine now generates accurate fallback metrics for the actual display and body fonts, reducing CLS on font swap
- **Total JS increased by 26KB in main chunk** due to self-hosted font CSS being bundled, but the elimination of external requests more than compensates
- **Lazy loading dev overlays** removes ~847 lines of component code from the initial critical path

## Target Check

| Target                               | Status     | Evidence                                                                     |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------- |
| D-09: Lighthouse Performance ≥ 90    | ⏳ Pending | Baseline 81. Structural changes predict improvement. Needs deploy + measure. |
| D-09: Lighthouse Accessibility ≥ 90  | ❌ Gap     | Baseline 76. No accessibility changes in this phase. Deferred.               |
| D-09: Lighthouse Best Practices ≥ 90 | ✅ Met     | Baseline 100. No regression.                                                 |
| D-09: Lighthouse SEO ≥ 90            | ✅ Met     | Baseline 99. No regression.                                                  |
| D-11: Self-hosted fonts (no CDN)     | ✅ Met     | Zero `fonts.googleapis.com` references in codebase or build output           |
| D-12: JS bundle < 500KB initial      | ⚠️ Close   | 649KB total, 482KB main chunk. Further splitting limited by circular deps.   |
| D-13: Dev overlays lazy-loaded       | ✅ Met     | `<LazyDebugPanel>` and `<LazyStoryboardDevOverlay>` in app.vue               |

### Remediation Notes

1. **D-09 Performance target (90+)**: Deploy changes and re-run `unlighthouse-ci` against production. The 30% JS reduction + eliminated CDN requests should close the 9-point gap, but LCP (avg 4.8s) remains the primary bottleneck — driven by large background images, not JS.
2. **D-09 Accessibility target (90+)**: Deferred to a dedicated accessibility phase. Key gaps: missing ARIA attributes (41 total across 14 components), no keyboard navigation for game flow, /splash (56) and /round-start (67) scoring lowest.
3. **D-12 JS target (<500KB initial)**: The 649KB total includes all route chunks. The main entry chunk is 482KB. Further splitting is blocked by circular module dependencies (Vue/Nuxt/i18n TDZ errors documented in nuxt.config.ts). Tree-shaking and lodash-es optimization are already configured.
