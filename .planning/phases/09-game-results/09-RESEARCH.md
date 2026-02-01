# Phase 9: Game Results - Research

**Researched:** 2026-02-01
**Domain:** Vue 3 results/scoring display, player score indicators, leaderboard ranking UI
**Confidence:** HIGH

## Summary

Phase 9 implements scoring and leaderboard pages matching mockups (`scoring.png` and `leaderboard.png`). The standard approach leverages existing GameScrollList, GameHeader, and GameButton components created in Phases 4-5, combined with custom player card components for score display. The key technical challenge is implementing animated +pts/-pts indicators for correct/incorrect answers that appear alongside player names.

The scoring page displays player cards in a scrollable list with green/red score indicators showing points gained or lost in the current round. The leaderboard page reuses GameScrollList with rank badges (crowns 1-3, numbered 4-6) and displays final standings. Both pages must exclude coin displays (not part of game mechanics) and use CSS-first styling with the existing design system.

The codebase already has the necessary infrastructure: Player type includes `currentRoundScore` for tracking round-by-round scoring, GameScrollList handles ranked display with crown/badge logic, and the existing design system provides green/red button colors for indicators. Animation support is available via `@vueuse/motion` (already installed) for smooth indicator appearance.

**Primary recommendation:** Build scoring page as a new `results/[[gameId]].vue` page with custom PlayerScoreCard component for score indicators, and refactor existing `leaderboard.vue` to use GameScrollList component. Use CSS transitions for indicator animations and existing design tokens for green/red color variants.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                  | Version      | Purpose                                | Why Standard                                              |
| ------------------------ | ------------ | -------------------------------------- | --------------------------------------------------------- |
| Vue 3 Composition API    | 3.x (Nuxt 4) | Component logic and reactivity         | Standard for all pages and components in this codebase    |
| TypeScript               | 5.9.3        | Type-safe props and state              | Enforced across codebase via experimental.typedPages      |
| Pinia Store              | Latest       | Game state and player data             | useGameStore provides leaderboard getter and player array |
| Existing Game Components | (Phases 3-5) | GameScrollList, GameHeader, GameButton | Reusable components for list display and navigation       |
| SCSS Design System       | (Phases 1-2) | Color tokens, spacing, effects         | Established in design-system.scss with all colors defined |

### Supporting

| Library           | Version | Purpose                            | When to Use                                      |
| ----------------- | ------- | ---------------------------------- | ------------------------------------------------ |
| @vueuse/motion    | ^3.0.3  | Declarative Vue animations         | For animated score indicators appearing/fading   |
| @vueuse/core      | ^14.1.0 | Vue composables (useTransition)    | For smooth number count-up animations            |
| UnoCSS            | ^66.6.0 | Utility classes for layout         | For flexbox, gap, and responsive spacing utility |
| Nuxt Auto-imports | Nuxt 4  | Component and composable discovery | All components auto-imported, no explicit import |

### Alternatives Considered

| Instead of                 | Could Use                  | Tradeoff                                                          |
| -------------------------- | -------------------------- | ----------------------------------------------------------------- |
| GameScrollList component   | Custom scrollable div      | Loses rank badge logic, scrollbar styling, and accessibility      |
| CSS transitions            | JavaScript animation loops | More complexity, worse performance, harder to maintain            |
| @vueuse/motion             | GSAP/Anime.js              | Heavier bundle, overkill for simple slide-in animations           |
| currentRoundScore tracking | Calculate on-the-fly       | Performance hit, inconsistent with existing Player type structure |
| Existing color tokens      | Hardcoded colors           | Breaks design system consistency, harder to theme                 |

**Installation:**

```bash
# No new packages required — @vueuse/motion already installed
```

## Architecture Patterns

### Recommended Project Structure

```
apps/game/
├── pages/
│   ├── results/
│   │   └── [[gameId]].vue     # Scoring page (NEW)
│   └── leaderboard.vue        # Refactor to use GameScrollList
├── components/
│   └── game/
│       ├── GamePlayerCard.vue # Player score card component (NEW)
│       ├── GameScrollList.vue # Existing rank display (Phase 5)
│       ├── GameHeader.vue     # Existing page title (Phase 5)
│       └── GameButton.vue     # Existing button (Phase 4)
└── stores/
    └── game.ts                # Existing store with leaderboard getter
```

### Pattern 1: Player Score Card with Conditional Indicators

**What:** Reusable player card component displaying name, round score, and green +pts / red -pts indicator based on score change.
**When to use:** Scoring page to show individual player performance for the current round.
**Example:**

```vue
<!-- Pattern: Conditional styling based on score value -->
<template>
  <div class="player-score-card">
    <div class="player-score-card__info">
      <span class="player-score-card__name">{{ player.name }}</span>
      <span class="player-score-card__answer">{{ player.currentRoundAnswer || 'XYZ' }}</span>
    </div>
    <div
      v-if="player.currentRoundScore !== 0"
      :class="[
        'player-score-card__indicator',
        player.currentRoundScore > 0
          ? 'player-score-card__indicator--positive'
          : 'player-score-card__indicator--negative',
      ]"
      v-motion
      :initial="{ opacity: 0, x: -10 }"
      :enter="{ opacity: 1, x: 0, transition: { duration: 400 } }"
    >
      {{ player.currentRoundScore > 0 ? '+' : '' }}{{ player.currentRoundScore }}pts
    </div>
  </div>
</template>
```

### Pattern 2: Leaderboard with GameScrollList Slot Pattern

**What:** Use GameScrollList component with scoped slot to render custom player row content while maintaining rank badges.
**When to use:** Leaderboard page to display final rankings with crowns/badges.
**Example:**

```vue
<!-- Pattern: GameScrollList with scoped slot for custom content -->
<template>
  <GameScrollList :show-ranks="true" max-height="500px">
    <div v-for="entry in leaderboard" :key="entry.id" class="leaderboard-row">
      <span class="leaderboard-row__name">{{ entry.name }}</span>
      <GameDisplay size="md" :glow="false">{{ entry.totalScore }}</GameDisplay>
    </div>
  </GameScrollList>
</template>
```

### Pattern 3: Score Indicator Color Variants with Design Tokens

**What:** Use existing button color tokens for green (positive) and red (negative) indicators with consistent styling.
**When to use:** For +pts/-pts indicators on scoring page.
**Example:**

```scss
// Pattern: Reuse button color tokens for consistency
.player-score-card__indicator {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);

  &--positive {
    background: linear-gradient(
      180deg,
      var(--color-btn-green-light) 0%,
      var(--color-btn-green-dark) 100%
    );
    color: var(--color-text-green);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &--negative {
    background: linear-gradient(
      180deg,
      var(--color-btn-red-light) 0%,
      var(--color-btn-red-dark) 100%
    );
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
}
```

### Pattern 4: Dynamic Page Routing with Optional Game ID

**What:** Use Nuxt dynamic route `[[gameId]]` for scoring page to support current session or historical session viewing.
**When to use:** When page needs to display either current session or a specific past session.
**Example:**

```typescript
// Pattern: Optional route param with fallback to current session
const route = useRoute()
const gameStore = useGameStore()

const gameId = computed(() => route.params.gameId as string | undefined)
const session = computed(() => {
  if (gameId.value) {
    // Load historical session from IndexedDB by ID
    return gameStore.getSessionById(gameId.value)
  }
  // Fallback to current session
  return gameStore.currentSession
})
```

### Pattern 5: Animated List Entry with @vueuse/motion

**What:** Use v-motion directive for declarative enter animations on player cards.
**When to use:** For smooth appearance of score indicators and player cards on page load.
**Example:**

```vue
<!-- Pattern: Staggered list animation with v-motion -->
<template>
  <div
    v-for="(player, index) in players"
    :key="player.id"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        duration: 300,
        delay: index * 50,
      },
    }"
  >
    <GamePlayerCard :player="player" />
  </div>
</template>
```

### Anti-Patterns to Avoid

- **Duplicating rank badge logic:** Don't recreate crown/numbered badge rendering; use existing GameScrollList component
- **Hardcoded colors for indicators:** Don't use inline hex colors; use design token CSS variables for consistency
- **Missing zero-score handling:** Don't show +0pts or -0pts indicators; only render when score !== 0
- **Heavy animation libraries:** Don't add GSAP or Anime.js for simple slide-in effects; CSS transitions or @vueuse/motion sufficient
- **Inline player list markup:** Don't duplicate scrollable list HTML; extract to reusable PlayerScoreCard component
- **Showing coins anywhere:** Mockups include coins but they're explicitly excluded per project constraints

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                          | Don't Build                    | Use Instead              | Why                                                    |
| -------------------------------- | ------------------------------ | ------------------------ | ------------------------------------------------------ |
| Ranked list with crown badges    | Custom crown rendering         | GameScrollList component | Already implements crowns 1-3, numbered 4-6, scrollbar |
| Animated score indicators        | Manual setTimeout loops        | @vueuse/motion v-motion  | Declarative, performant, handles cleanup automatically |
| Score color determination        | Multiple if/else color logic   | CSS modifier classes     | Cleaner, easier to maintain, leverages existing tokens |
| Page titles with 3D text effects | Custom text-shadow per page    | GameHeader component     | Consistent styling, reusable, supports color variants  |
| Scrollbar styling                | Per-component custom scrollbar | GameScrollList styles    | Dual webkit + Firefox support already implemented      |
| Button navigation                | Custom styled buttons          | GameButton component     | Consistent sizing, hover/active states, accessibility  |

**Key insight:** Phases 3-5 built reusable structural components specifically for this phase. Reusing them ensures consistency, reduces code duplication, and leverages tested accessibility patterns.

## Common Pitfalls

### Pitfall 1: Score Indicators Render Before Data Loads

**What goes wrong:** +pts/-pts indicators flash or show incorrect values because currentRoundScore hasn't populated yet from store.
**Why it happens:** Vue renders before Pinia store hydrates from IndexedDB on page load.
**How to avoid:** Add v-if guard checking session exists and round > 0 before rendering indicators.
**Warning signs:** Console errors about undefined player properties, or "0pts" indicators appearing briefly.

### Pitfall 2: Leaderboard Doesn't Update After Round Completion

**What goes wrong:** Scoring page shows updated scores but leaderboard page shows stale rankings.
**Why it happens:** Pinia getter is cached or page doesn't reactively depend on player totalScore changes.
**How to avoid:** Use computed leaderboard getter from store (already implements reactive sorting).
**Warning signs:** Leaderboard order doesn't match expected rankings after game round ends.

### Pitfall 3: Crowns Disappear When Player Count Exceeds 6

**What goes wrong:** GameScrollList only shows crowns for ranks 1-3 and badges for 4-6; rank 7+ have no indicator.
**Why it happens:** GameScrollList logic only renders indicators for first 6 positions (design decision from Phase 5).
**How to avoid:** Accept this behavior as intended (max 6 players per game per requirements) or extend GameScrollList to handle 7+.
**Warning signs:** Missing rank indicators for players beyond position 6.

### Pitfall 4: Color Contrast Fails on Score Indicators

**What goes wrong:** Green +pts indicator text hard to read on green gradient background.
**Why it happens:** Using white text on light green fails 4.5:1 contrast ratio.
**How to avoid:** Use dark text (--color-text-green: #2d5016) for positive indicators, white for negative red indicators.
**Warning signs:** Lighthouse accessibility audit failures, text hard to read in bright environments.

### Pitfall 5: Animation Performance Issues on Low-End Devices

**What goes wrong:** Staggered animations on 6-player list cause jank or dropped frames on older phones.
**Why it happens:** Too many simultaneous animations or heavy CSS transforms without GPU acceleration.
**How to avoid:** Limit stagger delay to 50ms max, use transform (not top/left), add will-change hint sparingly.
**Warning signs:** Stuttering animations, delayed page interaction, high CPU usage in DevTools.

### Pitfall 6: Dynamic Route Breaks on Page Refresh

**What goes wrong:** Refreshing `/results/abc123` shows empty page or wrong session data.
**Why it happens:** Game store currentSession cleared on refresh, and getSessionById not implemented for historical sessions.
**How to avoid:** For MVP, redirect to current session results if route param doesn't match; defer historical viewing to later phase.
**Warning signs:** 404-like behavior on refresh, empty player arrays.

## Code Examples

Verified patterns from existing codebase and official sources:

### GamePlayerCard Component Structure

```vue
<!-- New component: apps/game/components/game/GamePlayerCard.vue -->
<template>
  <div class="game-player-card" :class="{ 'game-player-card--highlight': isHighlight }">
    <!-- Player info section -->
    <div class="game-player-card__info">
      <span class="game-player-card__label">{{ label }}</span>
      <span class="game-player-card__name">{{ player.name }}</span>
      <span class="game-player-card__answer">{{ player.currentRoundAnswer || 'XYZ' }}</span>
    </div>

    <!-- Score indicator (conditional) -->
    <div
      v-if="showIndicator && player.currentRoundScore !== 0"
      :class="['game-player-card__indicator', indicatorClass]"
      v-motion
      :initial="{ opacity: 0, scale: 0.9, x: -10 }"
      :enter="{ opacity: 1, scale: 1, x: 0, transition: { duration: 350, ease: 'easeOut' } }"
    >
      <span class="game-player-card__indicator-text">
        {{ formatScore(player.currentRoundScore) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@riddle-rush/types/game'

interface Props {
  player: Player
  label?: string // "Player 1", "Player 2", etc.
  showIndicator?: boolean // Show +pts/-pts indicator
  isHighlight?: boolean // Highlight card (for current player)
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showIndicator: true,
  isHighlight: false,
})

const indicatorClass = computed(() => {
  return props.player.currentRoundScore > 0
    ? 'game-player-card__indicator--positive'
    : 'game-player-card__indicator--negative'
})

const formatScore = (score: number): string => {
  return score > 0 ? `+${score}pts` : `${score}pts`
}
</script>
```

### GamePlayerCard Styles

```scss
// Scoped styles for GamePlayerCard component
<style scoped lang="scss">
.game-player-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(
    180deg,
    var(--color-panel-light) 0%,
    var(--color-panel-cream) 100%
  );
  border-radius: var(--radius-lg);
  border: 3px solid var(--color-border-gold);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: transform var(--transition-base);

  &--highlight {
    border-color: var(--color-border-orange);
    box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}

.game-player-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  min-width: 0; // Allow text truncation
}

.game-player-card__label {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.game-player-card__name {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-dark);
}

.game-player-card__answer {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text-dark);
  opacity: 0.7;
}

// Score indicator
.game-player-card__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  min-width: 70px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &--positive {
    background: linear-gradient(
      180deg,
      var(--color-btn-green-light) 0%,
      var(--color-btn-green-dark) 100%
    );
    color: var(--color-text-green);
    border: 2px solid var(--color-btn-green-shadow);
  }

  &--negative {
    background: linear-gradient(
      180deg,
      var(--color-btn-red-light) 0%,
      var(--color-btn-red-dark) 100%
    );
    color: white;
    border: 2px solid var(--color-btn-red-shadow);
  }
}

.game-player-card__indicator-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  // Add emoji/icon before text via ::before if desired
}
</style>
```

### Scoring Page Structure

```vue
<!-- New page: apps/game/pages/results/[[gameId]].vue -->
<template>
  <GameBackground>
    <div class="scoring-page">
      <!-- Header -->
      <GameHeader variant="gold">
        {{ t('scoring.title', 'Scoring') }}
      </GameHeader>

      <!-- Player cards list -->
      <div class="scoring-page__list">
        <GamePlayerCard
          v-for="(player, index) in players"
          :key="player.id"
          :player="player"
          :label="`${t('scoring.player', 'Player')} ${index + 1}`"
          :show-indicator="true"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 300,
              delay: index * 50,
            },
          }"
        />
      </div>

      <!-- Next Round button -->
      <GameButton variant="primary" size="lg" @click="handleNextRound">
        {{ t('scoring.next_round', 'Next Round') }}
      </GameButton>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const { t } = useI18n()
const gameStore = useGameStore()
const router = useRouter()

const players = computed(() => gameStore.players)

const handleNextRound = async () => {
  // Navigate to next round (round-start page)
  await router.push('/round-start')
}

useHead({
  title: 'Scoring',
  meta: [{ name: 'description', content: 'Round scoring results' }],
})
</script>

<style scoped lang="scss">
.scoring-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
  min-height: 100vh;
  min-height: 100dvh;
}

.scoring-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 600px;
}
</style>
```

### Leaderboard Page Refactor (Using GameScrollList)

```vue
<!-- Refactored: apps/game/pages/leaderboard.vue -->
<template>
  <GameBackground>
    <div class="leaderboard-page">
      <!-- Header -->
      <GameHeader variant="gold">
        {{ t('leaderboard.title', 'Leaderboard') }}
      </GameHeader>

      <!-- Ranking subtitle -->
      <GamePanel variant="blue" padding="sm">
        <h2 class="leaderboard-page__subtitle">
          {{ t('leaderboard.ranking', 'Ranking') }}
        </h2>
      </GamePanel>

      <!-- Ranked player list -->
      <GameScrollList :show-ranks="true" max-height="500px">
        <div v-for="entry in leaderboard" :key="entry.id" class="leaderboard-row">
          <span class="leaderboard-row__name">{{ entry.name }}</span>
          <GameDisplay size="md" :glow="false">
            {{ entry.totalScore }}
          </GameDisplay>
        </div>
      </GameScrollList>

      <!-- Navigation buttons -->
      <div class="leaderboard-page__actions">
        <GameButton v-if="!isGameCompleted" variant="primary" size="lg" @click="handleNextRound">
          {{ t('leaderboard.next_round', 'Next Round') }}
        </GameButton>
        <GameButton variant="secondary" size="lg" @click="handleFinish">
          {{ t('leaderboard.finish', 'OK') }}
        </GameButton>
      </div>
    </div>
  </GameBackground>
</template>

<script setup lang="ts">
const { t } = useI18n()
const gameStore = useGameStore()
const router = useRouter()

const leaderboard = computed(() => gameStore.leaderboard)
const isGameCompleted = computed(() => gameStore.currentSession?.status === 'completed')

const handleNextRound = async () => {
  await router.push('/round-start')
}

const handleFinish = async () => {
  await gameStore.endGame()
  await router.push('/')
}

useHead({
  title: 'Leaderboard',
  meta: [{ name: 'description', content: 'Game leaderboard' }],
})
</script>

<style scoped lang="scss">
.leaderboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-md);
  min-height: 100vh;
  min-height: 100dvh;
}

.leaderboard-page__subtitle {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: white;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.leaderboard-page__actions {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

// Leaderboard row styling (slot content for GameScrollList)
.leaderboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  width: 100%;
}

.leaderboard-row__name {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-dark);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

## State of the Art

| Old Approach                  | Current Approach                         | When Changed     | Impact                                      |
| ----------------------------- | ---------------------------------------- | ---------------- | ------------------------------------------- |
| Manual list ranking logic     | GameScrollList component with rank props | Phase 5 (2026)   | Reusable, consistent rank display           |
| Imperative animations         | Declarative @vueuse/motion               | Vue 3 (2020)     | Cleaner code, better performance            |
| Separate score tracking       | Player.currentRoundScore property        | Multi-player MVP | Consistent data model, easier to display    |
| Custom scrollbar CSS per page | GameScrollList dual-browser styling      | Phase 5 (2026)   | Webkit + Firefox support, single source     |
| Individual page title styling | GameHeader component with variants       | Phase 5 (2026)   | Consistent 3D text effects, color variants  |
| Hardcoded color values        | Design system CSS variables              | Phases 1-2       | Theme consistency, easier to update palette |

**Deprecated/outdated:**

- Building custom crown/badge rendering instead of using GameScrollList (Phase 5 provides this)
- Using heavy animation libraries (GSAP, Anime.js) for simple slide-ins (Vue Transition API and @vueuse/motion sufficient)
- Calculating leaderboard sorting in page component (store getter already provides sorted PlayerWithRank[])

## Open Questions

1. **Historical session viewing support**
   - What we know: Route supports `[[gameId]]` optional param for viewing past sessions
   - What's unclear: Whether IndexedDB retrieval by ID is implemented in game store
   - Recommendation: For MVP, only show current session results; defer historical viewing to future phase

2. **Score indicator animation timing**
   - What we know: @vueuse/motion supports stagger delays for list animations
   - What's unclear: Optimal delay value for 6-player list to feel responsive but not too fast
   - Recommendation: Start with 50ms stagger delay (300ms total for 6 players); adjust based on testing

3. **Zero-score display behavior**
   - What we know: Mockup doesn't show score indicators for all players (Player 4 has no indicator)
   - What's unclear: Whether missing indicator means 0pts or just hasn't answered yet
   - Recommendation: Don't render indicator when currentRoundScore === 0; matches mockup behavior

4. **Leaderboard "Ranking" subtitle styling**
   - What we know: Mockup shows "Ranking" as a subtitle in blue panel
   - What's unclear: Whether to use GamePanel component or custom styling
   - Recommendation: Use GamePanel with blue variant for consistency; add custom h2 styling for text

5. **Empty state handling**
   - What we know: Pages assume players array exists and has 1-6 players
   - What's unclear: What to show if currentSession is null (shouldn't happen but edge case)
   - Recommendation: Add v-if guard on currentSession and redirect to home if null

## Sources

### Primary (HIGH confidence)

- Local codebase: `apps/game/components/game/GameScrollList.vue` - Existing rank badge implementation (Phase 5)
- Local codebase: `apps/game/components/game/GameHeader.vue` - Page title component with 3D effects (Phase 5)
- Local codebase: `apps/game/components/game/GameButton.vue` - Button component with color variants (Phase 4)
- Local codebase: `apps/game/components/game/GameDisplay.vue` - Score display with glow effects (Phase 4)
- Local codebase: `packages/types/src/game.ts` - Player and GameSession type definitions with currentRoundScore
- Local codebase: `apps/game/stores/game.ts` - Game store with leaderboard getter and player management
- Local codebase: `apps/game/assets/scss/design-system.scss` - Color tokens and gradient definitions
- Local codebase: `apps/game/assets/scss/effects/_shadows.scss` - Text glow and shadow mixins
- Local codebase: `apps/game/package.json` - Confirms @vueuse/motion ^3.0.3 installed
- Mockups: `docs/mockups/scoring.png` - Visual reference for scoring page layout
- Mockups: `docs/mockups/leaderboard.png` - Visual reference for leaderboard page layout

### Secondary (MEDIUM confidence)

- [@vueuse/motion documentation](https://motion.vueuse.org/) - v-motion directive usage patterns
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html) - Computed properties and reactive patterns
- [Nuxt 4 Dynamic Routes](https://nuxt.com/docs/guide/directory-structure/pages#dynamic-routes) - Optional params with [[id]]
- [CSS Gradient Best Practices](https://web.dev/articles/css-gradient) - Smooth gradients and performance
- Phase 4 research: `04-RESEARCH.md` - Button component patterns and color variants
- Phase 5 plans: `05-01-PLAN.md` - GameHeader and GameScrollList implementation details

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All components and libraries verified from existing codebase
- Architecture: HIGH - Patterns match Phase 4-5 component structure, store usage verified
- Pitfalls: HIGH - Edge cases derived from existing Player type structure and component behavior
- Code examples: HIGH - Based directly on existing GameScrollList, GameButton, GameDisplay patterns

**Research date:** 2026-02-01
**Valid until:** 2026-03-03 (30 days for stable patterns, components already exist)
