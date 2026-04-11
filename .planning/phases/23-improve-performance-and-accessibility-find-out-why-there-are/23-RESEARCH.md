# Phase 23: Improve Performance and Accessibility — Research

**Researched:** 2026-04-11
**Domain:** Web performance optimization, image asset management, font self-hosting, Lighthouse auditing
**Confidence:** HIGH

## Summary

This phase addresses three concrete problem areas: (1) broken production images caused by `NuxtImg`/ipx generating `/_ipx/` URLs that don't exist on the static SPA deployment, (2) ~110 unreferenced image files shipping 5.7MB of dead weight to production, and (3) render-blocking Google Fonts CDN requests. The existing codebase already has many performance tools installed but misconfigured or underused (`@nuxt/image`, `@nuxtjs/fontaine`, `rollup-plugin-visualizer`, `sharp`, `vite-plugin-compression`).

The root cause of broken production images is confirmed: `@nuxt/image` with `ssr: false` does not support runtime image optimization via ipx. The `NuxtImg` component generates `/_ipx/f_webp&q_80/...` URLs that require a server-side handler, but the app deploys as a static SPA with no server. This affects `round-start.vue` and `ImageButton.vue` which both use `<NuxtImg format="webp">`. The fix is to either pre-convert images to WebP at build time using `sharp` (already installed) and use plain `<img>` tags, or add `nitro.prerender.routes` for specific ipx paths during `nuxt generate`.

The total JS bundle is 928KB (largest chunk 456KB), total asset payload is 8.2MB (127 image files, of which only 17 are referenced). After removing unreferenced images (5.7MB) and converting remaining PNGs to WebP (~60-80% size reduction), the asset payload should drop to under 500KB. Self-hosting fonts eliminates the render-blocking CDN request and the 2-3 round trips to `fonts.googleapis.com` and `fonts.gstatic.com`.

**Primary recommendation:** Remove unreferenced images, pre-convert remaining PNGs to WebP using sharp, replace `NuxtImg` with plain `<img>` tags using pre-optimized assets, self-host fonts via `@fontsource-variable` packages, and add `unlighthouse` CLI for Lighthouse audits.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Remove all ~112 unreferenced PNG files from `public/assets/` (coins, profiles, old designer exports). These ship to production but are never loaded by any component. Saves ~6MB of transfer size.
- **D-02:** Standardize all image path references to use `getAssetPath()` from `useAssets.ts` composable. Currently `SettingsModal.vue`, `game/[[gameId]].vue`, `round-start.vue`, `layouts/menu.vue`, and `layouts/game.vue` use raw template literals which duplicates baseUrl logic and is fragile.
- **D-03:** Rename remaining ~15 referenced image files to lowercase-kebab-case (no spaces, no special characters). Current files like `LOADING_.png`, `LOGO.png`, `CATEGORY.png` should become `loading.png`, `logo.png`, `category.png`.
- **D-04:** Fix `useAssets.ts` helpers `getIconAsset()` and `getGameAsset()` which reference non-existent directories `assets/icons/` and `assets/game/`. Either create the directories or remove the dead helper functions.
- **D-05:** Convert all remaining referenced PNGs to WebP format with PNG fallback for older browsers. Use `<picture>` element or `@nuxt/image` `<NuxtImg>` component for automatic format selection.
- **D-06:** Replace raw `<img>` tags with `<NuxtImg>` component from `@nuxt/image` (already installed as dependency). This provides automatic WebP conversion, responsive sizes, lazy loading, and placeholder blur.
- **D-07:** Add `loading="lazy"` to all non-critical images (everything except splash screen and above-the-fold content).
- **D-08:** Install `unlighthouse` as a devDependency for automated Lighthouse audits. Create `pnpm run lighthouse` command that runs against the built static site. Generates HTML reports with scores.
- **D-09:** Target Lighthouse scores of 90+ across all four categories: Performance, Accessibility, Best Practices, SEO. This aligns with the Phase 12 target that was never verified.
- **D-10:** Measure current baseline scores BEFORE making changes so improvements are quantifiable.
- **D-11:** Self-host Google Fonts (Baloo 2, Nunito) instead of loading from CDN. Add `font-display: swap`, preload critical fonts, leverage `@nuxtjs/fontaine` (already installed) for fallback font metrics. Eliminates render-blocking external request to `fonts.googleapis.com`.
- **D-12:** Add bundle size analysis tooling (e.g. `rollup-plugin-visualizer`). Audit for accidentally bundled dev dependencies. Verify `lodash-es` tree-shaking works correctly. Target under 500KB initial JavaScript.
- **D-13:** Lazy load non-critical components: `DebugPanel`, `StoryboardDevOverlay`, `SettingsModal`. Use dynamic imports (`defineAsyncComponent`) for heavy composables. This reduces initial bundle payload.

### Claude's Discretion

- Specific order of operations (which cleanup to do first)
- Exact WebP compression quality settings
- Whether to add `<picture>` elements vs rely entirely on `<NuxtImg>` auto-conversion
- Bundle size analysis tooling choice (rollup-plugin-visualizer vs alternatives)

### Deferred Ideas (OUT OF SCOPE)

- **Accessibility compliance (WCAG 2.1 AA)** — deferred to a future phase
- **IndexedDB write batching** — lower priority than image/font/bundle fixes
- **CI/CD Lighthouse integration** — follow-up after local tooling is established
- **Fix mobile website not being full page** — separate investigation
  </user_constraints>

## Project Constraints (from CLAUDE.md)

- **pnpm monorepo** with Turborepo orchestration — all new scripts must be registered in turbo.json
- **Run `pnpm run workspace:check`** after every change (syncpack + TypeScript + ESLint)
- **Conventional Commits** enforced by Husky hooks
- **No Server**: Static site only — no server API routes in production
- **Client-only**: `ssr: false` — code using browser APIs must be wrapped in `onMounted`
- **Base URL**: Always use `useRuntimeConfig().public.baseUrl` — never hardcode URLs
- **Nuxt 4** (not Nuxt 3)
- **CSS-first approach**: Mockup effects via CSS, minimal image dependency
- **No new heavy dependencies** — achieve look with CSS/SVG where possible

## CRITICAL: D-05 and D-06 Require Revision

**The user's decisions D-05 and D-06 are technically incompatible with the project's `ssr: false` constraint.** `@nuxt/image`'s `NuxtImg` component with `format="webp"` generates `/_ipx/` URLs that require server-side processing. With `ssr: false`, there is no ipx server in production. This is confirmed by:

1. [GitHub Issue #1515](https://github.com/nuxt/image/issues/1515) — open issue, not resolved [VERIFIED: GitHub]
2. The current build output contains `/_ipx` references but no `/_ipx/` directory [VERIFIED: build analysis]
3. Daniel Roe (Nuxt maintainer) states: "ssr: false means no HTML rendering... this is incompatible with prerendering a static website with image optimization" [CITED: github.com/nuxt/image/issues/1515]

**Recommended revision for D-05/D-06:**

- Pre-convert all referenced PNGs to WebP at build time using `sharp` (already installed as dependency)
- Ship both `.webp` and `.png` files in `public/assets/`
- Use `<picture>` elements with `<source type="image/webp">` and `<img>` fallback
- OR simply use pre-converted WebP files in plain `<img>` tags (WebP is supported by 97%+ of browsers)
- Remove the existing `NuxtImg` usage from `round-start.vue` and `ImageButton.vue` as it is currently generating broken `/_ipx/` URLs in production

## Standard Stack

### Core (Already Installed)

| Library                           | Version | Purpose                                       | Status                                                                            |
| --------------------------------- | ------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| `@nuxt/image`                     | 2.0.0   | Image component (limited use with ssr: false) | Installed, misconfigured [VERIFIED: package.json]                                 |
| `@nuxtjs/fontaine`                | 0.5.0   | Font fallback metrics to prevent CLS          | Installed, misconfigured (points to Inter not Baloo 2) [VERIFIED: nuxt.config.ts] |
| `sharp`                           | 0.34.5  | Image conversion/optimization (build-time)    | Installed, working [VERIFIED: node -e test]                                       |
| `rollup-plugin-visualizer`        | 7.0.1   | Bundle size visualization                     | Installed, configured [VERIFIED: packages/config/vite.config.ts]                  |
| `vite-plugin-compression`         | 0.5.1   | Brotli compression for built assets           | Installed, configured [VERIFIED: packages/config/vite.config.ts]                  |
| `@vheemstra/vite-plugin-imagemin` | 2.2.1   | Build-time image optimization                 | Installed, configured [VERIFIED: packages/config/vite.config.ts]                  |

### New Dependencies

| Library                        | Version | Purpose                                 | Why Needed                                                        |
| ------------------------------ | ------- | --------------------------------------- | ----------------------------------------------------------------- |
| `unlighthouse`                 | 0.17.7  | CLI-based full-site Lighthouse auditing | D-08: automated performance benchmarking [VERIFIED: npm registry] |
| `@fontsource-variable/baloo-2` | 5.2.7   | Self-hosted Baloo 2 variable font       | D-11: eliminate CDN dependency [VERIFIED: npm registry]           |
| `@fontsource-variable/nunito`  | 5.2.7   | Self-hosted Nunito variable font        | D-11: eliminate CDN dependency [VERIFIED: npm registry]           |

### Alternatives Considered

| Instead of               | Could Use                 | Tradeoff                                                                                                           |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@fontsource-variable/*` | `@nuxt/fonts` (v0.14.0)   | `@nuxt/fonts` is more automated but adds another module; fontsource is simpler — just CSS imports [ASSUMED]        |
| `unlighthouse`           | `lighthouse` CLI directly | `unlighthouse` scans all pages automatically; `lighthouse` is single-page only [CITED: unlighthouse.dev]           |
| `<picture>` elements     | `NuxtImg` with ipxStatic  | ipxStatic requires `ssr: true` during generation which conflicts with app architecture [VERIFIED: nuxt/image#1515] |

**Installation:**

```bash
cd apps/game
pnpm add -D unlighthouse @fontsource-variable/baloo-2 @fontsource-variable/nunito
```

## Architecture Patterns

### Recommended Asset File Organization

```
apps/game/public/assets/
├── splash/              # Splash screen images (5 files)
│   ├── background.webp  # Pre-converted WebP
│   ├── background.png   # PNG fallback (optional)
│   ├── logo.webp
│   ├── loading.webp
│   ├── loading-down.webp
│   └── loading-top.webp
├── alphabets/           # Game page images (4 files)
│   ├── background.webp
│   ├── back.webp
│   ├── category.webp
│   └── next.webp
├── settings/            # Settings modal images (6 files)
│   ├── background.webp
│   ├── back.webp
│   ├── options.webp
│   ├── sound.webp
│   ├── music.webp
│   └── ok.webp
├── main-menu/           # Menu layout image (1 file)
│   └── menu.webp
└── players/             # Game layout image (1 file)
    └── back.webp
```

Total: 17 referenced images, down from 127 files.

### Pattern 1: Build-Time Image Conversion Script

**What:** Node.js script using `sharp` to convert PNGs to WebP
**When to use:** During build or as a pre-build step
**Example:**

```typescript
// scripts/convert-images.mjs
import sharp from 'sharp'
import { glob } from 'glob'
import path from 'path'

const files = await glob('apps/game/public/assets/**/*.png')
for (const file of files) {
  const output = file.replace(/\.png$/, '.webp')
  await sharp(file).webp({ quality: 80 }).toFile(output)
  console.log(`Converted: ${path.basename(file)} -> ${path.basename(output)}`)
}
```

[ASSUMED — sharp API pattern based on training knowledge]

### Pattern 2: Centralized Asset Path with WebP

**What:** Updated `useAssets.ts` that serves WebP by default
**When to use:** All image references throughout the app
**Example:**

```typescript
// composables/useAssets.ts
export function useAssets() {
  const {
    public: { baseUrl },
  } = useRuntimeConfig()

  const getAssetPath = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${baseUrl}${cleanPath}`
  }

  // Convenience: auto-resolve to WebP variant
  const getWebPAssetPath = (path: string): string => {
    return getAssetPath(path.replace(/\.png$/, '.webp'))
  }

  return { baseUrl, getAssetPath, getWebPAssetPath }
}
```

### Pattern 3: Nuxt Lazy Component Prefix

**What:** Nuxt auto-prefixes components with `Lazy` for code splitting
**When to use:** Non-critical components that should load on demand
**Example:**

```vue
<!-- Instead of: -->
<DebugPanel />
<StoryboardDevOverlay />

<!-- Use: -->
<LazyDebugPanel />
<LazyStoryboardDevOverlay />
<LazySettingsModal v-model="showSettings" />
```

This is a built-in Nuxt feature — no configuration needed. The `Lazy` prefix triggers `defineAsyncComponent` under the hood. [CITED: nuxt.com/docs/4.x/directory-structure/app/components]

### Pattern 4: Self-Hosted Font Loading

**What:** Import fontsource CSS in nuxt.config instead of CDN link tags
**When to use:** Replace Google Fonts CDN loading
**Example:**

```typescript
// nuxt.config.ts
css: [
  '@fontsource-variable/baloo-2',
  '@fontsource-variable/nunito',
  '~/assets/scss/design-system.scss',
  '~/assets/css/figma-tokens.generated.css',
],
```

Then update the SCSS `$fonts` map to use the exact family name from fontsource:

```scss
$fonts: (
  'display': (
    'Baloo 2 Variable',
    'Inter',
    sans-serif,
  ),
  'primary': (
    'Nunito Variable',
    'Inter',
    sans-serif,
  ),
);
```

And remove the Google Fonts `<link>` from `app.vue` `useHead()`. [ASSUMED — fontsource import pattern]

### Anti-Patterns to Avoid

- **Using `NuxtImg` with format/quality props when `ssr: false`:** Generates broken `/_ipx/` URLs. Use plain `<img>` with pre-optimized images instead.
- **Duplicate `getAssetPath` implementations:** `usePageSetup.ts:25` has its own version. Consolidate to `useAssets.ts`.
- **Template literal image paths:** `\`${baseUrl}assets/...\``is fragile. Always use`getAssetPath()`.
- **Shipping unreferenced files in `public/`:** Everything in `public/` deploys to production. Remove what's not used.

## Don't Hand-Roll

| Problem                | Don't Build                     | Use Instead                                    | Why                                                                                       |
| ---------------------- | ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| PNG to WebP conversion | Custom ffmpeg scripts           | `sharp` (already installed)                    | sharp handles edge cases (alpha channels, color profiles, metadata) [VERIFIED: installed] |
| Font fallback metrics  | Manual CSS overrides            | `@nuxtjs/fontaine` (already installed)         | Computes exact ascent/descent override values to prevent CLS [VERIFIED: installed]        |
| Bundle size analysis   | Manual file inspection          | `rollup-plugin-visualizer` (already installed) | Interactive treemap/sunburst visualization [VERIFIED: installed]                          |
| Full-site Lighthouse   | Manual page-by-page testing     | `unlighthouse` CLI                             | Discovers routes automatically, runs Lighthouse on all pages [CITED: unlighthouse.dev]    |
| Lazy component loading | `defineAsyncComponent` wrappers | Nuxt `Lazy` prefix                             | Built into framework, zero config [CITED: nuxt.com/docs]                                  |
| Brotli compression     | Custom compression pipeline     | `vite-plugin-compression` (already installed)  | Already configured with 10KB threshold [VERIFIED: packages/config/vite.config.ts]         |

## Common Pitfalls

### Pitfall 1: NuxtImg with ssr: false Generates Broken URLs

**What goes wrong:** `<NuxtImg format="webp">` generates `/_ipx/f_webp&q_80/path/to/image.png` URLs. Without a server-side ipx handler (which requires `ssr: true`), these URLs return 404.
**Why it happens:** `@nuxt/image` was designed for SSR or static generation with pre-rendering. `ssr: false` means no server, no pre-rendering of ipx routes.
**How to avoid:** Pre-convert images to WebP at build time. Use plain `<img>` tags with the `.webp` file path. Or use `<picture>` elements for format fallback.
**Warning signs:** Images missing on deployed site but working in `nuxt dev` (because dev server has ipx running).
**Evidence:** The current build output at `apps/game/.output/public/` has `_ipx` references in JS but no `/_ipx/` directory. [VERIFIED: build analysis]

### Pitfall 2: File Names with Spaces and Special Characters in URLs

**What goes wrong:** Files like `COIN BAR.png`, `Game is paused, press  resume to continue_.png`, `loading  (Double Click to edit smart object).png` require URL encoding. Some servers/CDNs handle this differently.
**Why it happens:** Designer export filenames were used directly without renaming.
**How to avoid:** Rename all files to lowercase-kebab-case before referencing them. Use the conversion script.
**Warning signs:** 34 files in `public/assets/` currently have spaces or special characters. [VERIFIED: filesystem scan]

### Pitfall 3: fontaine Misconfigured for Wrong Fonts

**What goes wrong:** `@nuxtjs/fontaine` is configured with `fonts: ['Inter', 'system-ui']` but the app actually uses `Baloo 2` and `Nunito` as its display and primary fonts. This means font fallback metrics are computed for the wrong fonts, providing no CLS benefit.
**Why it happens:** Configuration was copy-pasted or left at defaults.
**How to avoid:** Update `fontMetrics.fonts` in `nuxt.config.ts` to include the actual fonts used.
**Warning signs:** CLS (Cumulative Layout Shift) on font load despite having fontaine installed. [VERIFIED: nuxt.config.ts:338-340]

### Pitfall 4: Google Fonts CDN as Render-Blocking Resource

**What goes wrong:** The `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` in `app.vue` is render-blocking. The browser must download and parse the CSS before rendering text. This adds 2-3 network round trips (DNS + connect to googleapis.com, then font files from gstatic.com).
**Why it happens:** Quick setup pattern — CDN is easiest to add but worst for performance.
**How to avoid:** Self-host fonts via `@fontsource-variable` packages. Fonts are bundled into the CSS, eliminating external requests.
**Warning signs:** Lighthouse "Eliminate render-blocking resources" warning pointing to `fonts.googleapis.com`. [VERIFIED: app.vue:112-117]

### Pitfall 5: Duplicate getAssetPath Implementations

**What goes wrong:** `usePageSetup.ts` has its own `getAssetPath()` implementation (lines 25-51) that strips the `assets/` prefix differently from `useAssets.ts`. Code using one may produce different paths than code using the other.
**Why it happens:** The composable was written independently, duplicating logic.
**How to avoid:** Remove `getAssetPath` from `usePageSetup.ts`, have it delegate to `useAssets.ts`, or remove the duplicate entirely.
**Warning signs:** Different path formats in different components. [VERIFIED: usePageSetup.ts:25-51 vs useAssets.ts:13-17]

### Pitfall 6: PWA Service Worker Caching Google Fonts

**What goes wrong:** The PWA workbox config has runtime caching rules for `fonts.googleapis.com` and `fonts.gstatic.com`. After self-hosting fonts, these rules become dead weight. Worse, if the old CDN URLs are still cached in users' service workers, they'll continue fetching from CDN.
**Why it happens:** Caching rules were added for CDN-hosted fonts.
**How to avoid:** Remove the Google Fonts runtime caching rules from `nuxt.config.ts` PWA config after self-hosting. The service worker `skipWaiting: true` and `cleanupOutdatedCaches: true` settings will handle the transition.
**Warning signs:** Network requests to `fonts.googleapis.com` persist after migration. [VERIFIED: nuxt.config.ts:572-589]

## Code Examples

### Build-Time PNG to WebP Conversion

```typescript
// scripts/convert-images-to-webp.mjs
// Source: sharp npm package documentation
import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import path from 'path'

const ASSETS_DIR = 'apps/game/public/assets'
const QUALITY = 80

async function convertDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await convertDir(fullPath)
    } else if (entry.name.endsWith('.png')) {
      const webpPath = fullPath.replace(/\.png$/, '.webp')
      const info = await sharp(fullPath).webp({ quality: QUALITY }).toFile(webpPath)
      const origSize = (await stat(fullPath)).size
      console.log(
        `${entry.name}: ${(origSize / 1024).toFixed(0)}KB -> ${(info.size / 1024).toFixed(0)}KB (${((1 - info.size / origSize) * 100).toFixed(0)}% reduction)`
      )
    }
  }
}

await convertDir(ASSETS_DIR)
```

[ASSUMED — sharp WebP API based on training knowledge, to be verified against sharp docs]

### Replacing NuxtImg with Picture Element

```vue
<!-- Before (broken with ssr: false): -->
<NuxtImg
  :src="`${baseUrl}assets/alphabets/BACKGROUND.png`"
  format="webp"
  quality="80"
  preset="background"
  loading="eager"
  preload
/>

<!-- After (works with static deployment): -->
<img
  :src="getAssetPath('assets/alphabets/background.webp')"
  alt=""
  class="page-bg"
  loading="eager"
  width="1920"
  height="1080"
  fetchpriority="high"
/>
```

### Lazy Loading Dev-Only Components

```vue
<!-- app.vue — Before: -->
<DebugPanel />
<StoryboardDevOverlay />

<!-- After — Nuxt lazy prefix: -->
<LazyDebugPanel />
<LazyStoryboardDevOverlay />
```

[CITED: nuxt.com/docs/4.x/directory-structure/app/components]

### Font Self-Hosting Setup

```typescript
// nuxt.config.ts — Remove CDN, add fontsource CSS
css: [
  '@fontsource-variable/baloo-2',
  '@fontsource-variable/nunito',
  '~/assets/scss/design-system.scss',
  '~/assets/css/figma-tokens.generated.css',
],

// Update fontMetrics to match actual fonts
fontMetrics: {
  fonts: ['Baloo 2 Variable', 'Nunito Variable'],
},
```

```vue
<!-- app.vue — Remove these from useHead(): -->
<!-- { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, -->
<!-- { rel: 'preconnect', href: 'https://fonts.gstatic.com' }, -->
<!-- { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?...' }, -->
```

[ASSUMED — exact fontsource variable font family names need verification against package CSS]

### Unlighthouse CLI Setup

```json
// apps/game/package.json scripts
{
  "lighthouse": "unlighthouse --site http://localhost:3000 --output-path .lighthouse"
}
```

```json
// turbo.json — register new task
{
  "lighthouse": {
    "dependsOn": ["build"],
    "cache": false
  }
}
```

[CITED: unlighthouse.dev/integrations/nuxt/]

## State of the Art

| Old Approach                | Current Approach                   | When Changed                            | Impact                                                               |
| --------------------------- | ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `@nuxt/image` ipx runtime   | Pre-built WebP + `<img>` tags      | 2024 (ipx never worked with ssr: false) | Images actually load in production                                   |
| Google Fonts CDN `<link>`   | `@fontsource-variable` self-hosted | 2023+                                   | Eliminates render-blocking external request                          |
| `@unlighthouse/nuxt` module | `unlighthouse` CLI                 | Deprecated in v1.0                      | Module will be removed; CLI is the supported path                    |
| `@nuxtjs/fontaine` alone    | `@nuxt/fonts` module               | 2024                                    | `@nuxt/fonts` subsumes fontaine; but fontaine still works standalone |

**Deprecated/outdated:**

- `@unlighthouse/nuxt` module — deprecated, use CLI instead [CITED: unlighthouse.dev/integrations/nuxt/]
- `NuxtImg` with `format` prop + `ssr: false` — fundamentally broken for static sites [VERIFIED: nuxt/image#1515]

## Detailed Findings

### Current Image Asset Inventory

**Referenced images (17 files, ~1.7MB as PNG):**

| File             | Directory | Size  | Used By                                        |
| ---------------- | --------- | ----- | ---------------------------------------------- |
| BACKGROUND.png   | alphabets | 392KB | round-start.vue (NuxtImg — BROKEN)             |
| back.png         | alphabets | 16KB  | game/[[gameId]].vue                            |
| CATEGORY.png     | alphabets | 4KB   | game/[[gameId]].vue                            |
| next.png         | alphabets | 28KB  | game/[[gameId]].vue                            |
| BACKGROUND.png   | settings  | 392KB | SettingsModal.vue                              |
| back.png         | settings  | 44KB  | SettingsModal.vue                              |
| options.png      | settings  | 20KB  | SettingsModal.vue                              |
| Sound.png        | settings  | 8KB   | SettingsModal.vue                              |
| Music.png        | settings  | 8KB   | SettingsModal.vue                              |
| OK.png           | settings  | 4KB   | SettingsModal.vue                              |
| background.png   | splash    | 580KB | SplashScreen.vue, GlobalLoading.vue            |
| LOGO.png         | splash    | 136KB | SplashScreen.vue, GlobalLoading.vue, index.vue |
| LOADING\_.png    | splash    | 4KB   | SplashScreen.vue, GlobalLoading.vue            |
| loading-down.png | splash    | 4KB   | SplashScreen.vue, GlobalLoading.vue            |
| loading-top.png  | splash    | 4KB   | SplashScreen.vue, GlobalLoading.vue            |
| MENU.png         | main-menu | 8KB   | layouts/menu.vue                               |
| back.png         | players   | 16KB  | layouts/game.vue                               |

**Unreferenced images: 110 files, 5.7MB** — all designer export PNGs that are never loaded by any component. These include entire directories for `profile/`, `quit/`, `win/`, `paused/`, `leaderboard/`, `scoring/`, and `language/` that were replaced by CSS-only implementations. [VERIFIED: codebase grep + filesystem analysis]

### Current NuxtImg Usage (BROKEN in Production)

| File                   | What It Does                           | Problem                                                   |
| ---------------------- | -------------------------------------- | --------------------------------------------------------- |
| `round-start.vue:3`    | `<NuxtImg format="webp" quality="80">` | Generates `/_ipx/f_webp&q_80/...` URL — 404 in production |
| `ImageButton.vue:8,17` | `<NuxtImg format="webp" quality="85">` | Same — generates broken ipx URLs                          |

Both must be migrated to plain `<img>` with pre-converted WebP files. [VERIFIED: source code + build output analysis]

### Template Literal Image References (Fragile)

| File                  | Line               | Current Pattern                                      | Should Use       |
| --------------------- | ------------------ | ---------------------------------------------------- | ---------------- |
| `SettingsModal.vue`   | 13,22,28,42,73,103 | `` `${baseUrl}assets/settings/...` ``                | `getAssetPath()` |
| `game/[[gameId]].vue` | 15,57,161          | `` `${baseUrl}assets/alphabets/...` ``               | `getAssetPath()` |
| `round-start.vue`     | 4                  | `` `${baseUrl}assets/alphabets/...` `` (via NuxtImg) | `getAssetPath()` |
| `layouts/menu.vue`    | 33                 | `` `${baseUrl}assets/main-menu/...` ``               | `getAssetPath()` |
| `layouts/game.vue`    | 29                 | `` `${baseUrl}assets/players/...` ``                 | `getAssetPath()` |

[VERIFIED: grep analysis of source files]

### Bundle Size Analysis

| Category               | Current Size           | Target                  |
| ---------------------- | ---------------------- | ----------------------- |
| Total JS (all chunks)  | 928KB                  | < 500KB (D-12)          |
| Main chunk             | 456KB                  | Reduce via lazy loading |
| Total images in build  | 8.2MB (127 files)      | ~300KB (17 WebP files)  |
| External font requests | 2-3 round trips to CDN | 0 (self-hosted)         |

**Already-installed tooling that generates stats:** `rollup-plugin-visualizer` outputs to `apps/game/.vite/stats.html` on every build. [VERIFIED: filesystem check]

### Lazy Loading Candidates

| Component                  | Lines | Current Loading       | Recommendation                                      |
| -------------------------- | ----- | --------------------- | --------------------------------------------------- |
| `DebugPanel.vue`           | 308   | Eager (in app.vue)    | `<LazyDebugPanel />` — dev-only component           |
| `StoryboardDevOverlay.vue` | 539   | Eager (in app.vue)    | `<LazyStoryboardDevOverlay />` — dev-only component |
| `SettingsModal.vue`        | 535   | Eager (wherever used) | `<LazySettingsModal />` — only shown on user action |

[VERIFIED: source code analysis]

## Assumptions Log

| #   | Claim                                                                                              | Section                 | Risk if Wrong                                                                            |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| A1  | `@fontsource-variable/baloo-2` exports the font family as `'Baloo 2 Variable'`                     | Font Self-Hosting       | Wrong family name means fonts don't load — verify in package CSS after install           |
| A2  | `@fontsource-variable/nunito` exports the font family as `'Nunito Variable'`                       | Font Self-Hosting       | Same risk — verify exact family name                                                     |
| A3  | sharp's `webp({ quality: 80 })` API is correct for PNG to WebP conversion                          | Image Conversion        | Conversion script fails — verify against sharp docs                                      |
| A4  | `@nuxt/fonts` v0.14.0 would be better than fontsource for Nuxt integration                         | Alternatives Considered | Minor — fontsource works fine, just different approach                                   |
| A5  | Removing Google Fonts `<link>` and PWA caching rules won't break existing users' cached experience | Font Migration          | Old service worker might cache CDN URL indefinitely — `skipWaiting: true` mitigates this |

## Open Questions

1. **Exact fontsource variable font family names**
   - What we know: fontsource packages use specific CSS `font-family` names
   - What's unclear: Whether `'Baloo 2 Variable'` or `'Baloo 2'` is the correct family name
   - Recommendation: Install packages, then inspect the CSS to find exact name before updating SCSS

2. **Should `@nuxt/image` module be removed entirely?**
   - What we know: It doesn't work for runtime optimization with `ssr: false`. The `NuxtImg` component generates broken URLs.
   - What's unclear: Whether keeping it has any benefit (presets, lazy loading attributes) or just adds complexity
   - Recommendation: Keep the module but stop using `NuxtImg` format/quality props. Use plain `<img>` tags for now. Removing the module entirely is a larger change that could affect other things.

3. **WebP browser support vs `<picture>` element necessity**
   - What we know: WebP is supported by 97%+ of browsers (all modern browsers)
   - What's unclear: Whether any target users use browsers without WebP support
   - Recommendation: Use plain `<img src="image.webp">` without `<picture>` fallback. The 3% without WebP support are mostly IE11 and very old Safari, which are unlikely game players.

4. **456KB main chunk — what's in it?**
   - What we know: The main chunk is 456KB. Bundle visualizer stats exist at `apps/game/.vite/stats.html`
   - What's unclear: Whether the main chunk can be meaningfully split given the circular dependency warning in nuxt.config.ts
   - Recommendation: Analyze the existing stats.html to identify largest modules. Focus on lazy loading rather than manual chunk splitting (which caused TDZ errors previously).

## Environment Availability

| Dependency   | Required By                  | Available            | Version | Fallback                      |
| ------------ | ---------------------------- | -------------------- | ------- | ----------------------------- |
| sharp        | Image conversion             | Yes                  | 0.34.5  | cwebp CLI                     |
| cwebp        | Alternative image conversion | Yes                  | 1.6.0   | sharp (preferred)             |
| unlighthouse | Lighthouse auditing          | No (to be installed) | --      | Manual Lighthouse in DevTools |
| Node.js      | Runtime                      | Yes                  | >= 20   | --                            |
| pnpm         | Package management           | Yes                  | 10.30.3 | --                            |

**Missing dependencies with no fallback:** None

**Missing dependencies with fallback:** unlighthouse (not yet installed, will be added as devDependency)

## Validation Architecture

### Test Framework

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| Framework          | Vitest 3.x with happy-dom            |
| Config file        | `apps/game/vitest.config.ts`         |
| Quick run command  | `cd apps/game && pnpm run test:unit` |
| Full suite command | `pnpm run test:unit` (via Turbo)     |

### Phase Requirements to Test Map

| Req ID    | Behavior                            | Test Type     | Automated Command                                               | File Exists? |
| --------- | ----------------------------------- | ------------- | --------------------------------------------------------------- | ------------ |
| D-01      | Unreferenced images removed         | manual        | Verify file count in `public/assets/`                           | N/A          |
| D-02      | All image refs use getAssetPath()   | unit          | `cd apps/game && pnpm vitest run tests/unit/use-assets.spec.ts` | Yes          |
| D-03      | File names lowercase-kebab          | manual/script | `find public/assets -name "*[A-Z ]*"`                           | N/A          |
| D-04      | Dead helpers removed/fixed          | unit          | `cd apps/game && pnpm vitest run tests/unit/use-assets.spec.ts` | Yes          |
| D-05/D-06 | Images display correctly            | e2e/smoke     | Build + check no 404s                                           | Manual       |
| D-07      | Lazy loading on non-critical images | smoke         | Inspect HTML output                                             | Manual       |
| D-08      | Lighthouse command works            | smoke         | `pnpm run lighthouse`                                           | N/A (Wave 0) |
| D-09      | Lighthouse scores 90+               | smoke         | Run lighthouse after build                                      | Manual       |
| D-10      | Baseline captured                   | manual        | Document scores before changes                                  | N/A          |
| D-11      | Fonts self-hosted                   | smoke         | Build + verify no googleapis requests                           | Manual       |
| D-12      | JS under 500KB                      | smoke         | Build + check output size                                       | Manual       |
| D-13      | Lazy components work                | unit/smoke    | Import check + build                                            | Manual       |

### Wave 0 Gaps

- [ ] Add `useAssets.spec.ts` test cases for `getWebPAssetPath()` if added
- [ ] No existing test for font loading — manual verification via Lighthouse
- [ ] Lighthouse script needs to be created (D-08)

## Security Domain

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control      |
| --------------------- | ------- | --------------------- |
| V2 Authentication     | No      | N/A — no auth changes |
| V3 Session Management | No      | N/A                   |
| V4 Access Control     | No      | N/A                   |
| V5 Input Validation   | No      | No new user input     |
| V6 Cryptography       | No      | N/A                   |

This phase is purely asset optimization and performance tooling. No security-sensitive changes.

### Known Threat Patterns

| Pattern                  | STRIDE                 | Standard Mitigation                                 |
| ------------------------ | ---------------------- | --------------------------------------------------- |
| CDN supply chain (fonts) | Tampering              | Self-hosting fonts eliminates CDN dependency        |
| Asset enumeration        | Information Disclosure | Removing unreferenced assets reduces attack surface |

## Sources

### Primary (HIGH confidence)

- Build output analysis at `apps/game/.output/public/` — direct filesystem inspection
- Source code analysis via grep — all image references verified
- npm registry — package version verification
- [nuxt/image#1515](https://github.com/nuxt/image/issues/1515) — ssr: false incompatibility confirmed

### Secondary (MEDIUM confidence)

- [image.nuxt.com/advanced/static-images](https://image.nuxt.com/advanced/static-images) — static image documentation
- [unlighthouse.dev/integrations/nuxt/](https://unlighthouse.dev/integrations/nuxt/) — deprecation notice for Nuxt module
- [nuxt.com/docs/4.x/guide/best-practices/performance](https://nuxt.com/docs/4.x/guide/best-practices/performance) — Nuxt performance best practices
- [nuxt.com/docs/4.x/directory-structure/app/components](https://nuxt.com/docs/4.x/directory-structure/app/components) — Lazy component prefix

### Tertiary (LOW confidence)

- fontsource variable font family names — assumed, need verification after install

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages verified against npm registry, existing installations confirmed via filesystem
- Architecture: HIGH — build output directly analyzed, broken ipx URLs confirmed
- Image inventory: HIGH — exhaustive grep analysis of all Vue/TS files vs all files in public/assets/
- Font migration: MEDIUM — fontsource approach is well-established but exact family names need verification
- Pitfalls: HIGH — each pitfall verified against actual codebase state

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable domain, slow-moving dependencies)
