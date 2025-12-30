# MVP Critical Tasks

This document tracks critical tasks needed to complete the MVP before launch.

**Last Updated**: 2025-12-30
**Status**: Fortune wheel integrated, mobile optimizations completed, MVP flow working

---

## 🔴 Critical Priority (Must Have for MVP)

### 1. Error Handling ⚠️ BLOCKING

#### 1.1 Game Page Error Handling
**File**: `pages/game.vue`
**Current State**: No try-catch blocks, errors crash the game
**Issues**:
- ❌ No error handling in `handleSubmit()` when API call fails
- ❌ No handling for network timeout
- ❌ No fallback when Wikipedia API is unreachable
- ❌ No user feedback when checkAnswer fails

**Implementation Needed**:
```typescript
const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!result.value.trim() || !currentCategory.value || loading.value) return

  loading.value = true
  output.value = t('game.checking')

  try {
    const term = result.value.trim()
    const category = currentCategory.value
    const letter = currentLetter.value

    const response = await checkAnswer(category.searchWord, letter, term)
    // ... existing logic
  } catch (error) {
    console.error('Error checking answer:', error)
    output.value = t('game.error_checking')
    audio.playError()
  } finally {
    loading.value = false
  }
}
```

**Translation keys to add**:
- `game.error_checking` (already exists in locales)
- `game.network_error` - "Network error. Please check your connection."
- `game.api_timeout` - "Request timed out. Please try again."

#### 1.2 Category Loading Error Handling
**File**: `stores/game.ts`, `composables/useIndexedDB.ts`
**Current State**: Basic error logging, no user-facing recovery
**Issues**:
- ❌ If categories fail to load, game cannot start
- ❌ No retry mechanism
- ❌ No cached category fallback

**Implementation Needed**:
- Add toast/notification system for errors
- Implement category cache in IndexedDB as fallback
- Add "Retry" button when category load fails
- Show user-friendly error message

#### 1.3 IndexedDB Error Recovery
**File**: `composables/useIndexedDB.ts`
**Current State**: Errors logged to console only
**Issues**:
- ❌ If IndexedDB fails to initialize, no fallback
- ❌ Game progress not saved if DB unavailable
- ❌ No user notification

**Implementation Needed**:
- Implement localStorage fallback if IndexedDB unavailable
- Notify user when progress cannot be saved
- Add option to export/import game state manually

#### 1.4 Input Validation & Sanitization
**File**: `pages/game.vue`, `pages/players.vue`
**Current State**: Minimal validation
**Issues**:
- ❌ No max length validation on answer input
- ❌ No special character filtering
- ❌ Player names can be empty strings
- ❌ No XSS protection

**Implementation Needed**:
```typescript
// Player name validation
const isValidPlayerName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 20
}

// Answer sanitization
const sanitizeAnswer = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}
```

---

## 🟡 High Priority (Important for MVP)

### 2. User Experience Improvements

#### 2.1 Pause Functionality ⚠️ MISSING
**Status**: ❌ Not implemented (design assets exist)
**Impact**: Users cannot pause during gameplay
**Files Needed**:
- `components/PauseModal.vue`
- Add pause state to `stores/game.ts`
- Hook ESC key to pause
- Add pause button to game header

**User Stories**:
- As a player, I want to pause the game when interrupted
- As a player, I want to see my progress when paused
- As a player, I want to resume or quit from pause screen

#### 2.2 Quit Confirmation ⚠️ MISSING
**Status**: ❌ Not implemented (design assets exist)
**Impact**: Users accidentally leave games, losing progress
**Files Needed**:
- `components/QuitModal.vue`
- Add navigation guard to `pages/game.vue`
- Trigger on back button press

**Implementation**:
```typescript
// In game.vue
onBeforeRouteLeave((to, from, next) => {
  if (gameStore.hasActiveSession && !confirmed.value) {
    showQuitModal.value = true
    next(false)
  } else {
    next()
  }
})
```

#### 2.3 Loading States
**Current State**: Basic spinner component exists
**Issues**:
- ❌ No loading state for category fetch on startup
- ❌ No loading state for Wikipedia API calls (has spinner on submit button)
- ❌ No skeleton screens for initial page load

**Implementation Needed**:
- Add loading overlay for app initialization
- Show spinner during category loading
- Add skeleton screens for game, leaderboard pages

#### 2.4 Empty States
**Current State**: Basic "No entries" text
**Issues**:
- ❌ Empty leaderboard looks broken
- ❌ No players added state is unclear
- ❌ No game history message is missing

**Implementation Needed**:
- Design and implement empty state illustrations
- Add helpful text explaining what to do
- Add CTA buttons (e.g., "Start Your First Game")

---

## 🟢 Medium Priority (Should Have for MVP)

### 3. Data Validation & Edge Cases

#### 3.1 Player Management Edge Cases
**File**: `pages/players.vue`
**Issues**:
- ⚠️ Can add player with empty name (after trim)
- ⚠️ Duplicate player names allowed
- ⚠️ Can start game with 0 players (should require minimum 1)

**Fixes Needed**:
```typescript
const addPlayer = () => {
  const newName = `Player ${players.value.length + 1}`

  // Validate: non-empty, unique, max length
  if (players.value.some(p => p.name === newName)) {
    // Show error: "Player name already exists"
    return
  }

  if (players.value.length < maxPlayers) {
    players.value.push({ name: newName })
  }
}

const startGame = async () => {
  // Validate: at least 1 player
  if (players.value.length === 0) {
    // Show error: "Add at least one player"
    return
  }

  // ... existing logic
}
```

#### 3.2 Game Session Edge Cases
**Issues**:
- ⚠️ What happens if all players skip a round? (currently undefined)
- ⚠️ Can submit empty answer after trimming
- ⚠️ No maximum attempt limit per round
- ⚠️ No time limit (game can run forever)

**Decisions Needed**:
- Should there be a max attempts per round?
- Should there be a time limit per round?
- What happens if no one answers correctly?
- Should skipping count against score?

#### 3.3 Alphabet Selection Edge Cases
**File**: `pages/alphabet.vue`
**Issues**:
- ⚠️ Can navigate back from alphabet without selecting letter
- ⚠️ Selected letter not persisted if page reloaded
- ⚠️ No validation that letter was selected before navigating

**Fixes**:
```typescript
const startGame = () => {
  if (!selectedLetter.value) {
    // Show error: "Please select a letter first"
    return
  }
  router.push('/game')
}
```

---

## 🔵 Low Priority (Nice to Have)

### 4. Performance & Optimization

#### 4.1 Asset Loading
- ⚠️ Large images not optimized (some PNGs are >500KB)
- ⚠️ No lazy loading for off-screen images
- ⚠️ No image compression

**Optimizations**:
- Use `next/image` equivalent for automatic optimization
- Implement lazy loading for below-the-fold content
- Compress assets using TinyPNG or similar

#### 4.2 Code Splitting
- ⚠️ All pages loaded in initial bundle
- ⚠️ Large dependencies bundled together

**Optimizations**:
- Use dynamic imports for heavy components
- Split vendor chunks
- Lazy load debug panel

#### 4.3 Caching Strategy
**Current State**: Service worker caches categories and assets
**Improvements**:
- Add versioning to cached data
- Implement cache invalidation strategy
- Add background sync for offline play

---

## 🎯 Testing Requirements

### 5.1 E2E Test Coverage Gaps
**Current Coverage**: Basic happy path tested
**Missing Tests**:
- ❌ Error scenarios (network failure, API timeout)
- ❌ Edge cases (0 players, empty inputs)
- ❌ Multi-player full game flow (all players submitting)
- ❌ Offline mode functionality
- ❌ Back button navigation during active game

**Priority Tests to Add**:
```typescript
test('should handle network error gracefully', async ({ page }) => {
  // Simulate offline mode
  await page.route('**/api/**', route => route.abort())
  // ... test error handling
})

test('should prevent starting game with no players', async ({ page }) => {
  // Remove all players
  // Try to start game
  // Verify error message shown
})

test('should show quit confirmation when leaving active game', async ({ page }) => {
  // Start game
  // Click back button
  // Verify quit modal appears
})
```

### 5.2 Unit Test Coverage Gaps
**Current Coverage**: 80% threshold set
**Missing Tests**:
- ❌ Game store error handling paths
- ❌ IndexedDB failure scenarios
- ❌ Answer checking edge cases
- ❌ Multi-player scoring logic

---

## 📊 Monitoring & Analytics

### 6.1 Error Tracking
**Current State**: Console.error only
**Needed**:
- Implement error boundary component
- Add error tracking service (Sentry, LogRocket, etc.)
- Track common error patterns
- Alert on critical errors

### 6.2 User Analytics
**Current State**: Basic Google Analytics setup
**Additional Tracking**:
- Game completion rate
- Average session duration
- Most popular categories
- Error frequency by page
- Player count distribution

---

## 🔐 Security Considerations

### 7.1 Input Sanitization
**Status**: ⚠️ Minimal sanitization
**Risks**:
- XSS through player names
- XSS through answer inputs
- Script injection in category names

**Mitigations**:
- Sanitize all user inputs before display
- Use v-text instead of v-html where possible
- Implement Content Security Policy headers

### 7.2 Data Validation
**Client-side**: Basic validation exists
**Server-side**: N/A (static site)
**Risks**:
- Wikipedia API could return unexpected data
- Category JSON could be malformed

**Mitigations**:
- Validate API response structure
- Add TypeScript runtime validation (Zod, Yup)
- Handle malformed JSON gracefully

---

## 🚀 Pre-Launch Checklist

### Critical (Must Complete)
- [ ] Add error handling to game.vue handleSubmit
- [ ] Add error handling to category loading
- [ ] Implement quit confirmation modal
- [ ] Add input validation to player names
- [ ] Test offline functionality
- [ ] Fix empty state UIs

### High Priority (Should Complete)
- [ ] Implement pause modal
- [ ] Add loading states for all async operations
- [ ] Test all edge cases (0 players, empty inputs, etc.)
- [ ] Add E2E tests for error scenarios
- [x] Verify mobile responsiveness on Playwright (375x667 viewport) ✅
- [ ] Verify on real mobile devices (iOS Safari, Android Chrome)
- [ ] Test 6-player game flow

### Medium Priority (Nice to Have)
- [ ] Optimize image assets
- [ ] Implement toast notification system
- [ ] Add error tracking service
- [ ] Complete E2E test coverage
- [ ] Performance audit and optimization
- [ ] Accessibility audit (WCAG AA)

### Pre-Deploy Verification
- [ ] All E2E tests passing
- [ ] No console errors in production build
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices, SEO)
- [ ] PWA installable and works offline
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Clear browser data and test fresh install

---

## 📝 Known Issues to Address

### Current Bugs
1. **i18n warnings on game page** - Translation keys still showing warnings (may need server restart)
2. **Selected letter not used from alphabet page** - Letter is generated randomly instead of using selected one
3. ~~**Fortune wheel position**~~ - ✅ **FIXED** - Mobile optimization completed (responsive radius, increased touch targets)
4. ~~**Coin display**~~ - ✅ **Hidden for MVP** - All coin bars and displays removed for MVP scope
5. **Menu button (⋮)** - Exists in game header but doesn't open menu/pause

### Technical Debt
1. Remove unused test page (`pages/test.vue`)
2. Clean up console.log statements
3. Remove unused imports
4. Standardize error handling patterns
5. Document component props and emits
6. Add JSDoc comments to complex functions

---

## 🎯 Quick Action Items (This Week)

1. **Add try-catch to handleSubmit** in game.vue (30 min)
2. **Implement quit modal** component (2 hours)
3. **Add player name validation** in players.vue (30 min)
4. **Fix alphabet letter selection** - pass selected letter to game (1 hour)
5. **Add error toast component** for user-facing errors (1 hour)
6. **Test and fix offline mode** (1 hour)
7. **Add E2E test for error handling** (1 hour)

**Total Estimated Time**: ~8 hours of focused development

---

**Maintained By**: Claude Sonnet 4.5
**Next Review**: After critical tasks completed
