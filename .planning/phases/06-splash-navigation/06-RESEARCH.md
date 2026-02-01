# Phase 6: Splash & Navigation - Research

**Researched:** 2026-02-01
**Domain:** Vue 3 + Nuxt 4 SPA page creation, CSS animations, route transitions
**Confidence:** HIGH

## Summary

Phase 6 involves creating a splash screen page and refactoring the existing main menu (index.vue) to match mockup requirements. The technical domain is well-established: Nuxt 4 file-based routing with Vue 3 composition API, CSS animations from the existing design system, and the project's established component patterns.

The project already has all necessary infrastructure:

- Design system with mockup-aligned colors, text effects, and animations
- GameHeader component with 3D text effects (perfect for "RIDDLE RUSH" title)
- GlobalLoading component with progress bar pattern
- Navigation composable with loading simulation (300-400ms)
- CSS animation utilities (fadeIn, slideUp, scaleIn)

The standard approach is to create a new `splash.vue` page that auto-navigates to the main menu after loading completes, using existing design system utilities and components. The main menu requires minimal refactoring - primarily removing designer-included elements (coins, profile avatar) that aren't part of the game mechanics.

**Primary recommendation:** Use Nuxt 4 file-based routing with new splash.vue page, leverage existing GameHeader for title text, create simple CSS progress bar matching mockup, auto-navigate after 2-3s using Vue's onMounted lifecycle.

## Standard Stack

The project already has the complete stack needed - no new dependencies required.

### Core

| Library        | Version | Purpose           | Why Standard                                          |
| -------------- | ------- | ----------------- | ----------------------------------------------------- |
| Nuxt           | 4.2.2   | App framework     | File-based routing, auto-imports, build optimization  |
| Vue            | 3.5.26  | UI framework      | Composition API, lifecycle hooks, transitions         |
| @vueuse/motion | 3.0.3   | Animation library | Declarative animations, already configured in project |
| SCSS           | -       | Styles            | Design system already uses SCSS with effects modules  |

### Supporting

| Library        | Version      | Purpose              | When to Use                                           |
| -------------- | ------------ | -------------------- | ----------------------------------------------------- |
| useNavigation  | (composable) | Type-safe routing    | All page transitions - already handles loading states |
| usePageSetup   | (composable) | Common page utils    | All pages - provides router, i18n, toast              |
| GameHeader     | (component)  | 3D title text        | Splash screen title - supports 5 color variants       |
| GameBackground | (component)  | Blue radial gradient | Both pages - consistent with mockup background        |

### Alternatives Considered

| Instead of       | Could Use                 | Tradeoff                                                        |
| ---------------- | ------------------------- | --------------------------------------------------------------- |
| CSS animations   | @vueuse/motion directives | Motion has more complexity, CSS is faster for simple fade/slide |
| Auto-navigation  | Manual button click       | Auto-nav provides better UX, matches typical splash behavior    |
| New progress bar | Reuse GlobalLoading       | GlobalLoading is modal overlay, splash needs inline bar         |

**Installation:**

```bash
# No new packages needed - all dependencies exist
```

## Architecture Patterns

### Recommended Project Structure

```
apps/game/pages/
├── splash.vue           # New: Splash screen with auto-nav
├── index.vue            # Refactor: Main menu (remove coins/avatar)
└── [other pages]        # Existing pages
```

### Pattern 1: Splash Screen with Auto-Navigation

**What:** Dedicated page that shows branding and loading, then auto-navigates to main menu
**When to use:** App entry point, before main menu
**Example:**

```vue
<!-- pages/splash.vue -->
<template>
  <div class="splash-page">
    <GameBackground />

    <!-- Title with 3D effect -->
    <div class="splash-content">
      <GameHeader color="gold">RIDDLE RUSH</GameHeader>

      <!-- Loading bar -->
      <div class="loading-container">
        <div class="loading-track">
          <div class="loading-fill" :style="{ width: `${progress}%` }" />
        </div>
        <div class="loading-text">LOADING....</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { goHome } = useNavigation()
const progress = ref(0)

onMounted(() => {
  // Animate progress bar
  const interval = setInterval(() => {
    progress.value += 2
    if (progress.value >= 100) {
      clearInterval(interval)
      // Navigate to main menu after completion
      setTimeout(() => goHome(), 300)
    }
  }, 40) // 2s total (50 steps × 40ms)
})
</script>
```

### Pattern 2: Page Transition Configuration

**What:** Nuxt 4 page transitions using CSS classes
**When to use:** All route changes for smooth visual flow
**Example:**

```vue
<!-- app.vue or layout -->
<template>
  <NuxtPage
    :transition="{
      name: 'page',
      mode: 'out-in',
    }"
  />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

### Pattern 3: Main Menu Button Stack

**What:** Vertically stacked buttons using existing GameButton component
**When to use:** Main menu buttons (PLAY/MENU/OPTIONS/CREDITS)
**Example:**

```vue
<!-- pages/index.vue (refactored) -->
<template>
  <div class="menu-page">
    <GameBackground />

    <div class="container">
      <!-- Logo (existing "RIDDLE RUSH" asset or GameHeader) -->
      <GameHeader color="gold" class="menu-logo">RIDDLE RUSH</GameHeader>

      <!-- Button stack -->
      <div class="menu-buttons">
        <GameButton variant="primary" size="lg" @click="goToPlayers"> PLAY </GameButton>
        <GameButton variant="secondary" size="lg" @click="toggleMenu"> MENU </GameButton>
        <GameButton variant="warning" size="lg" @click="goToSettings"> OPTIONS </GameButton>
        <GameButton variant="secondary" size="lg" @click="goToCredits"> CREDITS </GameButton>
      </div>
    </div>
  </div>
</template>
```

### Anti-Patterns to Avoid

- **Loading too fast:** If progress bar completes instantly, users don't perceive loading. Use minimum 1.5-2s duration.
- **Blocking navigation:** Don't prevent users from clicking through splash if they've seen it before. Consider localStorage flag.
- **Mismatched durations:** If navigation delay is 300ms but animation is 1s, janky transition occurs. Sync timing.
- **Heavy splash logic:** Splash should be lightweight - no data fetching, no heavy computation. Pure presentation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                  | Don't Build             | Use Instead                           | Why                                           |
| ------------------------ | ----------------------- | ------------------------------------- | --------------------------------------------- |
| 3D text effect           | Custom text-shadow      | GameHeader component + text-3d mixins | Already supports 5 colors, responsive, tested |
| Progress bar animation   | RAF loop + manual state | CSS transition + simple interval      | Simpler, GPU-accelerated, less code           |
| Navigation timing        | Custom Promise delays   | useNavigation composable              | Already handles loading states, debouncing    |
| Page transitions         | JavaScript animations   | Nuxt transition prop + CSS            | Declarative, performant, standard pattern     |
| Blue gradient background | Inline styles           | GameBackground component              | Consistent with all other pages               |

**Key insight:** The design system already provides all the visual effects needed. Don't recreate gradients, shadows, or text effects - they're meticulously crafted to match mockups.

## Common Pitfalls

### Pitfall 1: Splash Screen Shows Every Visit

**What goes wrong:** Users see splash screen every time they navigate back to home
**Why it happens:** No persistence of "has seen splash" state
**How to avoid:**

- Option A: Make splash a dedicated route (/splash), navigate from there to /
- Option B: Use localStorage flag to skip splash on repeat visits
- Option C: Only show splash on first app load, not on navigation
  **Warning signs:** User complaints, analytics showing high splash page views

### Pitfall 2: Progress Bar Not Smooth

**What goes wrong:** Progress bar jumps or stutters instead of smooth animation
**Why it happens:** Using discrete steps without CSS transitions
**How to avoid:** Apply `transition: width 0.1s linear` to progress-fill element, let CSS handle smoothness
**Warning signs:** Jerky animation, especially on slower devices

### Pitfall 3: Race Condition on Fast Loads

**What goes wrong:** Navigation triggers before progress bar visible, looks broken
**Why it happens:** Using `setTimeout` for both animation and navigation without coordination
**How to avoid:** Chain timings - animation completes, THEN navigation fires. Or use Promise chain.
**Warning signs:** Sometimes splash flashes by, inconsistent behavior

### Pitfall 4: Blocking Splash Screen

**What goes wrong:** Users stuck on splash with no way forward if auto-nav fails
**Why it happens:** Relying solely on JavaScript timer for navigation
**How to avoid:** Add "Tap to continue" text after 3s, or make entire screen clickable
**Warning signs:** Bug reports of "app stuck on loading", especially on poor connections

### Pitfall 5: Text Size Mismatch

**What goes wrong:** "RIDDLE RUSH" text doesn't match mockup size/positioning
**Why it happens:** Using default GameHeader size (3xl) instead of display size
**How to avoid:** Override font-size with CSS var --font-size-display (48px-72px fluid)
**Warning signs:** Title too small or too large compared to mockup

## Code Examples

Verified patterns from project codebase:

### Splash Page Structure

```vue
<!-- pages/splash.vue -->
<template>
  <div class="splash-page">
    <GameBackground />

    <div class="splash-container">
      <!-- Title: Use GameHeader with gold color + larger size -->
      <GameHeader color="gold" class="splash-title"> RIDDLE RUSH </GameHeader>

      <!-- Loading bar at bottom -->
      <div class="splash-loading">
        <div class="loading-bar">
          <div class="loading-bar__track">
            <div class="loading-bar__fill" :style="{ width: `${progress}%` }" />
          </div>
        </div>
        <p class="loading-text">LOADING....</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { goHome } = useNavigation()
const progress = ref(0)
const minDuration = 2000 // Minimum 2s for branding visibility

onMounted(() => {
  const startTime = Date.now()
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min(100, (elapsed / minDuration) * 100)

    if (progress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => goHome(), 300) // Brief pause after 100%
    }
  }, 50) // Update every 50ms for smooth animation
})

// Fallback: allow tap to skip after 1s
const canSkip = ref(false)
onMounted(() => {
  setTimeout(() => {
    canSkip.value = true
  }, 1000)
})

const handleSkip = () => {
  if (canSkip.value) {
    goHome()
  }
}
</script>

<style scoped lang="scss">
.splash-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.splash-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3xl);
  width: 100%;
  padding: var(--spacing-2xl);
}

.splash-title {
  // Override GameHeader size for larger display
  :deep(.game-header__title) {
    font-size: var(--font-size-display); // 48px-72px fluid
  }
}

.splash-loading {
  position: absolute;
  bottom: var(--spacing-3xl);
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-bar {
  width: 100%;
  max-width: 500px;

  &__track {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.4);
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-btn-orange-light), var(--color-btn-orange-dark));
    border-radius: var(--radius-full);
    transition: width 0.1s linear; // Smooth animation
  }
}

.loading-text {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-white);
  text-shadow: var(--text-shadow-embossed-white);
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .splash-loading {
    bottom: var(--spacing-2xl);
    left: var(--spacing-lg);
    right: var(--spacing-lg);
  }
}
</style>
```

### Main Menu Refactor (Remove Coins/Avatar)

```vue
<!-- pages/index.vue -->
<template>
  <div class="menu-page">
    <GameBackground />

    <div class="container">
      <!-- Logo: Use existing LOGO.png asset OR GameHeader -->
      <div class="logo-container">
        <!-- Option 1: Image asset (current implementation) -->
        <img :src="`${baseUrl}assets/main-menu/LOGO.png`" alt="Logo" class="logo-image" />

        <!-- Option 2: GameHeader component (if no asset) -->
        <!-- <GameHeader color="gold" class="menu-logo">RIDDLE RUSH</GameHeader> -->
      </div>

      <!-- Menu Buttons: Stacked vertically, no coins/avatar -->
      <div class="menu-buttons">
        <GameButton variant="primary" size="lg" full-width @click="handlePlay"> PLAY </GameButton>

        <GameButton variant="secondary" size="lg" full-width @click="toggleMenu"> MENU </GameButton>

        <GameButton variant="warning" size="lg" full-width @click="wrappedGoToSettings">
          OPTIONS
        </GameButton>

        <GameButton variant="secondary" size="lg" full-width @click="wrappedGoToCredits">
          CREDITS
        </GameButton>
      </div>

      <!-- Menu Panel (toggleable) -->
      <transition name="menu-fade">
        <div v-if="showMenu" class="menu-panel">
          <GameButton variant="secondary" size="md" full-width @click="wrappedGoToLanguage">
            🌐 {{ $t('menu.language', 'Language') }}
          </GameButton>
          <GameButton variant="secondary" size="md" full-width @click="wrappedGoToSettings">
            ⚙️ {{ $t('menu.settings', 'Settings') }}
          </GameButton>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const { router, baseUrl, toast, t } = usePageSetup()
const { goToPlayers, goToSettings, goToCredits, goToLanguage } = useNavigation()

const showMenu = ref(false)
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handlePlay = () => {
  showMenu.value = false
  goToPlayers()
}

// ...rest of methods
</script>
```

### Page Transition Configuration

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage
        :transition="{
          name: 'page',
          mode: 'out-in',
        }"
      />
    </NuxtLayout>
    <GlobalLoading />
  </div>
</template>

<style>
/* Standard page transition matching navigation delay (300ms) */
.page-enter-active,
.page-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
```

## State of the Art

| Old Approach               | Current Approach         | When Changed | Impact                                          |
| -------------------------- | ------------------------ | ------------ | ----------------------------------------------- |
| Splash in app.vue          | Dedicated splash page    | Vue 3 era    | Better SEO, clearer routing, easier testing     |
| JavaScript animation loops | CSS transitions          | 2015+        | Better performance, less code, GPU acceleration |
| Inline transition timing   | CSS variables            | Modern CSS   | Centralized timing, easier maintenance          |
| Router.push() only         | useNavigation composable | Nuxt 3+      | Type safety, loading states, debouncing         |

**Deprecated/outdated:**

- Vue 2 transition components: Now use `<Transition>` (capital T) in Vue 3
- Page middleware for splash: Now use dedicated route + auto-navigation
- Vuex for loading state: Project uses Pinia (useLoadingStore)

## Open Questions

No critical open questions. Implementation path is clear with existing infrastructure.

Minor considerations:

1. **Splash route strategy:** Should splash be `/splash` or `/` with redirect logic?
   - What we know: Current `/` is main menu, works well
   - What's unclear: Whether splash should replace `/` or be separate
   - Recommendation: Make splash a separate `/splash` route, set as PWA start_url

2. **Skip splash on repeat visits:** Should we persist "seen splash" flag?
   - What we know: Typical app pattern is show once
   - What's unclear: Product decision - always show or first-time only?
   - Recommendation: Implement tap-to-skip, defer persistence to future enhancement

## Sources

### Primary (HIGH confidence)

- Project codebase analysis - apps/game/components/game/GameHeader.vue
- Project codebase analysis - apps/game/components/GlobalLoading.vue
- Project codebase analysis - apps/game/composables/useNavigation.ts
- Project codebase analysis - apps/game/assets/scss/design-system.scss
- Project codebase analysis - apps/game/assets/scss/effects/\_text-3d.scss
- Project mockups - docs/mockups/Splash screen.png
- Project mockups - docs/mockups/start.png
- Nuxt 4.2.2 package.json configuration

### Secondary (MEDIUM confidence)

- Nuxt 4 documentation (implied from v4.2.2 usage) - page transitions, file-based routing
- Vue 3 documentation (implied from v3.5.26 usage) - Composition API, lifecycle hooks

### Tertiary (LOW confidence)

- None - all findings based on direct codebase analysis

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All dependencies already in project, versions confirmed
- Architecture: HIGH - Patterns verified in existing codebase, components tested
- Pitfalls: HIGH - Based on Vue/Nuxt best practices and common SPA issues

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable domain, Nuxt 4 is current major version)
