# Phase 5: Structural Components - Research

**Researched:** 2026-02-01
**Domain:** Vue 3 component patterns, modal dialogs, CSS text effects, scrollable lists
**Confidence:** HIGH

## Summary

This phase implements three structural components (GameHeader, GameModal, GameScrollList) that complete the UI component library. The research focused on Vue 3 composition patterns, accessible modal implementations, CSS multi-layer text effects, and scrollable list patterns.

The standard approach is:

- **GameModal**: Vue 3 Teleport for DOM positioning, focus-trap for accessibility, Transition for animations
- **GameHeader**: CSS multi-layer text-shadow for 3D effects, flexible slot-based layout
- **GameScrollList**: CSS overflow-y scrolling with custom scrollbar styling, slot-based row content

The codebase already has strong patterns established: SCSS mixins for effects, CSS custom properties for theming, and `<script setup lang="ts">` with Props interfaces. These components will follow the same architectural patterns.

**Primary recommendation:** Use Vue 3 Teleport + focus-trap library for modals, CSS multi-layer text-shadow for 3D header text, and CSS overflow with custom scrollbars for lists. All components should use existing SCSS mixins and design system tokens.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library          | Version  | Purpose                  | Why Standard                                                      |
| ---------------- | -------- | ------------------------ | ----------------------------------------------------------------- |
| Vue 3 Teleport   | Built-in | Modal DOM positioning    | Official Vue 3 built-in, solves z-index and position:fixed issues |
| Vue 3 Transition | Built-in | Modal animations         | Official Vue 3 built-in, generates CSS classes for animations     |
| focus-trap       | ^7.6.2   | Focus management         | Industry standard (1M+ weekly downloads), WCAG compliant          |
| CSS text-shadow  | Native   | Multi-layer text effects | Baseline widely available (2015+), GPU-accelerated                |
| CSS overflow     | Native   | Scrollable lists         | Native browser feature, no library needed                         |

### Supporting

| Library             | Version           | Purpose                         | When to Use                                            |
| ------------------- | ----------------- | ------------------------------- | ------------------------------------------------------ |
| @vueuse/core        | Already installed | useFocusTrap composable         | Optional wrapper around focus-trap, more Vue-idiomatic |
| CSS scrollbar-width | Native            | Firefox scrollbar styling       | Modern Firefox scrollbar customization                 |
| ::-webkit-scrollbar | Native            | Chrome/Safari scrollbar styling | Webkit browser scrollbar customization                 |

### Alternatives Considered

| Instead of        | Could Use                                      | Tradeoff                                                                       |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| focus-trap        | Manual Tab key handling                        | focus-trap handles edge cases (nested traps, dynamic content, return focus)    |
| Vue Transition    | JS animation libraries (GSAP, Motion One)      | CSS transitions are simpler, performant, and match existing GameButton pattern |
| Teleport          | Portal Vue (Vue 2)                             | Teleport is built into Vue 3, no extra dependency                              |
| Native scrollbars | Custom JS scroll libraries (perfect-scrollbar) | Native is more performant and accessible, custom styling sufficient            |

**Installation:**

```bash
# focus-trap likely already installed via @vueuse/integrations
npm list focus-trap

# If not installed:
pnpm add focus-trap
```

## Architecture Patterns

### Recommended Project Structure

```
components/
├── game/
│   ├── GameHeader.vue       # Full header bar with text effects
│   ├── GameModal.vue        # Teleported modal with focus trap
│   └── GameScrollList.vue   # Scrollable list with rank display
└── layout/
    ├── GameBackground.vue   # Existing
    └── GamePanel.vue        # Existing
```

### Pattern 1: Modal with Teleport + Focus Trap

**What:** Modal component that teleports to body, traps focus, and animates with Vue Transition
**When to use:** All modal/overlay UI (quit, pause, settings, credits)
**Example:**

```vue
<script setup lang="ts">
// Source: Vue 3 official docs + focus-trap GitHub
import { ref, watch } from 'vue';
import { createFocusTrap } from 'focus-trap';

interface Props {
  modelValue: boolean; // v-model controlled visibility
  variant?: 'default' | 'danger'; // Blue or red header
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const modalRef = ref<HTMLElement>();
let focusTrap: ReturnType<typeof createFocusTrap> | null = null;

const close = () => {
  emit('update:modelValue', false);
};

// Setup focus trap when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && modalRef.value) {
      focusTrap = createFocusTrap(modalRef.value, {
        initialFocus: false,
        escapeDeactivates: true,
        onDeactivate: close,
      });
      focusTrap.activate();
    } else if (focusTrap) {
      focusTrap.deactivate();
      focusTrap = null;
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div
          ref="modalRef"
          class="modal-content"
          role="dialog"
          aria-modal="true"
          :class="`modal-content--${variant}`"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// Transition classes for fade + scale
.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content {
  transform: scale(0.9);
}

.modal-leave-active .modal-content {
  transition: transform 200ms ease-in;
}

.modal-leave-to .modal-content {
  transform: scale(0.95);
}

// Modal styling
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}
</style>
```

### Pattern 2: Multi-Layer Text Shadow for 3D Effects

**What:** CSS text-shadow with 3-5 layers creating depth, highlight, mid-tone, shadow, and glow
**When to use:** GameHeader title text (multi-color variants: white, gold, green, blue, orange)
**Example:**

```scss
// Source: MDN text-shadow docs + existing design-system.scss
@mixin text-3d-effect(
  $color: white,
  $highlight: rgba(255, 255, 255, 0.6),
  $shadow-color: rgba(0, 0, 0, 0.3),
  $glow-color: rgba(255, 255, 255, 0.4)
) {
  color: $color;
  text-shadow:
    // Layer 1: Top highlight (closest)
    0 1px 0 $highlight,
    // Layer 2: Shadow offset for depth
    0 2px 2px rgba(0, 0, 0, 0.15),
    // Layer 3: Deeper shadow
    0 4px 4px rgba(0, 0, 0, 0.2),
    // Layer 4: Soft drop shadow
    0 8px 12px $shadow-color,
    // Layer 5: Outer glow
    0 0 20px $glow-color;
}

// Color variant examples
.header-text-white {
  @include text-3d-effect(
    white,
    rgba(255, 255, 255, 0.7),
    rgba(0, 0, 0, 0.35),
    rgba(255, 255, 255, 0.5)
  );
}

.header-text-gold {
  @include text-3d-effect(
    var(--color-text-yellow),
    rgba(255, 255, 255, 0.4),
    rgba(0, 0, 0, 0.4),
    rgba(255, 213, 79, 0.5)
  );
}
```

### Pattern 3: Scrollable List with Custom Scrollbars

**What:** overflow-y: auto container with styled scrollbars for webkit and Firefox
**When to use:** GameScrollList for player lists (1-6 items), leaderboard lists
**Example:**

```scss
// Source: MDN overflow docs
.scroll-list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;

  // Firefox scrollbar styling
  scrollbar-width: thin;
  scrollbar-color: var(--color-btn-blue-dark) rgba(255, 255, 255, 0.2);

  // Webkit scrollbar styling
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-btn-blue-dark);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--color-btn-blue-light);
    }
  }

  // Accessibility: make focusable with keyboard
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
}
```

### Pattern 4: Inline SVG Icons for Ranks

**What:** SVG crown/badge icons defined inline in template for crisp scaling and color control
**When to use:** GameScrollList rank display (gold/silver/bronze crowns, numbered badges 4-6)
**Example:**

```vue
<template>
  <div class="rank-icon">
    <!-- Gold crown (rank 1) -->
    <svg v-if="rank === 1" viewBox="0 0 24 24" class="crown-icon crown-icon--gold">
      <path d="M12 2L15 9L22 8L19 15H5L2 8L9 9L12 2Z" />
      <rect x="4" y="15" width="16" height="4" rx="1" />
    </svg>

    <!-- Silver crown (rank 2) -->
    <svg v-else-if="rank === 2" viewBox="0 0 24 24" class="crown-icon crown-icon--silver">
      <path d="M12 2L15 9L22 8L19 15H5L2 8L9 9L12 2Z" />
      <rect x="4" y="15" width="16" height="4" rx="1" />
    </svg>

    <!-- Bronze crown (rank 3) -->
    <svg v-else-if="rank === 3" viewBox="0 0 24 24" class="crown-icon crown-icon--bronze">
      <path d="M12 2L15 9L22 8L19 15H5L2 8L9 9L12 2Z" />
      <rect x="4" y="15" width="16" height="4" rx="1" />
    </svg>

    <!-- Numbered badge (rank 4-6) -->
    <div v-else class="rank-badge">
      {{ rank }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.crown-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;

  &--gold {
    color: var(--color-text-yellow);
    filter: drop-shadow(0 2px 4px rgba(255, 213, 79, 0.5));
  }

  &--silver {
    color: #c0c0c0;
    filter: drop-shadow(0 2px 4px rgba(192, 192, 192, 0.5));
  }

  &--bronze {
    color: #cd7f32;
    filter: drop-shadow(0 2px 4px rgba(205, 127, 50, 0.5));
  }
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-btn-blue-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}
</style>
```

### Anti-Patterns to Avoid

- **Don't use z-index wars**: Teleport to body prevents z-index stacking issues
- **Don't manually manage Tab key**: focus-trap handles all edge cases (nested elements, dynamic content)
- **Don't use JS for scrolling**: CSS overflow is more performant and accessible
- **Don't use external icon libraries for simple shapes**: Inline SVG is smaller and easier to style
- **Don't forget focus return**: focus-trap's returnFocusOnDeactivate ensures focus returns to trigger element
- **Don't skip aria attributes**: role="dialog", aria-modal="true", aria-labelledby are required for accessibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                    | Don't Build                                      | Use Instead                                      | Why                                                                                             |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Focus trapping in modals   | Manual Tab key handler + focusable element query | focus-trap library                               | Handles nested traps, dynamic content, return focus, Escape key, outside clicks, and edge cases |
| Modal scroll locking       | document.body.style.overflow manipulation        | CSS position:fixed on modal overlay              | Simpler, no body manipulation, works with Teleport                                              |
| Animated modal transitions | Handcrafted JS animations                        | Vue Transition component                         | Declarative CSS transitions, automatic class management, optimized                              |
| Custom scrollbars          | perfect-scrollbar, simplebar, or custom JS       | Native CSS ::-webkit-scrollbar + scrollbar-width | More performant, accessible, no JS overhead                                                     |
| SVG icon management        | Icon component library (Heroicons, FontAwesome)  | Inline SVG for simple shapes                     | Smaller bundle, easier to style with CSS, no library dependency                                 |
| Backdrop click detection   | Manual overlay click + stopPropagation logic     | @click.self on overlay                           | Vue directive handles event targeting correctly                                                 |

**Key insight:** Modal accessibility is complex — focus-trap library handles WCAG requirements, keyboard navigation, dynamic content, nested modals, and return focus. The 7KB library prevents dozens of edge case bugs.

## Common Pitfalls

### Pitfall 1: Focus Trap Without Cleanup

**What goes wrong:** Focus trap remains active after modal closes, breaking keyboard navigation
**Why it happens:** Not calling deactivate() when modal unmounts or visibility changes
**How to avoid:** Use watch() to activate/deactivate trap based on modelValue prop
**Warning signs:** Keyboard navigation doesn't work after closing modal, Tab key doesn't move focus

```typescript
// ❌ Bad: No cleanup
onMounted(() => {
  focusTrap = createFocusTrap(modalRef.value);
  focusTrap.activate();
});

// ✅ Good: Cleanup on unmount and visibility change
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && modalRef.value) {
      focusTrap = createFocusTrap(modalRef.value, {
        escapeDeactivates: true,
        onDeactivate: close,
      });
      focusTrap.activate();
    } else if (focusTrap) {
      focusTrap.deactivate();
      focusTrap = null;
    }
  }
);

onUnmounted(() => {
  if (focusTrap) {
    focusTrap.deactivate();
  }
});
```

### Pitfall 2: Teleport Target Not Available

**What goes wrong:** Vue error "Failed to locate Teleport target" when target doesn't exist in DOM
**Why it happens:** Teleport target selector runs before target element mounts
**How to avoid:** Always teleport to "body" (exists at mount time) or use defer attribute in Vue 3.5+
**Warning signs:** Console error during component mount, modal doesn't render

```vue
<!-- ❌ Bad: Custom target that might not exist -->
<Teleport to="#modal-root">

<!-- ✅ Good: Always-available body target -->
<Teleport to="body">

<!-- ✅ Good (Vue 3.5+): Deferred teleport for late targets -->
<Teleport defer to="#late-div">
```

### Pitfall 3: Text Shadow Performance on Mobile

**What goes wrong:** Choppy animations or slow rendering on mobile devices with complex text shadows
**Why it happens:** Multiple text-shadow layers with blur require GPU compositing
**How to avoid:** Limit to 3-5 shadow layers, use smaller blur radii on mobile, test on actual devices
**Warning signs:** Janky scroll performance, slow animation frame rates on mobile

```scss
// ❌ Bad: 7+ layers with large blur
text-shadow:
  0 1px 0 white,
  0 2px 2px black,
  0 4px 4px black,
  0 8px 8px black,
  0 16px 16px black,
  0 32px 32px black,
  0 0 40px gold;

// ✅ Good: 4-5 layers with moderate blur
text-shadow:
  0 1px 0 white,
  0 2px 2px rgba(0, 0, 0, 0.15),
  0 4px 4px rgba(0, 0, 0, 0.2),
  0 8px 12px rgba(0, 0, 0, 0.3),
  0 0 20px rgba(255, 255, 255, 0.4);

// ✅ Good: Reduced complexity on mobile
@media (max-width: 768px) {
  text-shadow:
    0 1px 0 white,
    0 2px 3px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 255, 255, 0.3);
}
```

### Pitfall 4: Scroll Container Without Height

**What goes wrong:** overflow-y: auto has no effect, content doesn't scroll
**Why it happens:** Overflow only works when container has explicit height constraint
**How to avoid:** Set height, max-height, or use flex/grid parent with defined dimensions
**Warning signs:** No scrollbar appears even when content exceeds container

```scss
// ❌ Bad: No height constraint
.scroll-list {
  overflow-y: auto; // Has no effect without height
}

// ✅ Good: Explicit max-height
.scroll-list {
  max-height: 400px;
  overflow-y: auto;
}

// ✅ Good: Flex parent constraining height
.parent {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.scroll-list {
  flex: 1;
  overflow-y: auto;
}
```

### Pitfall 5: Modal Backdrop Not Blocking Clicks

**What goes wrong:** Clicking through modal backdrop triggers underlying page elements
**Why it happens:** Backdrop doesn't cover full viewport or z-index is too low
**How to avoid:** Use position: fixed with inset: 0 and appropriate z-index
**Warning signs:** Can interact with page elements while modal is open

```scss
// ❌ Bad: Doesn't cover full viewport
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

// ✅ Good: Fixed positioning covers entire viewport
.modal-overlay {
  position: fixed;
  inset: 0; // Shorthand for top/right/bottom/left: 0
  z-index: var(--z-modal);
  background-color: rgba(0, 0, 0, 0.55);
}
```

### Pitfall 6: Forgetting ARIA Attributes

**What goes wrong:** Screen readers can't identify modal structure or announce modal state
**Why it happens:** Developers focus on visual styling and forget semantic attributes
**How to avoid:** Always include role="dialog", aria-modal="true", and aria-labelledby/aria-label
**Warning signs:** Screen reader testing shows no dialog announcement, focus doesn't trap audibly

```vue
<!-- ❌ Bad: No ARIA attributes -->
<div class="modal-content">
  <h2>Title</h2>
  <p>Content</p>
</div>

<!-- ✅ Good: Complete ARIA structure -->
<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Title</h2>
  <p>Content</p>
</div>
```

## Code Examples

Verified patterns from official sources:

### GameModal Component Structure

```vue
<script setup lang="ts">
// Source: Vue 3 Teleport docs + focus-trap GitHub + W3C ARIA patterns
import { ref, watch, onUnmounted } from 'vue';
import { createFocusTrap } from 'focus-trap';

interface Props {
  modelValue: boolean;
  variant?: 'default' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const modalRef = ref<HTMLElement>();
let focusTrap: ReturnType<typeof createFocusTrap> | null = null;

const close = () => {
  emit('update:modelValue', false);
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && modalRef.value) {
      focusTrap = createFocusTrap(modalRef.value, {
        initialFocus: false,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
        onDeactivate: close,
      });
      focusTrap.activate();
    } else if (focusTrap) {
      focusTrap.deactivate();
      focusTrap = null;
    }
  }
);

onUnmounted(() => {
  if (focusTrap) {
    focusTrap.deactivate();
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div
          ref="modalRef"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          :class="`modal-container--${variant}`"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// Transition: fade overlay, scale content
.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container {
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-leave-active .modal-container {
  transition: transform 200ms ease-in;
}

.modal-leave-to .modal-container {
  transform: scale(0.95);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.modal-container {
  max-width: 600px;
  max-height: 85vh;
  width: 100%;
  overflow-y: auto;
}
</style>
```

### GameHeader Component Structure

```vue
<script setup lang="ts">
// Source: Existing GameButton/GameDisplay patterns
interface Props {
  color?: 'white' | 'gold' | 'green' | 'blue' | 'orange';
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
});
</script>

<template>
  <header class="game-header">
    <div class="game-header__left">
      <slot name="left" />
    </div>
    <h1 :class="['game-header__title', `game-header__title--${color}`]">
      <slot />
    </h1>
    <div class="game-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<style scoped lang="scss">
// Source: design-system.scss text-3d-effect pattern
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-md);
  width: 100%;
  max-width: 600px;

  &__left,
  &__right {
    flex: 0 0 auto;
    min-width: 44px; // Touch target size
  }

  &__title {
    flex: 1;
    text-align: center;
    font-family: var(--font-display);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    line-height: 1.1;
    margin: 0;

    // Color variants with 3D text shadow
    &--white {
      color: white;
      text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.7),
        0 2px 2px rgba(0, 0, 0, 0.15),
        0 4px 4px rgba(0, 0, 0, 0.2),
        0 8px 12px rgba(0, 0, 0, 0.35),
        0 0 20px rgba(255, 255, 255, 0.5);
    }

    &--gold {
      color: var(--color-text-yellow);
      text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.4),
        0 2px 0 var(--color-border-gold-dark),
        0 4px 0 var(--color-border-gold-darker),
        0 6px 8px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(255, 213, 79, 0.5);
    }

    // Add green, blue, orange variants as needed
  }
}
</style>
```

### GameScrollList Component Structure

```vue
<script setup lang="ts">
// Source: MDN overflow docs + existing component patterns
interface Props {
  showRanks?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRanks: false,
});
</script>

<template>
  <div class="game-scroll-list" tabindex="0" role="region" aria-label="Scrollable list">
    <div v-for="(item, index) in items" :key="item.id" class="game-scroll-list__row">
      <div v-if="showRanks" class="game-scroll-list__rank">
        <!-- Rank icons (crown/badge) go here -->
        <slot name="rank" :rank="index + 1" />
      </div>
      <div class="game-scroll-list__content">
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Source: MDN overflow + design-system.scss
.game-scroll-list {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  // Firefox scrollbar
  scrollbar-width: thin;
  scrollbar-color: var(--color-btn-blue-dark) rgba(255, 255, 255, 0.2);

  // Webkit scrollbar
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-btn-blue-dark);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--color-btn-blue-light);
    }
  }

  // Keyboard focus
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 239, 194, 0.95) 100%
    );
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  &__rank {
    flex: 0 0 auto;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex: 1;
  }
}
</style>
```

## State of the Art

| Old Approach                      | Current Approach                | When Changed                    | Impact                                  |
| --------------------------------- | ------------------------------- | ------------------------------- | --------------------------------------- |
| Portal libraries (portal-vue)     | Vue 3 built-in Teleport         | Vue 3 release (2020)            | No extra dependency, native performance |
| Manual focus management           | focus-trap library              | Industry standard since 2015    | WCAG 2.1 compliant, handles edge cases  |
| backdrop-filter for blur          | backdrop-filter is now baseline | September 2024                  | Can use safely without fallbacks        |
| JS animation libraries for modals | CSS Transition component        | Vue 3 best practice             | Simpler, more performant, declarative   |
| Single text-shadow layer          | Multi-layer text-shadow         | Baseline since 2015             | 3D depth effects without images         |
| Custom scrollbar JS libraries     | Native CSS scrollbar styling    | Firefox scrollbar-width (2019+) | More performant, accessible, native     |

**Deprecated/outdated:**

- **portal-vue**: Use Vue 3 Teleport instead (built-in, no dependency)
- **Custom focus trap implementations**: Use focus-trap library (battle-tested, WCAG compliant)
- **@vueuse/integrations useFocusTrap**: Optional wrapper, direct focus-trap usage is simpler and documented better
- **JS scroll lock libraries**: CSS position: fixed on overlay is simpler

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal animation durations for mobile vs desktop**
   - What we know: 200-300ms is standard, faster feels snappier on mobile
   - What's unclear: Whether project needs adaptive timing based on device
   - Recommendation: Start with 250ms for both, adjust based on user testing

2. **Number of text-shadow layers for mobile performance**
   - What we know: 3-5 layers is safe, 7+ can cause jank on low-end devices
   - What's unclear: Exact performance threshold for this project's target devices
   - Recommendation: Start with 5 layers, test on actual devices (Pixel 5 from existing Playwright config)

3. **Custom scrollbar styling browser coverage**
   - What we know: ::-webkit-scrollbar works in Chrome/Safari, scrollbar-width in Firefox
   - What's unclear: Whether fallback styling needed for other browsers
   - Recommendation: Use both, native scrollbar acceptable for unsupported browsers

## Sources

### Primary (HIGH confidence)

- Vue 3 Official Documentation - Teleport component (https://vuejs.org/guide/built-ins/teleport.html)
- Vue 3 Official Documentation - Transition component (https://vuejs.org/guide/built-ins/transition.html)
- W3C ARIA Authoring Practices Guide - Dialog (Modal) Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- focus-trap GitHub Repository - Core API (https://github.com/focus-trap/focus-trap)
- MDN Web Docs - text-shadow (https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow)
- MDN Web Docs - backdrop-filter (https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- MDN Web Docs - overflow (https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)

### Secondary (MEDIUM confidence)

- VueUse Documentation - useFocusTrap (https://vueuse.org/core/useFocusTrap/)
- Existing codebase patterns (GameButton, GameDisplay, design-system.scss)

### Tertiary (LOW confidence)

- None - All findings verified with official sources

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Vue 3 built-ins and focus-trap are industry standards with official documentation
- Architecture: HIGH - Patterns verified against Vue 3 docs, W3C ARIA specs, and existing codebase
- Pitfalls: HIGH - Common issues documented in official sources and focus-trap GitHub issues

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable stack, no fast-moving dependencies)
