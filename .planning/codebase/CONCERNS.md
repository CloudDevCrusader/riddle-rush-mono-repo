# Codebase Concerns

**Analysis Date:** 2026-01-31

## Tech Debt

### 1. Error Handling Gaps (Critical)

**Issue**: Multiple critical paths lack try-catch error handling
**Files**:

- `apps/game/pages/game/[[gameId]].vue` - handleSubmit (line 207-235)
- `apps/game/stores/game.ts` - fetchCategories, loadSessionById
- `apps/game/composables/useIndexedDB.ts` - Database operations

**Impact**:

- Game crashes on network failures without user feedback
- Category loading failures crash the app
- IndexedDB errors silently fail without user notification

**Fix approach**:

- Wrap all async API calls in try-catch blocks
- Add user-facing toast/modal error messages
- Implement fallback mechanisms (cached data, localStorage)
- Log errors to monitoring service

---

### 2. Console Statements in Production (High)

**Issue**: Debug console.log/console.error statements left in code
**Files**:

- `apps/game/components/SettingsModal.vue` (lines with console.log)
- `apps/game/components/StoryboardDevOverlay.vue`
- `apps/game/composables/useErrorSync.ts`
- `apps/game/composables/useLogger.ts`
- `apps/game/app.vue`

**Current State**: Production build should remove console statements via build config, but dev console statements remain in source

**Impact**:

- Development clutter in codebase
- Potential information leakage in production if build config fails
- Inconsistent with centralized logging pattern

**Fix approach**:

- Replace all direct console calls with `useLogger()` composable
- Verify build removes console in production
- Code review checklist to catch new console statements

---

### 3. Unvalidated IndexedDB Initialization (High)

**Issue**: No fallback if IndexedDB fails or is unavailable
**Files**: `apps/game/composables/useIndexedDB.ts` (lines 22-69)

**Current State**:

- Function returns null on error (line 112, 124)
- No attempt to use localStorage as fallback
- Game silently fails to save progress

**Impact**:

- Players on restricted browsers/devices lose progress
- Private browsing mode in some browsers blocks IndexedDB
- No user notification of data loss

**Fix approach**:

- Implement localStorage fallback when IndexedDB unavailable
- Add user notification when persistence fails
- Store serialized objects with size awareness (localStorage is 5-10MB)
- Add `isPersistenceAvailable()` method to check before critical operations

---

### 4. Missing Input Validation (Medium)

**Issue**: Player names and answers have incomplete validation
**Files**:

- `apps/game/pages/players.vue` (line 152-183)
- `apps/game/pages/game/[[gameId]].vue` (line 198-205)

**Current State**:

- Sanitizes HTML (`<>` removal) but allows special characters
- No XSS protection for displayed player names
- Empty answer trimming but unclear skip semantics

**Impact**:

- Potential XSS through crafted player names (though v-text used)
- Unclear game behavior on empty submissions
- Special characters may break analytics or database

**Fix approach**:

- Implement stricter character whitelist (alphanumeric, spaces, common punctuation)
- Validate against max/min length before display
- Document skip vs. empty answer behavior clearly
- Use Zod/Yup for runtime schema validation

---

### 5. Missing Quit Confirmation Modal (Medium)

**Issue**: Users can accidentally quit active game without warning
**Files**:

- `apps/game/pages/game/[[gameId]].vue` - handleBack (line 183-189)

**Current State**:

- Quit modal component exists (`LazyQuitModal`)
- Modal appears on back button but no prevention of route changes
- Navigation guard not implemented

**Impact**:

- Players lose progress accidentally
- Back button navigates immediately on first click before modal appears
- Race condition possible between click and modal show

**Fix approach**:

- Implement `onBeforeRouteLeave` navigation guard
- Prevent route navigation until confirmation
- Test modal appearance and route blocking

---

### 6. Race Condition in Category Loading (Medium)

**Issue**: Category loading has polling mechanism instead of proper async coordination
**Files**: `apps/game/stores/game.ts` (line 106-123)

**Current State**:

- Poll loop with 100ms intervals, max 10 seconds
- Returns immediately even if loading incomplete
- No real promise-based coordination

**Impact**:

- Race conditions if multiple components fetch categories
- 10-second timeout could silently fail
- Inefficient polling wastes CPU

**Fix approach**:

- Use Pinia's built-in promise handling
- Return the pending promise instead of polling
- Add configurable timeout with error notification
- Consider single-flight caching pattern

---

## Known Bugs

### 1. Letter Selection Not Persisted (Medium)

**Status**: Documented in MVP-TASKS.md line 466
**Symptoms**: User selects letter on alphabet page, game ignores selection and generates random letter
**Files**:

- `apps/game/pages/round-start.vue` - Fortune wheel
- `apps/game/stores/game.ts` - loadSessionById action

**Trigger**:

1. Navigate to round-start (fortune wheel page)
2. Select a letter (if alphabet selection page exists)
3. Start game
4. Observe random letter instead of selected

**Workaround**: None - feature appears removed from MVP scope

---

### 2. Menu Button (⋮) Non-Functional (Low)

**Status**: Documented in MVP-TASKS.md line 469
**Symptoms**: Menu button in game header exists but doesn't open menu
**Files**: `apps/game/pages/game/[[gameId]].vue` (line 31-49)

**Current State**: Pause button implemented instead

**Trigger**: Click pause/menu button in game header

**Workaround**: Use ESC key to pause or back button to quit

---

### 3. i18n Translation Key Warnings (Low)

**Status**: Documented in MVP-TASKS.md line 465
**Symptoms**: Console warnings about missing translation keys
**Files**: Multiple pages using `$t()` or `t()`

**Trigger**: Reload game page

**Workaround**: Restart development server

---

## Security Considerations

### 1. XSS via Player Names and Answers (Medium)

**Risk**:

- Player names displayed in UI components
- Answers submitted by players shown to other players
- Potential for script injection if v-text not consistently used

**Files**:

- `apps/game/pages/players.vue` (line 36)
- `apps/game/pages/game/[[gameId]].vue` (line 85)
- `apps/game/pages/results/[[gameId]].vue` - leaderboard display

**Current mitigation**:

- v-text used for player name display (safe)
- Answer input sanitized to remove `<>` (line 200)
- maxlength="50" on input

**Recommendations**:

- Implement strict character whitelist instead of blacklist
- Use Content Security Policy headers
- Add CSP nonce to inline scripts
- Regular security audit of template rendering
- Consider DOMPurify for user-generated content

---

### 2. IndexedDB Data Exposure (Low)

**Risk**: Local game data accessible in browser DevTools/extensions
**Impact**: Player scores, game history, leaderboard data exposed

**Current mitigation**: Data stored only on device (no server)

**Recommendations**:

- Document privacy implications (no data sent to server)
- Encrypt sensitive data in IndexedDB if needed
- Add user privacy policy

---

### 3. API Response Validation Missing (Medium)

**Risk**: Wikipedia API/PetScan could return unexpected data structure
**Files**:

- `apps/game/composables/useAnswerCheck.ts` - API response handling
- `apps/game/stores/game.ts` - fetchCategories (line 128)

**Current mitigation**: Basic null checks

**Recommendations**:

- Add runtime schema validation (Zod/Yup)
- Validate all external API responses
- Handle malformed JSON gracefully
- Add type-safe response mapping

---

## Performance Bottlenecks

### 1. No Code Splitting (Medium)

**Problem**: All pages bundled together
**Files**:

- Build configuration in `apps/game/nuxt.config.ts`

**Current capacity**: ~1.5MB uncompressed (estimated)

**Cause**:

- All components imported statically
- No route-based code splitting
- Heavy dependencies in main bundle

**Improvement path**:

- Use `defineAsyncComponent()` for lazy-loaded components
- Route-based code splitting via Nuxt auto-imports
- Conditional imports for debug/development-only features
- Monitor bundle size with `@nuxt/bundle-analyzer`

---

### 2. No Image Optimization (Medium)

**Problem**: Large PNG images not optimized
**Files**:

- `apps/game/public/assets/` - PNG files (mentioned in MVP-TASKS.md line 281)

**Current capacity**: Some images >500KB

**Cause**:

- PNG format without compression
- No WebP conversion
- No lazy loading for below-fold images

**Improvement path**:

- Convert PNG to WebP with PNG fallback
- Use Nuxt Image with automatic optimization
- Implement lazy loading for non-critical images
- Add image compression in build pipeline (TinyPNG/ImageOptim)

---

### 3. IndexedDB Cursor Not Yielding (Low)

**Problem**: Large history/leaderboard queries not paginated
**Files**:

- `apps/game/composables/useIndexedDB.ts` (line 151-170, 219-238)

**Current capacity**: Limit parameter (default 50), but no offset support

**Cause**:

- Cursor implementation adequate but no pagination
- Large datasets could cause UI jank

**Improvement path**:

- Add offset/limit parameters to getGameHistory and getLeaderboard
- Use virtual scrolling for large lists
- Add pagination controls in leaderboard view

---

## Fragile Areas

### 1. Game Store Multi-Player Logic (High)

**Files**: `apps/game/stores/game.ts`
**Why fragile**:

- Complex player submission tracking
- Attempts array management per player
- Score calculation across multiple rounds
- Leaderboard ranking computation (line 85-100)

**Safe modification**:

- Write unit tests for each player action
- Test with 1, 3, and 6 player scenarios
- Verify attempt tracking in edge cases

**Test coverage gaps**:

- Multi-player score calculation not fully tested
- Player submission edge case (duplicate submission)
- Rank calculation accuracy

---

### 2. Fortune Wheel Component (Medium)

**Files**: `apps/game/components/FortuneWheel.vue`
**Why fragile**:

- Physics calculations for rotation
- Mobile/desktop coordinate handling
- SVG rendering performance
- Touch event handling

**Safe modification**:

- Only modify CSS transforms, not rotation logic
- Test on multiple device sizes
- Verify touch targets are adequate

**Test coverage gaps**:

- Mobile tap accuracy
- Performance on low-end devices
- Animation smoothness on various browsers

---

### 3. PWA Service Worker Configuration (Medium)

**Files**: `apps/game/nuxt.config.ts` (PWA config section)
**Why fragile**:

- Service worker cache strategy affects offline functionality
- CacheFirst vs NetworkFirst trade-offs
- Cache invalidation not explicit

**Safe modification**:

- Never change runtime cache strategy without testing offline mode
- Always test with DevTools cache disabled
- Verify fallback pages work offline

**Test coverage gaps**:

- Offline mode functionality
- Cache invalidation after updates
- Background sync for offline plays

---

## Scaling Limits

### 1. Player Leaderboard (Per-Session) (Low)

**Current capacity**: 6 players (MAX_PLAYERS constant)
**Limit**: Hardcoded in `apps/game/utils/constants.ts`

**Scaling path**:

- Remove hardcoded limit or make configurable
- Implement server-side leaderboards if needed
- Add pagination for large leaderboards

---

### 2. IndexedDB Storage (Low)

**Current capacity**: ~50MB typical on desktop, 10-15MB on mobile
**Limit**: Browser quota

**Scaling path**:

- Implement data archival (delete old game sessions)
- Compress historical data
- Add export/import feature for backup
- Consider iCloud/Android backup integration for PWA

---

### 3. Category Dataset (Low)

**Current capacity**: Load all categories at startup (1000s expected)
**Limit**: Memory usage, startup time

**Scaling path**:

- Lazy load categories in batches
- Implement category search/filtering
- Use pagination or virtual scrolling

---

## Dependencies at Risk

### 1. Deprecated Glob Package (Low)

**Risk**: Glob versions prior to v9 are no longer supported
**Impact**: Possible security vulnerabilities in transitive dependency
**Current mitigation**: Indirect dependency, likely through build tools

**Migration plan**:

- Run `npm audit` regularly
- Upgrade indirect dependencies via `syncpack:fix`
- Monitor for major version bumps

---

### 2. Unsupported Legacy Packages (Low)

**Risk**: Package.lock shows deprecated packages
**Current status**:

- Some transitive dependencies marked deprecated
- Not directly impacting game functionality

**Migration plan**:

- Run `pnpm update` and `pnpm audit`
- Check for replacements (e.g., @npmcli/package-json instead of read-pkg)
- Evaluate during maintenance cycles

---

## Missing Critical Features

### 1. Error Boundary Component (Medium)

**Problem**: No global error boundary to catch component rendering errors
**Blocks**:

- Users can't recover from component crashes
- Full app crash possible if single component fails

**Implementation**:

- Create `ErrorBoundary.vue` component
- Wrap app root in error boundary
- Show user-friendly error page with retry button

---

### 2. Error Tracking Service (Medium)

**Problem**: No centralized error tracking (console logging only)
**Blocks**:

- Can't monitor production errors
- No error frequency analysis
- Can't proactively fix issues

**Implementation**:

- Integrate Sentry, LogRocket, or similar
- Track all unhandled errors
- Add breadcrumb tracking for user actions
- Set up error alerts

---

## Test Coverage Gaps

### 1. Error Handling Scenarios (Critical)

**Untested area**: Network errors, API timeouts, database failures
**Files**:

- `apps/game/pages/game/[[gameId]].vue` - No error scenario tests
- `apps/game/stores/game.ts` - No error path tests
- `apps/game/composables/useAnswerCheck.ts` - No timeout tests

**Risk**: Error paths crash app in production while tests pass

**Priority**: High - Add before launch
**Coverage**:

- Mock network failures in E2E tests
- Test Wikipedia API timeout (>10 seconds)
- Test IndexedDB full quota errors

---

### 2. Edge Case Scenarios (High)

**Untested area**: Empty inputs, 0 players, single player games
**Files**:

- `apps/game/pages/players.vue` - No 0-player test
- `apps/game/pages/game/[[gameId]].vue` - No skip-all-rounds test
- `apps/game/pages/results/[[gameId]].vue` - No zero-score scenarios

**Risk**: App behaves unexpectedly in edge cases

**Priority**: High - Add before launch
**Coverage**:

- 0 players attempting to start game
- All players skip entire round
- Single player game flow
- Very long player names (20 chars)

---

### 3. Offline Functionality (High)

**Untested area**: PWA offline mode, service worker caching
**Files**:

- `tests/e2e/` - No offline tests

**Risk**: App doesn't work offline despite PWA claims

**Priority**: High - Key feature
**Coverage**:

- DevTools offline simulation
- Cached assets still load
- Can play offline
- Progress saves offline
- Comes online and syncs

---

### 4. Mobile Responsiveness (Medium)

**Untested area**: Touch handling, small viewport layouts
**Files**:

- `tests/e2e/helpers/mobile.ts` - Mobile helpers exist but may not cover all scenarios

**Risk**: UI broken on actual mobile devices despite Playwright tests

**Priority**: Medium - Should test before launch
**Coverage**:

- Various iPhone/Android screen sizes
- Touch event handling (no mouse)
- Scroll handling on small viewports
- Input focus on mobile keyboards

---

### 5. Localization Testing (Low)

**Untested area**: German and English language switching
**Files**:

- `tests/e2e/` - No locale switching tests

**Risk**: Missing translations not caught

**Priority**: Low - Nice to have
**Coverage**:

- Both locales in E2E tests
- All UI strings translated
- No hardcoded English strings
- Proper text direction if RTL added

---

## Technical Debt Summary by Category

| Area           | Count        | Priority | Estimated Effort |
| -------------- | ------------ | -------- | ---------------- |
| Error Handling | 4 items      | Critical | 8-12 hours       |
| Testing Gaps   | 5 items      | High     | 16-20 hours      |
| Code Quality   | 2 items      | Medium   | 4-6 hours        |
| Security       | 3 items      | Medium   | 6-8 hours        |
| Performance    | 3 items      | Medium   | 8-10 hours       |
| Dependencies   | 2 items      | Low      | 2-4 hours        |
| **Total**      | **19 items** |          | **44-60 hours**  |

---

## Remediation Roadmap

### Phase 1: Pre-Launch Critical (Before MVP Release)

1. Implement try-catch in `handleSubmit()` (game.vue)
2. Add error handling to category loading (game.ts)
3. Implement error boundary component
4. Add E2E tests for error scenarios
5. Implement quit confirmation modal (component exists, need routing)
6. Test offline functionality

**Estimated**: 16 hours

### Phase 2: Post-Launch Quick Wins (Week 1-2)

1. Remove console.log statements
2. Implement localStorage fallback for IndexedDB
3. Add error tracking service
4. Implement pagination for history/leaderboard
5. Add input validation with Zod
6. Code split lazy components

**Estimated**: 20 hours

### Phase 3: Optimization (Week 3-4)

1. Image optimization and conversion to WebP
2. Bundle size analysis and reduction
3. Performance monitoring
4. Accessibility audit (WCAG AA)
5. Security audit and CSP headers

**Estimated**: 16 hours

---

_Concerns audit completed on 2026-01-31_
_Sources: MVP-TASKS.md, codebase analysis, test coverage reports_
