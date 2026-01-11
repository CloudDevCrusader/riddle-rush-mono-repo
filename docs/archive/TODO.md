# TODO - Guess Game Nuxt PWA

## Priority: High 🔴

- [ ] **Graphics from docs/gfx/** - Use the generated graphics from ali theese are contained in the folder `./docs/gfx/`
  - Check out if all features are already implemented
  - use png as graphics everywhere needed - If you can adopt the design as CSS even better

- [ ] **E2E Tests** - Add back Playwright e2e tests using `@nuxt/test-utils`
  - Game flow (start, play, win/lose, reset)
  - Offline functionality
  - PWA install flow

- [ ] **PWA Icons** - Generate actual PWA icons from template
  - `pwa-192x192.png`
  - `pwa-512x512.png`
  - `apple-touch-icon.png`
  - `favicon.ico` (multiple sizes)

- [ ] **Error Handling**
  - [ ] Global error boundary component
  - [ ] Custom 404 page (`pages/[...slug].vue`)
  - [ ] Custom 500 error page
  - [ ] API error handling with retry logic

- [ ] **Offline Support**
  - [ ] Offline fallback page
  - [ ] Queue failed API requests for retry
  - [ ] Sync IndexedDB when back online

## Priority: Medium 🟡

- [ ] **Testing**
  - [ ] Increase unit test coverage (target: 80%)
  - [ ] Add component tests for Vue components
  - [ ] Add API route tests
  - [ ] Add IndexedDB/composable tests

- [ ] **Performance**
  - [ ] Lazy load components
  - [ ] Image optimization (use `<NuxtImg>`)
  - [ ] Bundle size analysis in CI
  - [ ] Lighthouse CI integration

- [ ] **Accessibility (a11y)**
  - [ ] ARIA labels on interactive elements
  - [ ] Keyboard navigation
  - [ ] Screen reader testing
  - [ ] Color contrast validation
  - [ ] Focus management

- [ ] **SEO**
  - [ ] Meta tags per page
  - [ ] Open Graph tags
  - [ ] Twitter Card tags
  - [ ] Structured data (JSON-LD)
  - [ ] Sitemap generation

- [ ] **i18n**
  - [ ] Add English translation
  - [ ] Language switcher component
  - [ ] RTL support consideration

## Priority: Low 🟢

- [ ] **Documentation**
  - [ ] API documentation (endpoints, request/response)
  - [ ] Component documentation (props, events, slots)
  - [ ] Architecture decision records (ADRs)
  - [ ] Contributing guide (`CONTRIBUTING.md`)
  - [ ] Changelog (`CHANGELOG.md`)

- [ ] **DevOps**
  - [ ] Sentry error tracking integration
  - [ ] Performance monitoring (Web Vitals)
  - [ ] Uptime monitoring
  - [ ] Automated dependency updates (Renovate/Dependabot)

- [ ] **Security**
  - [ ] Security policy (`SECURITY.md`)
  - [ ] Rate limiting on API routes
  - [ ] Input sanitization audit
  - [ ] CSP headers configuration

- [ ] **GitHub/GitLab**
  - [ ] Issue templates
  - [ ] PR/MR templates
  - [ ] Branch protection rules
  - [ ] CODEOWNERS file

- [ ] **Features**
  - [ ] Sound effects toggle in settings
  - [ ] Theme switcher (dark/light mode)
  - [ ] Multiplayer mode
  - [ ] Social sharing of scores
  - [ ] Achievement system
  - [ ] Daily challenges

## Completed ✅

- [x] Nuxt 4 setup with TypeScript
- [x] Pinia state management
- [x] PWA configuration
- [x] i18n (German)
- [x] IndexedDB persistence
- [x] Unit tests with Vitest + Faker
- [x] ESLint + Prettier
- [x] Husky git hooks
- [x] GitLab CI/CD pipeline
- [x] 3-stage deployment (dev/staging/prod)
- [x] Maintenance pipeline (audit, stats, deps)
- [x] Deploy scripts
- [x] Debug panel
- [x] Leaderboard component
- [x] Feedback widget
- [x] Settings store

---

## Quick Wins (< 1 hour each)

1. Generate PWA icons from SVG template
2. Add custom 404 page
3. Add CONTRIBUTING.md
4. Add issue templates
5. Add English translation file
6. Add Lighthouse CI to pipeline

## Notes

- E2E tests were removed due to Playwright/Nuxt integration issues
- Consider using Cypress as alternative for e2e
- PWA works but needs real icons for app stores
