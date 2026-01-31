# CSS Architecture for Game-Style UI Redesign

**Project:** Riddle Rush - CSS/Visual Redesign Milestone
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

This research outlines the CSS architecture strategy for redesigning Riddle Rush's 10 pages to match game-style mockups with a consistent visual language (blue gradient backgrounds, orange/gold panel borders, green/blue/orange buttons, yellow display text). The project already has a foundation (`design-system.scss` with CSS custom properties) and must scale a fixed-resolution mockup (1080x1920) to responsive viewports while maintaining reusable game UI components.

**Key architectural decision:** Extend the existing SCSS design system with game-specific design tokens, create a library of reusable game UI components in `components/Game/`, and use viewport-based scaling with CSS custom properties for responsive adaptation.

---

## Recommended Architecture

### High-Level Structure

```
apps/game/
├── assets/scss/
│   ├── design-system.scss          # ✅ Existing foundation
│   ├── tokens/
│   │   ├── _game-colors.scss       # NEW: Game-specific color palette
│   │   ├── _game-typography.scss   # NEW: Display fonts, text shadows
│   │   ├── _game-effects.scss      # NEW: Borders, glows, shadows
│   │   └── _game-layout.scss       # NEW: Panel sizing, spacing scales
│   ├── mixins/
│   │   ├── _game-panel.scss        # NEW: Reusable panel styles
│   │   ├── _game-button.scss       # NEW: Button variant generator
│   │   ├── _game-scaling.scss      # NEW: Viewport scaling utilities
│   │   └── _responsive.scss        # Enhanced: Game-specific breakpoints
│   └── utilities/
│       ├── _game-animations.scss   # NEW: Pulse, glow, bounce effects
│       └── _game-backgrounds.scss  # NEW: Gradient backgrounds
├── components/
│   ├── Base/                       # ✅ Existing generic components
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   └── ImageButton.vue
│   └── Game/                       # NEW: Game-specific UI library
│       ├── GamePanel.vue           # Orange/gold bordered panels
│       ├── GameButton.vue          # Green/blue/orange action buttons
│       ├── GameDisplay.vue         # Yellow text displays (scores, timers)
│       ├── GameHeader.vue          # Page title with decorative borders
│       ├── GameBackground.vue      # Blue gradient container
│       ├── GameModal.vue           # Styled modal overlays
│       └── GameScrollList.vue      # Scrollable player/leaderboard lists
└── pages/                          # ✅ Existing 10 pages to redesign
    ├── index.vue                   # Main menu
    ├── players.vue
    ├── round-start.vue
    ├── language.vue
    ├── settings.vue
    ├── leaderboard.vue
    └── ...
```

---

## Design Token Strategy

### Extension Approach (Not Replacement)

**Preserve existing tokens in `design-system.scss`:**

- Keep `$colors`, `$gradients`, `$spacing`, `$font-sizes`, `$shadows` maps
- Keep existing CSS custom properties (`:root` variables)
- Keep existing mixins (`@mixin gradient`, `@function color()`, etc.)

**Add game-specific tokens in new `tokens/` directory:**

#### 1. Game Colors (`tokens/_game-colors.scss`)

```scss
// Game-specific color extensions
$game-colors: (
  // Panel borders (orange/gold theme from mockups)
  'panel-border-primary': #ffaa00,
  'panel-border-secondary': #ff8800,
  'panel-border-glow': rgba(255, 170, 0, 0.6),
  // Button colors (green/blue/orange from mockups)
  'btn-success': #7ed321,
  // Green primary action
  'btn-success-dark': #5fc423,
  'btn-info': #0ea5ff,
  // Blue secondary action
  'btn-info-dark': #0a7bda,
  'btn-warning': #ffaa00,
  // Orange accent
  'btn-warning-dark': #ff8800,

  // Display text (yellow from mockups)
  'display-text': #ffd54f,
  'display-text-shadow': rgba(255, 170, 0, 0.8),
  // Background gradients (blue theme from mockups)
  'bg-game-start': #1cc6ff,
  'bg-game-mid': #0b7ad6,
  'bg-game-end': #0a4cc7,

  // Panel backgrounds (warm cream/white)
  'panel-bg-start': rgba(255, 255, 255, 0.96),
  'panel-bg-end': rgba(255, 241, 211, 0.96)
);

// Merge with existing color system
@each $name, $value in $game-colors {
  $colors: map.merge(
    $colors,
    (
      $name: $value,
    )
  ) !global;
}
```

#### 2. Game Typography (`tokens/_game-typography.scss`)

```scss
$game-typography: (
  // Display text styles (yellow headings, scores)
  'display-lg': (
      'size': clamp(2.5rem, 6vw, 4rem),
      'weight': 900,
      'family': var(--font-display),
      'color': var(--color-display-text),
      'shadow': 0 4px 0 var(--color-display-text-shadow),
      'letter-spacing': 0.05em,
    ),
  'display-md': (
    'size': clamp(1.8rem, 4.5vw, 2.8rem),
    'weight': 800,
    'family': var(--font-display),
    'color': var(--color-display-text),
    'shadow': 0 3px 0 var(--color-display-text-shadow),
  ),
  // Game UI text (buttons, labels)
  'ui-lg': (
      'size': clamp(1.2rem, 3.2vw, 1.8rem),
      'weight': 700,
      'family': var(--font-display),
    ),
  'ui-md': (
    'size': clamp(1rem, 2.8vw, 1.4rem),
    'weight': 600,
    'family': var(--font-primary),
  )
);
```

#### 3. Game Effects (`tokens/_game-effects.scss`)

```scss
$game-effects: (
  // Panel borders (thick, glowing)
  'panel-border': 4px solid var(--color-panel-border-primary),
  'panel-border-glow': 0 0 20px var(--color-panel-border-glow),
  // Button 3D effect (offset shadow)
  'btn-3d-offset': 0 8px 0,
  'btn-3d-hover': 0 6px 0,
  'btn-3d-active': 0 2px 0,

  // Glow effects
  'glow-sm': 0 0 10px,
  'glow-md': 0 0 20px,
  'glow-lg': 0 0 30px,

  // Filter effects
  'drop-shadow-soft': drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)),
  'drop-shadow-strong': drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))
);
```

#### 4. Game Layout (`tokens/_game-layout.scss`)

```scss
$game-layout: (
  // Panel dimensions (based on mockup analysis)
  'panel-width-sm': clamp(280px, 85vw, 400px),
  'panel-width-md': clamp(350px, 90vw, 600px),
  'panel-width-lg': clamp(450px, 95vw, 800px),
  // Panel padding (internal spacing)
  'panel-padding-sm': clamp(1rem, 3vw, 1.5rem),
  'panel-padding-md': clamp(1.5rem, 4vw, 2.5rem),
  'panel-padding-lg': clamp(2rem, 5vw, 3.5rem),
  // Spacing between elements
  'game-gap-sm': clamp(0.75rem, 2vw, 1.25rem),
  'game-gap-md': clamp(1.25rem, 3.5vw, 2rem),
  'game-gap-lg': clamp(2rem, 5vw, 3rem)
);
```

**Why this approach:**

- Maintains backward compatibility with existing components
- Clearly separates generic design system from game-specific UI
- Allows gradual migration (pages can be redesigned one at a time)
- Design tokens are centralized, making global style changes easy

---

## Component Structure

### Component Boundaries and Responsibilities

#### Layer 1: Base Components (Existing - Generic)

**Location:** `components/Base/`
**Responsibility:** Generic, reusable UI primitives (not game-themed)
**Current components:** Button, Modal, ImageButton

**Keep these for:**

- Settings/config screens that should look "standard"
- Fallback components for non-game contexts
- Foundation for Game components to extend

**Do NOT modify visual style** - these should remain generic.

#### Layer 2: Game Components (NEW - Game-Themed)

**Location:** `components/Game/`
**Responsibility:** Reusable game-styled UI elements matching mockup visual language

##### GamePanel.vue

**Purpose:** Orange/gold bordered content containers (replaces `.card` styles)

**Props:**

```typescript
{
  variant?: 'primary' | 'secondary' | 'accent',  // Border color variation
  size?: 'sm' | 'md' | 'lg',                     // Panel dimensions
  glow?: boolean,                                // Add glow effect
  padding?: 'sm' | 'md' | 'lg',                  // Internal spacing
}
```

**Styling approach:**

- Use `@mixin game-panel($variant, $size)` for consistent borders/backgrounds
- Apply orange/gold border with glow effect
- Warm cream/white gradient background
- Responsive padding based on size prop

**Used in:** Player lists, category selection, settings panels, leaderboards

##### GameButton.vue

**Purpose:** Styled action buttons (green/blue/orange from mockups)

**Props:**

```typescript
{
  variant: 'success' | 'info' | 'warning' | 'danger',  // Color theme
  size?: 'sm' | 'md' | 'lg',                          // Button dimensions
  effect3d?: boolean,                                 // 3D shadow offset
  glow?: boolean,                                     // Glow on hover
  disabled?: boolean,
  loading?: boolean,
}
```

**Styling approach:**

- Extend Base/Button.vue behavior (reuse click handling, loading state)
- Override visual styles with game-specific gradients
- 3D shadow effect (offset shadow that compresses on click)
- Touch-friendly sizing (min 60px height on mobile)

**Used in:** All action buttons across game pages

##### GameDisplay.vue

**Purpose:** Yellow text displays for scores, timers, round numbers

**Props:**

```typescript
{
  value: string | number,         // Display value
  label?: string,                 // Optional label above value
  size?: 'sm' | 'md' | 'lg',     // Text size
  icon?: string,                 // Optional icon/emoji
  animate?: boolean,             // Pulse/glow animation
}
```

**Styling approach:**

- Yellow text with orange drop shadow for depth
- Display font (Baloo 2) for playful feel
- Optional pulse animation for dynamic values (timer countdown)

**Used in:** Score displays, timers, round counters, coin counts

##### GameHeader.vue

**Purpose:** Page titles with decorative styling

**Props:**

```typescript
{
  title: string,
  subtitle?: string,
  backButton?: boolean,  // Show back navigation
}
```

**Styling approach:**

- Large display text (yellow with shadow)
- Optional decorative border/icon
- Back button uses existing image assets

**Used in:** All page headers

##### GameBackground.vue

**Purpose:** Full-screen blue gradient background wrapper

**Props:**

```typescript
{
  variant?: 'default' | 'dark' | 'light',  // Gradient intensity
  image?: string,                          // Optional background image
}
```

**Styling approach:**

- Radial gradient blue background (matching mockups)
- Optional overlay image (like main menu BACKGROUND.png)
- Handles safe area insets for mobile

**Used in:** Root container for all game pages

##### GameModal.vue

**Purpose:** Styled modal overlays (pause, quit, error messages)

**Props:**

```typescript
{
  modelValue: boolean,
  title: string,
  size?: 'sm' | 'md' | 'lg',
  persistent?: boolean,
  showClose?: boolean,
}
```

**Styling approach:**

- Extends Base/Modal.vue
- GamePanel-styled container
- Backdrop blur + darkening
- Yellow title text

**Used in:** Pause screen, quit confirmation, error dialogs

##### GameScrollList.vue

**Purpose:** Scrollable lists with custom scrollbar (player/leaderboard lists)

**Props:**

```typescript
{
  items: Array<any>,
  itemKey: string,
  maxHeight?: string,
}
```

**Styling approach:**

- Custom scrollbar styled to match mockup (orange track)
- Item rows with hover states
- Compact mobile layout

**Used in:** Player selection, leaderboard rankings

### Component Communication Patterns

**Parent → Child:** Props (reactive data)
**Child → Parent:** Events (`@update:modelValue`, `@click`, etc.)
**Shared State:** Pinia stores (existing game/settings stores)
**Styling:** Scoped styles + design tokens (no global overrides)

---

## CSS Organization

### File Structure and Import Order

#### Main Entry (`design-system.scss`)

```scss
// 1. SCSS utilities (must be first for @use in other files)
@use 'sass:map';
@use 'sass:math';

// 2. Existing foundation (preserve)
// ... existing variables, mixins, functions ...

// 3. NEW: Game-specific tokens
@import 'tokens/game-colors';
@import 'tokens/game-typography';
@import 'tokens/game-effects';
@import 'tokens/game-layout';

// 4. NEW: Game-specific mixins
@import 'mixins/game-panel';
@import 'mixins/game-button';
@import 'mixins/game-scaling';
@import 'mixins/responsive'; // Enhanced

// 5. Existing global styles (preserve)
// ... existing resets, base styles ...

// 6. NEW: Game utilities
@import 'utilities/game-animations';
@import 'utilities/game-backgrounds';

// 7. Existing utility classes (preserve)
// ... existing utilities ...
```

### Mixin Library

#### `mixins/_game-panel.scss`

```scss
@mixin game-panel($variant: 'primary', $size: 'md') {
  $border-color: map.get($game-colors, 'panel-border-#{$variant}');
  $padding: map.get($game-layout, 'panel-padding-#{$size}');
  $width: map.get($game-layout, 'panel-width-#{$size}');

  background: linear-gradient(
    180deg,
    var(--color-panel-bg-start) 0%,
    var(--color-panel-bg-end) 100%
  );
  border: var(--game-panel-border);
  border-radius: var(--radius-xl);
  padding: $padding;
  width: $width;
  max-width: 100%;
  box-shadow: var(--shadow-lg), var(--game-panel-border-glow);
}
```

#### `mixins/_game-button.scss`

```scss
@mixin game-button($variant: 'success', $size: 'md') {
  @include touch-target(60px); // Existing mixin

  $bg-start: map.get($game-colors, 'btn-#{$variant}');
  $bg-end: map.get($game-colors, 'btn-#{$variant}-dark');

  background: linear-gradient(180deg, $bg-start 0%, $bg-end 100%);
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-lg);
  box-shadow:
    var(--game-btn-3d-offset) $bg-end,
    var(--shadow-lg);

  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  transition: all var(--transition-base);

  &:active:not(:disabled) {
    transform: translateY(6px);
    box-shadow: var(--game-btn-3d-active) $bg-end;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

#### `mixins/_game-scaling.scss`

**Critical for responsive scaling from 1080x1920 mockup:**

```scss
// Viewport-based scaling mixin
@mixin scale-from-mockup($mockup-width: 1080, $mockup-height: 1920) {
  // Calculate scale factor based on viewport
  --scale-x: calc(100vw / #{$mockup-width});
  --scale-y: calc(100vh / #{$mockup-height});

  // Use smaller scale to prevent overflow
  --scale: min(var(--scale-x), var(--scale-y));

  // Apply scaling while maintaining aspect ratio
  transform: scale(var(--scale));
  transform-origin: top center;
}

// Container for scaled content
@mixin scaled-container() {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;

  > * {
    @include scale-from-mockup();
  }
}

// Responsive breakpoints with mockup-aware scaling
@mixin mobile-game {
  @media (max-width: 768px) {
    // Adjust scale for mobile (smaller UI elements)
    --scale: calc(min(var(--scale-x), var(--scale-y)) * 0.95);
    @content;
  }
}

@mixin tablet-game {
  @media (min-width: 769px) and (max-width: 1024px) {
    @content;
  }
}

@mixin desktop-game {
  @media (min-width: 1025px) {
    // Cap maximum scale to prevent oversized UI
    --scale: min(var(--scale), 1.2);
    @content;
  }
}
```

**How to use in components:**

```scss
<style scoped>
.game-page {
  @include scaled-container();
  @include gradient('main');
}

.game-content {
  // This will scale from 1080x1920 mockup to current viewport
  @include scale-from-mockup();

  // Override scale on specific breakpoints if needed
  @include mobile-game {
    padding: var(--spacing-md);
  }
}
</style>
```

---

## Responsive Scaling Strategy

### Problem: Fixed 1080x1920 Mockup → Variable Viewports

**Mockup characteristics:**

- Fixed resolution: 1080px wide × 1920px tall (9:16 portrait ratio)
- Designed for mobile portrait orientation
- Absolute pixel positioning in design tool

**Target devices:**

- Mobile: 360px - 480px wide (portrait)
- Tablet: 768px - 1024px wide (portrait/landscape)
- Desktop: 1024px+ wide (landscape)

### Solution 1: Viewport Units + Clamping (Recommended)

**Approach:** Use CSS viewport units (`vw`, `vh`) with `clamp()` for fluid scaling

**Advantages:**

- Truly responsive (no JavaScript)
- Smooth scaling across all screen sizes
- Better performance (GPU-accelerated)
- Easier to maintain

**Implementation:**

```scss
// Convert mockup pixel values to viewport units
@function to-vw($px, $mockup-width: 1080) {
  @return calc($px / $mockup-width * 100vw);
}

@function to-vh($px, $mockup-height: 1920) {
  @return calc($px / $mockup-height * 100vh);
}

// Example: Element is 400px wide in mockup
.game-panel {
  width: clamp(280px, to-vw(400), 600px);
  //      ↑ min    ↑ ideal      ↑ max
}

// Example: Element is 120px tall in mockup
.game-header {
  height: clamp(80px, to-vh(120), 150px);
}
```

**When to use:**

- General layout (panel widths, spacing)
- Typography (font sizes)
- Icon/image dimensions

### Solution 2: CSS Transform Scaling (Alternative)

**Approach:** Scale entire page or sections using CSS `transform: scale()`

**Advantages:**

- Perfect 1:1 match to mockup
- Simple implementation
- Good for fixed aspect ratio content

**Disadvantages:**

- Can cause blurry text at non-integer scales
- Complicates hit targets (click areas)
- Requires container sizing math

**Implementation:**

```scss
.game-page {
  width: 1080px; // Mockup width
  height: 1920px; // Mockup height
  transform-origin: top center;
  transform: scale(var(--scale));

  @media (max-width: 1080px) {
    --scale: calc(100vw / 1080);
  }

  @media (min-height: 1920px) {
    --scale: calc(100vh / 1920);
  }
}
```

**When to use:**

- Complex illustrations/graphics
- Image-heavy pages (main menu with background.png)
- Temporary solution during initial implementation

### Solution 3: Hybrid Approach (Recommended for This Project)

**Combine both strategies:**

1. **Page background/container:** Use `GameBackground.vue` with fixed image scaling
2. **Interactive elements (buttons, panels):** Use viewport units + clamping
3. **Text/scores:** Use `clamp()` for fluid typography
4. **Decorative images:** Use CSS `transform: scale()` with aspect ratio preservation

**Example page structure:**

```vue
<template>
  <GameBackground image="BACKGROUND.png">
    <!-- Container uses viewport units -->
    <div class="game-content">
      <!-- Panels use clamp() for responsive sizing -->
      <GamePanel size="md">
        <!-- Text uses clamp() for fluid scaling -->
        <GameDisplay label="Score" :value="score" size="lg" />
        <!-- Buttons use touch-friendly sizing -->
        <GameButton variant="success">Play</GameButton>
      </GamePanel>
    </div>
  </GameBackground>
</template>

<style scoped>
.game-content {
  // Viewport-based layout
  padding: clamp(1rem, 3vh, 3rem);
  gap: clamp(1rem, 2vh, 2rem);

  // Max width prevents oversized UI on large screens
  max-width: min(1080px, 95vw);
  margin: 0 auto;
}
</style>
```

### Breakpoint Strategy

**Mobile-first approach with game-specific breakpoints:**

```scss
// Design-system.scss
$breakpoints: (
  'mobile-sm': 360px,
  // Small phones (iPhone SE)
  'mobile-md': 390px,
  // Standard phones (iPhone 12)
  'mobile-lg': 480px,
  // Large phones / small tablets
  'tablet': 768px,
  // iPad portrait
  'tablet-lg': 1024px,
  // iPad landscape
  'desktop': 1280px,
  // Desktop minimum
  'desktop-lg': 1920px, // Large desktop
);

@mixin breakpoint($name) {
  @media (min-width: map.get($breakpoints, $name)) {
    @content;
  }
}
```

**Per-page responsive adjustments:**

```scss
// Mobile (360px - 767px)
@include mobile-game {
  .game-panel {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .game-button {
    min-height: 56px; // Larger tap targets
  }
}

// Tablet (768px - 1024px)
@include tablet-game {
  .game-panel {
    padding: var(--spacing-md);
  }
}

// Desktop (1025px+)
@include desktop-game {
  .game-panel {
    max-width: 800px; // Prevent overly wide panels
  }
}
```

---

## Shared Styles vs Page-Specific Overrides

### Global Styles (in `design-system.scss`)

**What belongs here:**

- Design tokens (colors, typography scales, spacing)
- Mixins and functions
- Utility classes (`.flex`, `.grid`, `.animate-*`)
- Base element resets (`html`, `body`, `*`)
- CSS custom properties (`:root` variables)

**What does NOT belong here:**

- Component-specific styles (keep in `.vue` files)
- Page layouts (keep in page `.vue` files)
- One-off overrides (keep scoped)

### Scoped Component Styles (in `.vue` files)

**Best practices for Vue 3 scoped styles:**

```vue
<style scoped>
/* ✅ GOOD: Use design tokens */
.game-panel {
  background: var(--color-panel-bg-start);
  border: var(--game-panel-border);
  padding: var(--spacing-lg);
}

/* ✅ GOOD: Use mixins */
.game-button {
  @include game-button('success', 'lg');
}

/* ✅ GOOD: Local overrides for this component only */
.player-list-item {
  border-bottom: 1px solid var(--color-gray-light);
}

/* ❌ BAD: Hardcoded values */
.bad-example {
  background: #ffaa00;  /* Use var(--color-panel-border-primary) */
  padding: 20px;        /* Use var(--spacing-md) */
}

/* ❌ BAD: Deep selectors for child components */
.bad-example :deep(.game-button) {
  /* Instead, use props to customize GameButton */
}
```

**When to use `:deep()`:**

- Styling third-party library components (e.g., i18n plugin)
- Overriding Nuxt-generated markup (rare)
- **Avoid for your own components** - use props instead

**When to use `:global()`:**

- Animation keyframes that need to be shared
- Utility classes that apply across multiple components
- **Generally avoid** - prefer importing from `design-system.scss`

### Page-Specific Styles

**Pattern for pages:**

```vue
<!-- pages/leaderboard.vue -->
<template>
  <GameBackground>
    <div class="leaderboard-page">
      <GameHeader title="Leaderboard" :back-button="true" />
      <GamePanel class="leaderboard-panel">
        <GameScrollList :items="rankings" />
      </GamePanel>
    </div>
  </GameBackground>
</template>

<style scoped>
/* Page-specific layout only */
.leaderboard-page {
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  align-items: center;
  min-height: 100vh;
}

/* Page-specific overrides (minimal) */
.leaderboard-panel {
  max-height: 70vh; /* Specific to this page */
}

/* Mobile adjustments for this page */
@include mobile-game {
  .leaderboard-page {
    padding: var(--spacing-lg) var(--spacing-md);
    gap: var(--spacing-md);
  }
}
</style>
```

**Organization principle:** Keep page styles minimal - most styling should come from reusable Game components.

---

## Build Order and Implementation Phases

### Phase 1: Foundation (Design Tokens + Mixins)

**Estimated effort:** 2-3 days
**Priority:** CRITICAL - Must complete before component work

**Tasks:**

1. Create `assets/scss/tokens/` directory
2. Write `_game-colors.scss` (extract colors from mockups)
3. Write `_game-typography.scss` (define display text styles)
4. Write `_game-effects.scss` (borders, shadows, glows)
5. Write `_game-layout.scss` (panel dimensions, spacing)
6. Create `assets/scss/mixins/` directory
7. Write `_game-panel.scss` mixin
8. Write `_game-button.scss` mixin
9. Write `_game-scaling.scss` mixin (viewport scaling utilities)
10. Update `design-system.scss` to import new files
11. Test token imports in a single component

**Deliverables:**

- [ ] All token files created and imported
- [ ] Mixins tested in isolation
- [ ] CSS custom properties available in `:root`
- [ ] No breaking changes to existing components

**Validation:**

- Run `pnpm run typecheck` (no errors)
- Build succeeds (`pnpm run generate`)
- Existing pages still render correctly

### Phase 2: Core Game Components

**Estimated effort:** 4-5 days
**Priority:** HIGH - Required for all pages

**Tasks (in order):**

1. Create `components/Game/` directory
2. Build `GameBackground.vue` (simplest - just gradient wrapper)
3. Build `GamePanel.vue` (uses `@mixin game-panel`)
4. Build `GameButton.vue` (extends Base/Button, uses `@mixin game-button`)
5. Build `GameDisplay.vue` (yellow text display)
6. Build `GameHeader.vue` (page title component)
7. Build `GameModal.vue` (extends Base/Modal)
8. Build `GameScrollList.vue` (scrollable list with custom scrollbar)
9. Write unit tests for each component (`tests/unit/components/Game/`)
10. Create Storybook/example page to preview all components

**Deliverables:**

- [ ] 7 Game components created
- [ ] All components use design tokens (no hardcoded values)
- [ ] Props interface defined for each component
- [ ] Basic unit tests pass
- [ ] Visual regression test baseline captured

**Validation:**

- Components render correctly in isolation
- Props control styling as expected
- Responsive behavior works (test on mobile/tablet/desktop)
- No console errors or warnings

### Phase 3: Page Migrations (Low-Risk First)

**Estimated effort:** 6-8 days (1 day per page average)
**Priority:** MEDIUM - Gradual rollout

**Order (from simplest to most complex):**

1. **Language page** (`pages/language.vue`)
   - Simple layout (2 flag buttons)
   - Low user traffic
   - Good learning opportunity

2. **Credits page** (`pages/credits.vue`)
   - Static content
   - Simple layout

3. **Settings page** (`pages/settings.vue`)
   - List of toggles/options
   - Uses GamePanel and GameButton

4. **Main menu** (`pages/index.vue`)
   - Image-heavy (uses existing assets)
   - Critical path - do after gaining confidence

5. **Players page** (`pages/players.vue`)
   - Dynamic list (uses GameScrollList)
   - Add/remove player interactions

6. **Leaderboard page** (`pages/leaderboard.vue`)
   - Similar to players page
   - Sorted list display

7. **Round start page** (`pages/round-start.vue`)
   - Fortune wheel animation
   - Complex interactions

**Per-page migration checklist:**

- [ ] Replace existing page structure with GameBackground wrapper
- [ ] Replace generic components with Game components
- [ ] Replace hardcoded colors with design tokens
- [ ] Add responsive breakpoints
- [ ] Update E2E tests (use `data-testid` attributes)
- [ ] Visual QA on mobile/tablet/desktop
- [ ] Commit with conventional commit message

**Validation per page:**

- E2E tests pass (`pnpm run test:e2e`)
- Visual regression tests pass (baseline vs new)
- No accessibility regressions (check contrast ratios)
- Performance metrics maintained (Lighthouse score)

### Phase 4: Polish and Optimization

**Estimated effort:** 2-3 days
**Priority:** LOW - After all pages migrated

**Tasks:**

1. Add micro-animations (pulse, glow, bounce)
2. Optimize image assets (compress PNGs)
3. Add loading skeletons for async content
4. Fine-tune responsive breakpoints
5. Accessibility audit (ARIA labels, keyboard navigation)
6. Performance optimization (lazy load images, code splitting)
7. Cross-browser testing (Chrome, Firefox, Safari)
8. Device testing (iOS, Android, various screen sizes)

**Deliverables:**

- [ ] Animation library complete (`utilities/_game-animations.scss`)
- [ ] All images optimized (WebP/AVIF formats)
- [ ] Accessibility score > 95 (Lighthouse)
- [ ] Performance score > 90 (Lighthouse)
- [ ] Cross-browser compatibility verified

---

## Anti-Patterns to Avoid

### 1. Hardcoded Values in Components

**❌ BAD:**

```vue
<style scoped>
.game-panel {
  background: #ffaa00;
  padding: 20px;
  border-radius: 18px;
}
</style>
```

**✅ GOOD:**

```vue
<style scoped>
.game-panel {
  @include game-panel('primary', 'md');
  /* All values come from design tokens */
}
</style>
```

### 2. Using `:deep()` to Style Child Components

**❌ BAD:**

```vue
<style scoped>
.parent :deep(.game-button) {
  background: red; /* Breaks component encapsulation */
}
</style>
```

**✅ GOOD:**

```vue
<template>
  <GameButton variant="danger" />
  <!-- Use props to customize -->
</template>
```

### 3. Duplicating Styles Across Pages

**❌ BAD:**

```vue
<!-- pages/players.vue -->
<style scoped>
.player-list {
  background: linear-gradient(...);
  border: 4px solid #ffaa00;
  /* ... 50 lines of styles ... */
}
</style>

<!-- pages/leaderboard.vue -->
<style scoped>
.leaderboard-list {
  background: linear-gradient(...);
  border: 4px solid #ffaa00;
  /* ... same 50 lines ... */
}
</style>
```

**✅ GOOD:**

```vue
<!-- Both pages use GamePanel component -->
<template>
  <GamePanel size="lg">
    <GameScrollList :items="items" />
  </GamePanel>
</template>
```

### 4. Fixed Pixel Dimensions Without Responsive Fallbacks

**❌ BAD:**

```scss
.game-panel {
  width: 800px; /* Breaks on mobile */
  height: 600px; /* Breaks on small screens */
}
```

**✅ GOOD:**

```scss
.game-panel {
  width: clamp(280px, 90vw, 800px);
  min-height: clamp(400px, 60vh, 600px);
}
```

### 5. Overriding Global Styles from Page Components

**❌ BAD:**

```vue
<style scoped>
:global(body) {
  background: red; /* Breaks other pages */
}

:global(.btn) {
  padding: 50px; /* Breaks all buttons */
}
</style>
```

**✅ GOOD:**

```vue
<style scoped>
/* Keep styles scoped to this page */
.page-specific-element {
  /* Local styles only */
}
</style>
```

### 6. Mixing Design Systems

**❌ BAD:**

```vue
<template>
  <div class="page">
    <BaseButton />
    <!-- Generic design system -->
    <GameButton />
    <!-- Game design system -->
    <button class="btn">
      <!-- design-system.scss utility -->
      <!-- Inconsistent visual language -->
    </button>
  </div>
</template>
```

**✅ GOOD:**

```vue
<template>
  <GameBackground>
    <!-- Use Game components consistently throughout -->
    <GameButton variant="success" />
    <GameButton variant="info" />
  </GameBackground>
</template>
```

---

## Known Risks and Mitigations

### Risk 1: Existing Pages Break During Migration

**Likelihood:** MEDIUM
**Impact:** HIGH

**Mitigation:**

- Migrate pages one at a time (not all at once)
- Use feature flags to toggle new UI (`useFeatureFlags()` composable)
- Keep existing components intact (don't modify Base/ components)
- Comprehensive E2E test coverage before starting

**Detection:**

- E2E tests fail
- Visual regression tests show unintended changes

**Rollback plan:**

- Git revert to previous commit
- Feature flag to disable new UI

### Risk 2: Performance Regression (Large CSS Bundle)

**Likelihood:** LOW
**Impact:** MEDIUM

**Mitigation:**

- Use CSS code splitting (enabled in `nuxt.config.ts`)
- Lazy load game components where possible
- Monitor bundle size (`pnpm run analyze`)
- PurgeCSS in production (remove unused styles)

**Detection:**

- Bundle size increases > 20%
- Lighthouse performance score drops
- First Contentful Paint (FCP) increases

**Rollback plan:**

- Optimize critical CSS
- Split game components into separate chunk
- Defer non-critical styles

### Risk 3: Responsive Scaling Doesn't Work on All Devices

**Likelihood:** MEDIUM
**Impact:** MEDIUM

**Mitigation:**

- Test on real devices early (not just Chrome DevTools)
- Use BrowserStack for cross-device testing
- Implement both viewport units AND transform scaling (hybrid approach)
- Add fallback styles for older browsers

**Detection:**

- UI overflows viewport
- Text too small to read
- Buttons too small to tap (< 44px)

**Rollback plan:**

- Use simpler responsive approach (media queries only)
- Increase minimum sizes for touch targets

### Risk 4: Design Token Changes Require Global Refactor

**Likelihood:** MEDIUM
**Impact:** LOW

**Mitigation:**

- Use CSS custom properties (can change at runtime)
- Keep token files separate from implementation
- Document token usage in component props
- Version design tokens (v1, v2) if major changes needed

**Detection:**

- Designer requests color palette change
- Need to support dark mode (future)

**Rollback plan:**

- Create new token file (v2) alongside existing
- Gradual migration to new tokens

---

## Sources

### Design System Research

- [Nuxt UI Design System](https://ui.nuxt.com/docs/getting-started/theme/design-system)
- [Vue, Nuxt & Vite Status in 2026](https://fivejars.com/insights/vue-nuxt-vite-status-for-2026-risks-priorities-architecture-updates/)
- [How to Customize the Nuxt UI Design System](https://vueschool.io/articles/vuejs-tutorials/how-to-customize-the-nuxt-ui-design-system/)
- [Design Token-Based UI Architecture](https://martinfowler.com/articles/design-token-based-ui-architecture.html)
- [What Are Design Tokens? | CSS-Tricks](https://css-tricks.com/what-are-design-tokens/)

### Responsive Scaling Strategies

- [What Is VH In CSS? 2026 "Viewport Height" Guide](https://elementor.com/blog/vh/)
- [Understanding Viewport Settings for Responsive Web Design](https://www.browserstack.com/guide/viewport-responsive)
- [CSS Viewport Width: Simplify Responsive Web Design](https://www.dhiwise.com/blog/design-converter/css-viewport-width-explained-with-practical-examples)
- [Mastering CSS Viewport Units](https://dev.to/mechcloud_academy/mastering-css-viewport-units-a-developers-guide-to-responsive-design-49f8)
- [Scaling your Mobile Game to Any Device Size](https://medium.com/@martindrapeau/scaling-your-mobile-game-to-any-device-size-4d12dd79cad6)

### Vue Component Architecture

- [Mastering Vue Components Folder Structure for Scalable Apps](https://vueschool.io/articles/vuejs-tutorials/structuring-vue-components/)
- [How to Structure a Large Scale Vue.js Application](https://vueschool.io/articles/vuejs-tutorials/how-to-structure-a-large-scale-vue-js-application/)
- [The Perfect Folder Structure for Scalable Frontend | Feature-Sliced Design](https://feature-sliced.design/blog/frontend-folder-structure)
- [Vue.js with TypeScript: Best Practices for Large-Scale Projects](https://medium.com/@nakiboddin.saiyad/vue-js-with-typescript-best-practices-for-large-scale-projects-c3529e21969b)

### Vue CSS Best Practices

- [Mastering Scoped CSS in Vue](https://dev.to/dharamgfx/mastering-scoped-css-in-vue-deep-selectors-slotted-content-global-styles-and-more-16p6)
- [Vue3: How to style components (global, scoped and modules)](https://dev.to/sucodelarangela/vue3-how-to-style-components-global-scoped-and-modules-4230)
- [SFC CSS Features | Vue.js](https://vuejs.org/api/sfc-css-features.html)
- [Styling Vue components with CSS - MDN](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Vue_styling)

---

## Appendix: Quick Reference

### Design Token Naming Convention

```
--color-{category}-{variant}
  ↑      ↑          ↑
  |      |          └─ primary, secondary, light, dark, etc.
  |      └─ panel-border, btn-success, display-text, etc.
  └─ Always prefix with "color"

--spacing-{size}
  ↑        ↑
  |        └─ xs, sm, md, lg, xl, 2xl, 3xl
  └─ Always prefix with "spacing"

--font-size-{size}
  ↑          ↑
  |          └─ xs, sm, base, lg, xl, 2xl, 3xl, 4xl
  └─ Always prefix with "font-size"

--game-{component}-{property}
  ↑     ↑          ↑
  |     |          └─ border, glow, shadow, etc.
  |     └─ panel, button, display, etc.
  └─ Game-specific prefix
```

### Component Selection Guide

| Need                    | Use Component    | Props Example                         |
| ----------------------- | ---------------- | ------------------------------------- |
| Content container       | `GamePanel`      | `variant="primary" size="md"`         |
| Action button           | `GameButton`     | `variant="success" size="lg"`         |
| Score/timer display     | `GameDisplay`    | `value="250" label="Score" size="lg"` |
| Page title              | `GameHeader`     | `title="Players" :back-button="true"` |
| Full-page background    | `GameBackground` | `image="BACKGROUND.png"`              |
| Popup dialog            | `GameModal`      | `v-model="showModal" title="Paused"`  |
| Player/leaderboard list | `GameScrollList` | `:items="players" itemKey="id"`       |

### Mixin Usage Examples

```scss
// Panel styling
.my-panel {
  @include game-panel('primary', 'lg');
}

// Button styling
.my-button {
  @include game-button('success', 'md');
}

// Responsive scaling
.my-page {
  @include scaled-container();
}

// Mobile-specific adjustments
@include mobile-game {
  .my-element {
    font-size: var(--font-size-sm);
  }
}
```

### Common Patterns

**Full-page game layout:**

```vue
<template>
  <GameBackground>
    <div class="page-container">
      <GameHeader title="Page Title" :back-button="true" />
      <GamePanel class="main-content">
        <!-- Page content -->
      </GamePanel>
    </div>
  </GameBackground>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  align-items: center;
}

@include mobile-game {
  .page-container {
    padding: var(--spacing-lg) var(--spacing-md);
    gap: var(--spacing-md);
  }
}
</style>
```
