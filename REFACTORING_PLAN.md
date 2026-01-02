# Code Sharing & Refactoring Plan

**Date**: 2026-01-02
**Status**: Analysis Complete

## 📊 Current State Analysis

### Pinia Stores
- **game.ts** (14 KB) - Main game logic, session management
- **settings.ts** (2.4 KB) - Settings with localStorage

### Composables
- useAnalytics.ts (1.9 KB)
- useAnswerCheck.ts (4.4 KB)
- useAudio.ts (3.1 KB)
- useGameActions.ts (3.8 KB)
- useIndexedDB.ts (6.3 KB)
- useLogger.ts (708 B)
- **usePageSetup.ts (363 B)** - ⚠️ Created but rarely used!
- usePageSwipe.ts (1023 B)
- useStatistics.ts (5.8 KB)
- useToast.ts (1.6 KB)

### Pages (by size)
1. players.vue (673 lines) - Largest
2. game.vue (600 lines)
3. results.vue (546 lines)
4. round-start.vue (539 lines)
5. leaderboard.vue (495 lines)
6. index.vue (421 lines)
7. language.vue (403 lines)
8. credits.vue (315 lines)
9. settings.vue (91 lines) - Smallest

## 🔍 Identified Issues

### 1. **Unused Composable - usePageSetup** ⚠️ CRITICAL
**Problem**: Created but only used in 0/9 pages!

```typescript
// composables/usePageSetup.ts
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl

  return { router, t, baseUrl }
}
```

**Current Pattern** (repeated in 9 pages):
```typescript
const router = useRouter()
const { t } = useI18n()
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl
const toast = useToast() // In 18 locations
const gameStore = useGameStore() // In 5 pages
```

**Impact**: ~50 lines of duplicated setup code across pages

---

### 2. **Category Emoji Logic Trapped in Store**
**Problem**: Category emoji mapping is hardcoded in `stores/game.ts`

```typescript
const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Weiblicher Vorname': '👩',
  'Männlicher Vorname': '👨',
  // ... 35 more entries
}

const resolveCategoryEmoji = (name?: string | null) => {
  // Logic here
}
```

**Issue**:
- Not reusable outside store
- Makes store larger than necessary
- Belongs in utils, not state management

---

### 3. **localStorage Scattered Across Files**
**Files using localStorage directly**:
- stores/settings.ts (load/save settings)
- components/FeedbackWidget.vue (dismissed state)

**Problem**: No centralized storage utility
- Error handling duplicated
- No type safety
- No consistent naming

---

### 4. **Common Computed Properties from Store**
**Pattern repeated across pages**:
```typescript
// In game.vue, results.vue, round-start.vue, leaderboard.vue, players.vue
const gameStore = useGameStore()
const currentCategory = computed(() => gameStore.currentCategory)
const currentLetter = computed(() => gameStore.currentLetter)
const players = computed(() => gameStore.players)
const currentRound = computed(() => gameStore.currentRound)
```

**Impact**: 20+ duplicated computed property declarations

---

### 5. **Navigation Logic Duplication**
**Pattern**: Every page has its own navigation functions
```typescript
// Repeated across pages
const goHome = () => router.push('/')
const goToPlayers = () => router.push('/players')
const goToSettings = () => router.push('/settings')
```

**Found in**: 29 router-related code blocks across 9 pages

---

### 6. **Toast Usage Not Centralized**
**Found**: 18 toast-related calls across pages
**Pattern**:
```typescript
const toast = useToast()
toast.show('message', 'type')
```

**Missing**:
- Toast could be part of usePageSetup
- Common toast messages could be predefined

---

## 🎯 Refactoring Recommendations

### Priority 1: High Impact, Low Risk

#### 1.1. Expand and Use `usePageSetup` Composable
**Action**: Enhance and actually use the existing composable

```typescript
// composables/usePageSetup.ts
export function usePageSetup() {
  const router = useRouter()
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl
  const toast = useToast()

  // Common navigation helpers
  const goHome = () => router.push('/')
  const goBack = () => router.back()

  return {
    router,
    t,
    baseUrl,
    toast,
    goHome,
    goBack,
  }
}
```

**Apply to**: All 9 pages
**Savings**: ~70 lines of code, better maintainability

---

#### 1.2. Create `useCategoryEmoji` Utility
**Action**: Extract emoji logic from store

```typescript
// composables/useCategoryEmoji.ts
const CATEGORY_EMOJI_MAP: Record<string, string> = {
  // Move from store
}

export function useCategoryEmoji() {
  const resolve = (name?: string | null) => {
    if (!name) return '🎯'
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return emoji
      }
    }
    return '🎯'
  }

  return { resolve, emojiMap: CATEGORY_EMOJI_MAP }
}
```

**Then update store**:
```typescript
// stores/game.ts
import { useCategoryEmoji } from '~/composables/useCategoryEmoji'

getters: {
  categoryEmoji: () => {
    const { resolve } = useCategoryEmoji()
    return (name?: string | null) => resolve(name)
  }
}
```

**Savings**: ~50 lines cleaner store, reusable utility

---

#### 1.3. Create `useGameState` Composable
**Action**: Centralize common game store computeds

```typescript
// composables/useGameState.ts
export function useGameState() {
  const gameStore = useGameStore()

  // Common computeds
  const currentCategory = computed(() => gameStore.currentCategory)
  const currentLetter = computed(() => gameStore.currentLetter)
  const currentRound = computed(() => gameStore.currentRound)
  const players = computed(() => gameStore.players)
  const currentPlayerTurn = computed(() => gameStore.currentPlayerTurn)
  const allPlayersSubmitted = computed(() => gameStore.allPlayersSubmitted)
  const isGameCompleted = computed(() => gameStore.isGameCompleted)
  const leaderboard = computed(() => gameStore.leaderboard)

  return {
    gameStore,
    currentCategory,
    currentLetter,
    currentRound,
    players,
    currentPlayerTurn,
    allPlayersSubmitted,
    isGameCompleted,
    leaderboard,
  }
}
```

**Apply to**: game.vue, results.vue, round-start.vue, leaderboard.vue, players.vue
**Savings**: ~30 lines of duplicated computeds

---

### Priority 2: Medium Impact, Low Risk

#### 2.1. Create `useLocalStorage` Utility
**Action**: Centralize localStorage access

```typescript
// composables/useLocalStorage.ts
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const logger = useLogger()

  const get = (): T => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (e) {
      logger.warn(`Failed to load from localStorage (${key}):`, e)
      return defaultValue
    }
  }

  const set = (value: T): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      logger.warn(`Failed to save to localStorage (${key}):`, e)
    }
  }

  const remove = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  return { get, set, remove }
}
```

**Apply to**: settings store, FeedbackWidget component
**Savings**: ~20 lines, better error handling, type safety

---

#### 2.2. Create Navigation Constants/Helpers
**Action**: Define common routes and navigation

```typescript
// utils/routes.ts
export const ROUTES = {
  HOME: '/',
  PLAYERS: '/players',
  ROUND_START: '/round-start',
  GAME: '/game',
  RESULTS: '/results',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  LANGUAGE: '/language',
  CREDITS: '/credits',
} as const

// composables/useNavigation.ts
export function useNavigation() {
  const router = useRouter()

  return {
    goHome: () => router.push(ROUTES.HOME),
    goToPlayers: () => router.push(ROUTES.PLAYERS),
    goToRoundStart: () => router.push(ROUTES.ROUND_START),
    goToGame: () => router.push(ROUTES.GAME),
    goToResults: () => router.push(ROUTES.RESULTS),
    goToLeaderboard: () => router.push(ROUTES.LEADERBOARD),
    goToSettings: () => router.push(ROUTES.SETTINGS),
    goToLanguage: () => router.push(ROUTES.LANGUAGE),
    goToCredits: () => router.push(ROUTES.CREDITS),
    goBack: () => router.back(),
  }
}
```

**Benefit**: Type-safe routes, no typos, centralized

---

### Priority 3: Nice to Have

#### 3.1. Create Common Toast Messages
```typescript
// composables/useGameToasts.ts
export function useGameToasts() {
  const toast = useToast()
  const { t } = useI18n()

  return {
    correctAnswer: () => toast.show(t('game.correct'), 'success'),
    incorrectAnswer: () => toast.show(t('game.incorrect'), 'error'),
    sessionError: () => toast.show(t('game.no_active_session'), 'error'),
    saved: () => toast.show(t('common.saved'), 'success'),
    error: (msg: string) => toast.show(msg, 'error'),
  }
}
```

---

#### 3.2. Extract Alphabet/Random Letter Logic
**Current**: In game store
**Better**: Separate utility

```typescript
// utils/alphabet.ts (or move constants.ts ALPHABET here)
import { ALPHABET } from './constants'

export const randomLetter = () => {
  const index = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET.charAt(index).toLowerCase()
}

export const isValidLetter = (letter: string) => {
  return ALPHABET.toLowerCase().includes(letter.toLowerCase())
}
```

---

## 📈 Impact Summary

### Code Reduction
- **Before**: ~4083 lines across 9 pages
- **After**: ~3800 lines (estimated)
- **Savings**: ~280 lines of duplicated code

### Maintainability Improvements
- ✅ Single source of truth for common setup
- ✅ Easier to update navigation routes
- ✅ Consistent localStorage access
- ✅ Type-safe utilities
- ✅ Testable composables
- ✅ Smaller, focused stores

### Developer Experience
- ✅ Less boilerplate in new pages
- ✅ Auto-complete for routes
- ✅ Common patterns obvious
- ✅ Easier onboarding

---

## 🚀 Implementation Plan

### Phase 1: Core Refactoring (High Impact)
1. ✅ Expand `usePageSetup` with toast + navigation
2. ✅ Create `useCategoryEmoji` composable
3. ✅ Create `useGameState` composable
4. ✅ Apply to all pages (one at a time)

### Phase 2: Utilities (Medium Impact)
5. ✅ Create `useLocalStorage` composable
6. ✅ Refactor settings store to use it
7. ✅ Update FeedbackWidget component
8. ✅ Create `ROUTES` constants + `useNavigation`

### Phase 3: Polish (Nice to Have)
9. ✅ Create `useGameToasts` for common messages
10. ✅ Extract alphabet utils

### Phase 4: Testing & Verification
11. ✅ Run lint + typecheck after each change
12. ✅ Test each page after refactoring
13. ✅ Verify no regressions
14. ✅ Update documentation

---

## 📝 File Changes Required

### New Files
- `composables/useCategoryEmoji.ts`
- `composables/useGameState.ts`
- `composables/useLocalStorage.ts`
- `composables/useNavigation.ts`
- `composables/useGameToasts.ts` (optional)
- `utils/routes.ts`
- `utils/alphabet.ts` (optional)

### Modified Files
- `composables/usePageSetup.ts` (expand)
- `stores/game.ts` (remove emoji map)
- `stores/settings.ts` (use useLocalStorage)
- `components/FeedbackWidget.vue` (use useLocalStorage)
- All 9 page files (use new composables)

---

## ⚠️ Risks & Mitigation

### Risk: Breaking Changes
**Mitigation**:
- Refactor one page at a time
- Test after each change
- Keep git commits small

### Risk: Type Errors
**Mitigation**:
- Run typecheck after each file
- Use strict TypeScript

### Risk: Runtime Errors
**Mitigation**:
- Test in browser after each page
- Check console for errors

---

## ✅ Success Criteria

- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] No runtime errors
- [ ] All pages work identically
- [ ] Code is more maintainable
- [ ] Less duplication
- [ ] Better developer experience

---

## 📚 Benefits

### Immediate
- Cleaner, smaller page files
- Less boilerplate to write
- Easier to find common logic

### Long-term
- Easier to add new pages
- Easier to update navigation
- Easier to test composables
- Better code organization
- Lower maintenance burden

---

**Ready to start refactoring?** Begin with Phase 1, Step 1!
