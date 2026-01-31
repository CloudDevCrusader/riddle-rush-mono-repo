# Technology Stack

**Analysis Date:** 2026-01-31

## Languages

**Primary:**

- TypeScript 5.9.3 - Used throughout the application (strict mode enabled)
- Vue 3.5.26 - Reactive component framework

**Secondary:**

- JavaScript (ES2020+) - Build tooling and configuration
- SCSS - Styling in `assets/scss/design-system.scss`
- JSON - Configuration and data files

## Runtime

**Environment:**

- Node.js 20.0.0 (minimum) - Specified in `package.json` engines
- Browser (client-side focus) - PWA for modern browsers

**Package Manager:**

- pnpm 10.28.1 - Required package manager
- Lockfile: pnpm-lock.yaml (enforced via `packageManager` field)

## Frameworks

**Core:**

- Nuxt 4.2.2 - Meta-framework for Vue (client-side SPA with SSR: false)
- Vue 3.5.26 - Component library

**State Management:**

- Pinia 0.11.3 - Store management (via @pinia/nuxt module)

**Internationalization:**

- @nuxtjs/i18n 10.2.1 - i18n integration (German default, English available)
- vue-i18n 11.1.0 - Translation engine

**PWA & Offline:**

- @vite-pwa/nuxt 1.1.0 - Progressive Web App support with Workbox
- idb 8.0.3 - IndexedDB wrapper for data persistence

**Build & Development:**

- Vite (bundled with Nuxt 4) - Build tool
- ESBuild - JavaScript minifier
- @vitejs/plugin-vue 5.2.1 - Vue support in Vite
- Turbo 2.7.3 - Monorepo build orchestration

**Testing:**

- Vitest 3.0.0 - Unit test runner (happy-dom environment)
- @vitest/coverage-v8 3.0.0 - Code coverage
- @playwright/test 1.49.1 - E2E test runner
- Playwright 1.49.1 - Browser automation (Chrome, Firefox, Mobile Chrome)

## Key Dependencies

**Critical:**

- socket.io-client 4.8.3 - WebSocket real-time communication
- unleash-proxy-client 3.7.8 - GitLab Feature Flags (Unleash protocol)
- lodash-es 4.17.22 - Utility library (tree-shaken)

**Mobile & Native:**

- @capacitor/cli 8.0.0 - Mobile app framework
- @capacitor/app 8.0.0 - App lifecycle management
- @capacitor/haptics 8.0.0 - Haptic feedback
- @capacitor/keyboard 8.0.0 - Keyboard handling
- @capacitor/status-bar 8.0.0 - Status bar management
- @capacitor/android 8.0.0 - Android native bridge

**UI & Animation:**

- @vueuse/nuxt 14.1.0 - Vue composition utilities
- @vueuse/motion 3.0.3 - Animation directives
- @nuxtjs/fontaine 0.5.0 - Font optimization
- @nuxtjs/color-mode 4.0.0 - Theme switching
- @nuxtjs/device 4.0.0 - Device detection
- @nuxt/image 1.9.0 - Image optimization

**Security:**

- nuxt-security 2.5.0 - Security headers (CSP, CORS, etc.)
- zod 4.3.5 - Schema validation

**Image Optimization:**

- sharp 0.34.5 - Image processing
- vite-plugin-imagemin 0.6.1 - Image compression
- @vheemstra/vite-plugin-imagemin 2.2.1 - Enhanced compression

**Development Tools:**

- unplugin-auto-import 20.3.0 - Auto-import composables/stores
- unplugin-vue-components 30.0.0 - Auto-import components
- vite-plugin-checker 0.12.0 - TypeScript/ESLint during build
- vite-plugin-vue-devtools 7.0.0 - Vue DevTools integration
- vite-plugin-vue-inspector 5.3.2 - Component inspection
- vite-plugin-compression 0.5.1 - gzip/brotli compression
- vite-plugin-browserslist-useragent 0.6.2 - Browser compatibility
- vite-plugin-dynamic-prefetch 0.1.5 - Dynamic import prefetching
- vite-plugin-inspect 11.3.3 - Vite plugin inspection
- rollup-plugin-visualizer 5.12.0 - Bundle analysis

**Monorepo & Workspace:**

- Turbo 2.7.3 - Build orchestration
- syncpack 13.0.4 - Dependency consistency
- @pnpm/filter-workspace-packages 1.2.7 - Workspace filtering

**Code Quality:**

- ESLint 9.39.2 - Linting
- Prettier 3.7.4 - Code formatting
- @nuxt/eslint 1.0.0 - Nuxt ESLint integration
- husky 9.1.7 - Git hooks
- lint-staged 15.5.2 - Pre-commit linting

**Testing Utilities:**

- @nuxt/test-utils 3.23.0 - Nuxt testing helpers
- @faker-js/faker 9.0.0 - Fake data generation
- happy-dom 15.11.7 - Lightweight DOM for testing

**TypeScript:**

- typescript 5.9.3 - Language and type checking
- vue-tsc 2.0.0 - Vue component type checking
- @types/node 22.19.5 - Node.js types
- @types/lodash-es 4.17.12 - Lodash types

## Configuration

**Environment:**

- Nuxt runtimeConfig for runtime variables
- Environment variables with NUXT*PUBLIC* prefix for client exposure
- Support for CI/CD variable injection

**Build:**

- `nuxt.config.ts` - Main Nuxt configuration (strict TypeScript, SSR disabled)
- `tsconfig.json` - TypeScript configuration with Nuxt extensions
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `eslint.config.mjs` - ESLint rules
- `prettier.config.js` (via root) - Code formatting
- `capacitor.config.ts` - Capacitor Android build configuration

**Build Optimization:**

- Production minification: esbuild
- Development: unminified for debugging
- CSS code splitting enabled
- Workbox caching strategies: CacheFirst for assets, NetworkFirst for APIs
- Image optimization via Sharp with webp/avif formats

## Platform Requirements

**Development:**

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Git (for version control)
- Docker/Docker Compose (optional, for CI simulation)

**Production:**

- Static hosting (AWS S3 + CloudFront recommended via Terraform)
- Browser support: Modern browsers with ES2020, IndexedDB, Service Workers
- No server-side runtime required (static SPA)

**Mobile (Optional):**

- Android SDK for native builds via Capacitor
- Xcode for iOS builds via Capacitor

---

_Stack analysis: 2026-01-31_
