# Build Optimization Guide

This guide covers Nuxt build configuration, bundle analysis, and performance budgets for the Riddle Rush PWA.

## Table of Contents

1. [Current Build Performance](#current-build-performance)
2. [Bundle Size Analysis](#bundle-size-analysis)
3. [Code Splitting Strategies](#code-splitting-strategies)
4. [Tree Shaking Optimization](#tree-shaking-optimization)
5. [Build Performance](#build-performance)
6. [Performance Budgets](#performance-budgets)

---

## Current Build Performance

### Build Output Analysis (2026-01-11)

**Build Time:** ~13.8 seconds (Turbo monorepo)
**Client Build:** ~4.7 seconds
**Server Build:** ~20ms (SSR disabled)

**Bundle Sizes:**

| File                     | Size        | Gzipped  | Type               |
| ------------------------ | ----------- | -------- | ------------------ |
| `BKMcrp_a.js`            | 205.96 kB   | 73.88 kB | Main bundle        |
| `CWuxmddR.js`            | 166.10 kB   | 62.50 kB | Vendor (Vue/Pinia) |
| `vendor-vue.B9fxx2J6.js` | 166.10 kB   | 62.50 kB | Vue ecosystem      |
| `e6q6m_O6.js`            | 30.62 kB    | 10.39 kB | Runtime            |
| `CdIoeTLC.js`            | 15.54 kB    | 5.97 kB  | Utilities          |
| **Total JS (gzipped)**   | **~215 kB** | -        | -                  |
| **Total CSS (gzipped)**  | **~24 kB**  | -        | -                  |

**PWA:**

- Precached entries: 190
- Precache size: 8.1 MB (includes all assets)
- Service worker: Generated successfully

---

## Bundle Size Analysis

### 1. Install Bundle Analyzer

```bash
pnpm add -D rollup-plugin-visualizer
```

### 2. Configure Analyzer

```typescript
// packages/config/vite/index.ts
import { visualizer } from 'rollup-plugin-visualizer'

export const getBuildPlugins = ({ isDev }: { isDev: boolean }) => {
  const plugins = []

  // Add bundle analyzer in production mode when ANALYZE is set
  if (!isDev && process.env.ANALYZE) {
    plugins.push(
      visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      })
    )
  }

  return plugins
}
```

### 3. Run Analysis

```bash
# Analyze game bundle
ANALYZE=true pnpm run build

# Analyze docs bundle
ANALYZE=true pnpm run build:docs
```

**Output:** Opens `dist/stats.html` in browser with interactive treemap.

### 4. Identify Large Dependencies

**Look for:**

- Unexpectedly large libraries
- Duplicate dependencies (same library imported twice)
- Unused exports (opportunities for tree-shaking)
- Large chunks that could be split further

---

## Code Splitting Strategies

### Current Configuration

**File:** `apps/game/nuxt.config.ts` (lines 124-148)

```typescript
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Lodash optimization
          if (id.includes('lodash-es')) {
            return 'vendor-lodash'
          }

          // Vendor chunks by library
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue'
            }
            if (id.includes('@vueuse')) {
              return 'vendor-vueuse'
            }
            if (id.includes('@nuxtjs/i18n')) {
              return 'vendor-i18n'
            }
            if (id.includes('idb')) {
              return 'vendor-idb'
            }
            if (id.includes('@capacitor')) {
              return 'vendor-capacitor'
            }
            return 'vendor'
          }
        },
      },
    },
  },
}
```

### Recommended Enhancements

#### 1. Route-Based Code Splitting

```typescript
manualChunks: (id) => {
  // NEW: Split pages into separate chunks
  if (id.includes('/pages/')) {
    const match = id.match(/\/pages\/([^/]+)\.vue/)
    if (match) {
      const pageName = match[1]
      // Group similar pages
      if (['index', 'credits', 'settings'].includes(pageName)) {
        return 'pages-menu' // Frequently accessed together
      }
      if (['game', 'round-start', 'results'].includes(pageName)) {
        return 'pages-game' // Game flow pages
      }
      return `page-${pageName}` // Others get individual chunks
    }
  }

  // Existing vendor splitting (keep as-is)
  // ...
}
```

**Benefits:**

- Initial load only downloads menu pages (~50KB savings)
- Game pages loaded on-demand when user starts playing
- Better caching (menu rarely changes, game logic changes frequently)

#### 2. Component-Level Splitting

**Large components that aren't always needed:**

```typescript
// In component file
const HeavyChart = defineAsyncComponent(() => import('./components/HeavyChart.vue'))

const DebugPanel = defineAsyncComponent(() => import('./components/DebugPanel.vue'))
```

**Already implemented for modals:**

```vue
<!-- pages/game.vue -->
<LazyPauseModal v-if="showPauseModal" />
<LazyQuitModal v-if="showQuitModal" />
```

**Consider adding for:**

- `<StoryboardDevOverlay>` (dev only)
- `<DebugPanel>` (conditional)
- `<FortuneWheel>` (only on round-start page)

#### 3. Vendor Chunk Optimization

**Current approach is good**, but can fine-tune:

```typescript
// Split large libraries separately
if (id.includes('node_modules')) {
  // Motion library (if large)
  if (id.includes('@vueuse/motion')) {
    return 'vendor-motion'
  }

  // Color mode (rarely changes)
  if (id.includes('@nuxtjs/color-mode')) {
    return 'vendor-color-mode'
  }

  // Device detection (small, but separate for better caching)
  if (id.includes('@nuxtjs/device')) {
    return 'vendor-device'
  }

  // Existing splits...
}
```

---

## Tree Shaking Optimization

### Current Configuration

```typescript
// nuxt.config.ts
vite: {
  optimizeDeps: {
    include: ['pinia', '@vueuse/core', '@vueuse/motion', 'lodash-es'],
    exclude: ['vue-demi'],
    esbuildOptions: {
      treeShaking: true,
      legalComments: 'none',
      target: 'es2020',
    },
  },
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      },
    },
  },
}
```

### Optimization Opportunities

#### 1. Verify lodash-es Tree Shaking

**Check current imports:**

```bash
# Find all lodash-es imports
grep -r "from 'lodash-es" apps/game/
```

**Ensure named imports (not default):**

```typescript
// ❌ BAD: Imports entire library
import _ from 'lodash-es'
const result = _.debounce(fn, 100)

// ✅ GOOD: Tree-shakable
import { debounce } from 'lodash-es'
const result = debounce(fn, 100)
```

**Current usage:**

```typescript
// apps/game/composables/useLodash.ts
export { debounce, throttle, cloneDeep, merge } from 'lodash-es'
```

**Status:** ✅ Already optimized with named exports!

#### 2. VueUse Composables

**Check which composables are actually used:**

```bash
grep -r "from '@vueuse/core'" apps/game/ | sort | uniq
```

**Optimize imports:**

```typescript
// ❌ Less optimal
import { useWindowSize, useEventListener } from '@vueuse/core'

// ✅ Better (more explicit for bundler)
import { useWindowSize } from '@vueuse/core/useWindowSize'
import { useEventListener } from '@vueuse/core/useEventListener'
```

**Note:** Modern bundlers handle both well, but explicit imports help with analysis.

#### 3. Remove Unused Dependencies

**Audit package.json:**

```bash
pnpm add -D depcheck
npx depcheck apps/game
```

**Common unused dependencies to check:**

- Development-only packages in `dependencies` (should be in `devDependencies`)
- Leftover packages from refactoring
- Duplicate packages (e.g., `lodash` AND `lodash-es`)

---

## Build Performance

### Current Performance

**Clean build:** ~13.8 seconds
**Incremental build:** ~2-4 seconds (HMR)

### Optimization Strategies

#### 1. Persistent Build Cache

**Already configured in Nuxt 4:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Nuxt 4 has improved caching by default
})
```

**Verify cache is working:**

```bash
# First build
time pnpm run build

# Second build (should be faster)
time pnpm run build
```

#### 2. Parallel Processing

**Turbo already handles this:**

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", ".output/**"]
    }
  }
}
```

#### 3. Reduce Build Scope

**For development:**

```bash
# Only build game app
pnpm run build

# Build everything
pnpm run build:all
```

#### 4. Optimize Dependencies

**Install sharp locally (faster than downloading):**

```bash
pnpm add -D sharp
```

**Result:** Eliminates "sharp binaries not found" warning and improves build time.

---

## Performance Budgets

### Define Budgets

Create `apps/game/performance-budget.json`:

```json
{
  "budgets": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "style",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 2000
    },
    {
      "resourceType": "total",
      "budget": 3000
    }
  ]
}
```

**Units:** kilobytes (KB)

### Enforce Budgets in CI

```typescript
// scripts/check-bundle-size.ts
import { readFileSync } from 'fs'
import { glob } from 'glob'

const MAX_JS_SIZE = 100 * 1024 // 100KB gzipped
const MAX_CSS_SIZE = 30 * 1024 // 30KB gzipped

const distPath = 'apps/game/.output/public/_nuxt'

// Check JS bundles
const jsFiles = glob.sync(`${distPath}/*.js`)
let totalJsSize = 0

for (const file of jsFiles) {
  const size = readFileSync(file).length
  totalJsSize += size

  if (size > MAX_JS_SIZE) {
    console.error(`❌ JS file too large: ${file} (${(size / 1024).toFixed(2)}KB)`)
    process.exit(1)
  }
}

console.log(`✅ Total JS size: ${(totalJsSize / 1024).toFixed(2)}KB`)

// Check CSS bundles
const cssFiles = glob.sync(`${distPath}/*.css`)
let totalCssSize = 0

for (const file of cssFiles) {
  const size = readFileSync(file).length
  totalCssSize += size

  if (size > MAX_CSS_SIZE) {
    console.error(`❌ CSS file too large: ${file} (${(size / 1024).toFixed(2)}KB)`)
    process.exit(1)
  }
}

console.log(`✅ Total CSS size: ${(totalCssSize / 1024).toFixed(2)}KB`)
```

**Add to package.json:**

```json
{
  "scripts": {
    "check:bundle": "tsx scripts/check-bundle-size.ts"
  }
}
```

**Add to CI:**

```yaml
# .gitlab-ci.yml
check-bundle-size:
  stage: quality
  script:
    - pnpm run build
    - pnpm run check:bundle
  only:
    - merge_requests
```

### Budget Targets

**Per-page budgets:**

| Page    | JS (gzipped) | CSS (gzipped) | Images | Total |
| ------- | ------------ | ------------- | ------ | ----- |
| Menu    | 80KB         | 10KB          | 500KB  | 590KB |
| Players | 85KB         | 12KB          | 200KB  | 297KB |
| Game    | 100KB        | 15KB          | 300KB  | 415KB |
| Results | 90KB         | 12KB          | 400KB  | 502KB |

**Overall budget:**

- Total JS: <120KB (gzipped)
- Total CSS: <25KB (gzipped)
- Total images: <2MB (after WebP conversion)
- **Total initial load:** <600KB

---

## Advanced Optimizations

### 1. CSS Optimization

**Enable Lightning CSS:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },
})
```

**Benefits:**

- Faster than PostCSS
- Better minification
- Automatic vendor prefixes

### 2. Experimental Features

**Try experimental build optimizations:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    // Payload extraction for better caching
    payloadExtraction: true,

    // Inline CSS for critical pages
    inlineSSRStyles: (id) => !id.includes('components'),
  },
})
```

### 3. Prerender Static Pages

For pages that don't change often:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/credits', '/language'],
    },
  },
})
```

**Benefits:**

- Faster initial load
- Better SEO
- Less runtime overhead

---

## Monitoring Build Performance

### 1. Build Time Tracking

```bash
# scripts/build-perf.sh
#!/bin/bash

echo "Starting build performance tracking..."

start_time=$(date +%s)
pnpm run build
end_time=$(date +%s)

duration=$((end_time - start_time))
echo "Build completed in ${duration} seconds"

# Log to file for tracking over time
echo "$(date -u +%Y-%m-%dT%H:%M:%S),${duration}" >> build-times.csv
```

### 2. Bundle Size Tracking

**Track bundle sizes over time:**

```bash
# scripts/track-bundle-sizes.sh
#!/bin/bash

DATE=$(date -u +%Y-%m-%d)
DIST_PATH="apps/game/.output/public/_nuxt"

# Get total JS size
JS_SIZE=$(find "$DIST_PATH" -name "*.js" -exec cat {} \; | wc -c)

# Get total CSS size
CSS_SIZE=$(find "$DIST_PATH" -name "*.css" -exec cat {} \; | wc -c)

# Log to CSV
echo "$DATE,$JS_SIZE,$CSS_SIZE" >> bundle-sizes.csv

echo "Bundle sizes tracked: JS=${JS_SIZE}B, CSS=${CSS_SIZE}B"
```

### 3. Automated Alerts

**Set up alerts for bundle size increases:**

```javascript
// scripts/bundle-alert.mjs
import { readFileSync } from 'fs'

const MAX_INCREASE = 0.1 // 10%

const current = getCurrentBundleSize()
const baseline = getBaselineBundleSize()

const increase = (current - baseline) / baseline

if (increase > MAX_INCREASE) {
  console.error(`❌ Bundle size increased by ${(increase * 100).toFixed(1)}%!`)
  console.error(`Baseline: ${baseline}, Current: ${current}`)
  process.exit(1)
}

console.log(`✅ Bundle size within acceptable range (${(increase * 100).toFixed(1)}% change)`)
```

---

## Troubleshooting

### Build Fails with Out of Memory

**Increase Node.js memory:**

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' nuxt build"
  }
}
```

### Slow Build Times

**Diagnose:**

```bash
# Enable build profiling
NUXT_DEBUG=1 pnpm run build
```

**Common causes:**

- Large dependencies (check with bundle analyzer)
- Too many files in `node_modules` (run `pnpm prune`)
- Slow disk I/O (use SSD, avoid Docker volumes)

### Unexpected Large Bundles

**Steps:**

1. Run bundle analyzer: `ANALYZE=true pnpm run build`
2. Identify large chunks
3. Check for:
   - Unused dependencies
   - Inefficient tree-shaking
   - Duplicate code
   - Large JSON files imported as modules

---

## References

- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Rollup Code Splitting](https://rollupjs.org/guide/en/#code-splitting)
- [Web.dev Performance Budgets](https://web.dev/performance-budgets-101/)
- [Nuxt Performance Best Practices](https://nuxt.com/docs/guide/going-further/performance)

---

**Last Updated:** 2026-01-11
**Next Review:** After implementing bundle optimizations
