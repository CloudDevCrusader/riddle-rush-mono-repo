# Phase 11: Modal Dialogs - Research

**Researched:** 2026-02-01
**Domain:** Vue 3 Modal Implementation / CSS-first Game UI Components
**Confidence:** HIGH

## Summary

This phase involves refactoring existing modal components (PauseModal, QuitModal) to use the established GameModal base component while matching mockup designs with CSS-first styling. The codebase already has a well-implemented GameModal component with focus-trap integration, transitions, and accessibility features from Phase 5.

The key challenge is adapting the existing modals to use GameModal while:

1. Matching mockup designs precisely (red header for Quit, blue for Pause)
2. Disabling backdrop/escape dismissal per requirements
3. Using GameButton component for consistent button styling
4. Ensuring proper i18n integration

**Primary recommendation:** Refactor PauseModal and QuitModal to extend GameModal component, using variant prop for header colors and GameButton for action buttons.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library          | Version  | Purpose                             | Why Standard                                   |
| ---------------- | -------- | ----------------------------------- | ---------------------------------------------- |
| focus-trap       | ^8.0.0   | Keyboard trap for accessible modals | Already used in GameModal, handles Tab cycling |
| Vue 3 Teleport   | built-in | Render modal at body root           | Avoids z-index stacking issues                 |
| Vue 3 Transition | built-in | Enter/leave animations              | Native Vue pattern for modal animations        |

### Supporting

| Library      | Version  | Purpose                   | When to Use           |
| ------------ | -------- | ------------------------- | --------------------- |
| @nuxtjs/i18n | ^10.2.1  | Translations              | All user-facing text  |
| SCSS         | built-in | CSS with variables/mixins | All component styling |

### Alternatives Considered

| Instead of             | Could Use            | Tradeoff                                           |
| ---------------------- | -------------------- | -------------------------------------------------- |
| focus-trap             | @vueuse/useFocusTrap | focus-trap already integrated, stable API          |
| Custom CSS transitions | @vueuse/motion       | Custom gives more control, motion adds bundle size |

**Installation:**

```bash
# No additional packages needed - all dependencies exist
```

## Architecture Patterns

### Recommended Project Structure

```
components/
├── game/
│   └── GameModal.vue        # Base modal (EXISTS - Phase 5)
│   └── GameButton.vue       # Button variants (EXISTS)
├── PauseModal.vue           # REFACTOR to use GameModal
└── QuitModal.vue            # REFACTOR to use GameModal
```

### Pattern 1: Compose from GameModal

**What:** Both PauseModal and QuitModal should wrap GameModal
**When to use:** Any specialized modal dialog
**Example:**

```vue
<!-- Source: Existing GameModal.vue pattern -->
<template>
  <GameModal
    v-model="visible"
    variant="danger"
    :title="t('game.quitGame')"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <!-- Modal body content -->
    <p class="modal-message">{{ t('game.quitConfirmation') }}</p>

    <div class="modal-actions">
      <GameButton variant="danger" @click="handleNo">
        {{ t('common.no') }}
      </GameButton>
      <GameButton variant="primary" @click="handleYes">
        {{ t('common.yes') }}
      </GameButton>
    </div>
  </GameModal>
</template>
```

### Pattern 2: GameModal with Props Extension

**What:** Add closeOnBackdrop and closeOnEscape props to GameModal
**When to use:** Control modal dismissal behavior per-use-case
**Example:**

```typescript
// GameModal props interface extension
interface Props {
  modelValue: boolean
  variant?: 'default' | 'danger'
  title?: string
  closeOnBackdrop?: boolean // NEW - default true
  closeOnEscape?: boolean // NEW - default true
}
```

### Pattern 3: Button Layout Pattern

**What:** Action buttons with consistent flex layout
**When to use:** All modal action areas
**Example:**

```vue
<template>
  <!-- Quit Modal: Horizontal buttons -->
  <div class="modal-actions modal-actions--horizontal">
    <GameButton variant="danger">NO</GameButton>
    <GameButton variant="primary">YES</GameButton>
  </div>

  <!-- Pause Modal: Stacked buttons -->
  <div class="modal-actions modal-actions--stacked">
    <GameButton variant="primary">Resume</GameButton>
    <GameButton variant="secondary">Restart</GameButton>
    <GameButton variant="warning">Home</GameButton>
  </div>
</template>
```

### Anti-Patterns to Avoid

- **Image-based text:** Don't use images for "Game Paused" or button text (current PauseModal does this - needs refactoring)
- **Inline backdrop handlers:** Don't use @click.self for dismissal when it should be disabled
- **Duplicating modal infrastructure:** Don't recreate overlay/transition/focus-trap logic

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem           | Don't Build             | Use Instead          | Why                                       |
| ----------------- | ----------------------- | -------------------- | ----------------------------------------- |
| Focus trapping    | Manual keydown handlers | focus-trap library   | Edge cases: nested traps, Tab cycling, SR |
| Body scroll lock  | Custom overflow toggle  | GameModal's watch    | Already implemented correctly             |
| Modal backdrop    | Custom overlay element  | GameModal overlay    | Includes blur, transitions, z-index       |
| Button styling    | Custom CSS per modal    | GameButton component | Consistency, 3D effect, states            |
| Transition timing | CSS-only animations     | Vue Transition       | Coordinates with focus-trap lifecycle     |

**Key insight:** GameModal already solves all the hard problems. New modals should compose from it, not duplicate its logic.

## Common Pitfalls

### Pitfall 1: Backdrop Click Leaking Through

**What goes wrong:** Click events pass through backdrop to underlying content
**Why it happens:** Using @click on overlay without .self modifier or proper handling
**How to avoid:** GameModal already handles this with @click.self on overlay
**Warning signs:** Clicking outside modal triggers page navigation or actions

### Pitfall 2: Focus Trap Not Deactivating

**What goes wrong:** Focus trap remains active after modal closes
**Why it happens:** Deactivate not called, or called before animation completes
**How to avoid:** Use Transition @after-leave hook (GameModal does this)
**Warning signs:** Can't focus elements outside modal after closing

### Pitfall 3: Button Variants Missing

**What goes wrong:** GameButton doesn't have red/danger variant
**Why it happens:** Current GameButton has primary (green), secondary (blue), warning (orange) but NOT danger (red)
**How to avoid:** Add danger variant to GameButton using existing red color tokens
**Warning signs:** NO button on quit modal not matching mockup red color

### Pitfall 4: Escape Key Still Dismisses

**What goes wrong:** Pressing Escape closes modal when it shouldn't
**Why it happens:** focus-trap default behavior, GameModal's handleEscape override
**How to avoid:** Add prop to disable escape handling, conditionally call close()
**Warning signs:** Modal closes unexpectedly on Escape key

### Pitfall 5: Translation Keys Missing

**What goes wrong:** Modal displays translation keys instead of text
**Why it happens:** Keys not added to locale files
**How to avoid:** All translations already exist in `pause.*` and `game.*` namespaces
**Warning signs:** "[pause.resume]" displayed instead of "Resume"

## Code Examples

Verified patterns from official sources:

### GameModal Integration with Disabled Dismissal

```vue
<!-- Source: Existing GameModal.vue + required modifications -->
<script setup lang="ts">
interface Props {
  modelValue: boolean
  variant?: 'default' | 'danger'
  title?: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  title: undefined,
  closeOnBackdrop: true, // Default true, override for quit/pause
  closeOnEscape: true, // Default true, override for quit/pause
})

// Modified handlers
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && props.closeOnEscape) {
    close()
  }
}
</script>
```

### focus-trap Configuration for Non-Dismissible Modal

```typescript
// Source: focus-trap README.md - escapeDeactivates option
focusTrap = createFocusTrap(modalRef.value, {
  escapeDeactivates: false, // We handle Escape manually/conditionally
  clickOutsideDeactivates: false, // Modal handles backdrop clicks
  allowOutsideClick: true, // Let clicks through (but won't dismiss)
  initialFocus: false, // Let content determine initial focus
  fallbackFocus: modalRef.value,
})
```

### Pause Modal Button Stack with Icons

```vue
<!-- Source: mockup menu.png - buttons have icons -->
<template>
  <div class="pause-actions">
    <GameButton variant="primary" size="lg" full-width @click="handleResume">
      <PlayIcon class="button-icon" />
      {{ t('pause.resume') }}
    </GameButton>
    <GameButton variant="secondary" size="lg" full-width @click="handleRestart">
      <RefreshIcon class="button-icon" />
      {{ t('pause.restart') }}
    </GameButton>
    <GameButton variant="warning" size="lg" full-width @click="handleHome">
      <HomeIcon class="button-icon" />
      {{ t('pause.home') }}
    </GameButton>
  </div>
</template>
```

### Adding Danger Variant to GameButton

```scss
// Source: design-system.scss color tokens
.game-button--danger {
  @include glossy-button(
    var(--color-btn-red-light),
    var(--color-btn-red-dark),
    var(--color-btn-red-shadow)
  );
  --shadow-color: var(--color-btn-red-shadow);
}
```

## State of the Art

| Old Approach                   | Current Approach   | When Changed     | Impact                      |
| ------------------------------ | ------------------ | ---------------- | --------------------------- |
| Image-based modal (PauseModal) | CSS GameModal      | Phase 5          | Smaller assets, better i18n |
| Custom overlay per modal       | Teleport to body   | Vue 3            | Proper z-index stacking     |
| Manual focus management        | focus-trap library | Already in place | Robust accessibility        |

**Deprecated/outdated:**

- `PauseModal.vue` image-based approach: Should be replaced with CSS-based GameModal composition
- Inline transition CSS: GameModal has proper Vue Transition with lifecycle hooks

## Mockup Analysis

### Quit Modal (QUIT GAME.png)

- **Header:** Red gradient bar with "QUIT GAME" white text
- **Body:** Cream/panel gradient background
- **Border:** Gold (#ffd54f) outer border
- **Text:** "Are you sure you want to quit game?" dark text
- **Buttons:** Red "NO" (left), Green "YES" (right), horizontal layout
- **NOT shown:** Any way to dismiss by clicking outside or Escape

### Pause Modal (menu.png)

- **Header:** Blue border/frame, "Game Paused" white text with shadow
- **Body:** Blue gradient panel background (matches game background style)
- **Text:** "Game is paused, press resume to continue" white/light text
- **Buttons:** Green "Resume" (with play icon), Blue "Restart" (with refresh icon), Orange "Home" (with home icon)
- **Layout:** Buttons stacked vertically, full-width
- **NOT shown:** Close button or backdrop dismiss option

## Translation Keys Available

```json
// Already in en.json / de.json:
{
  "game": {
    "quitGame": "QUIT GAME",
    "quitConfirmation": "Are you sure you want to quit game?"
  },
  "pause": {
    "title": "Game Paused",
    "message": "Game is paused, press resume to continue",
    "resume": "Resume",
    "restart": "Restart",
    "home": "Home"
  },
  "common": {
    "yes": "YES",
    "no": "NO"
  }
}
```

## Open Questions

Things that couldn't be fully resolved:

1. **Button Icons for Pause Modal**
   - What we know: Mockup shows icons (play, refresh, home) on pause buttons
   - What's unclear: Are icon components already available or need creation?
   - Recommendation: Check for existing icon components; if none, use Unicode or create simple SVG components

2. **Exact Gold Border Styling**
   - What we know: QuitModal mockup has gold border, design tokens have `--color-border-gold: #ffd54f`
   - What's unclear: Border width, shadow styling on mockup
   - Recommendation: Use 3-4px border with subtle glow matching existing design system patterns

## Sources

### Primary (HIGH confidence)

- `apps/game/components/game/GameModal.vue` - Current implementation reviewed
- `apps/game/components/game/GameButton.vue` - Current variants reviewed
- `apps/game/assets/scss/design-system.scss` - All color tokens verified
- `apps/game/i18n/locales/en.json` - Translation keys verified
- `node_modules/focus-trap/README.md` - API documentation for escapeDeactivates, clickOutsideDeactivates
- `docs/mockups/QUIT GAME.png` - Visual requirements verified
- `docs/mockups/menu.png` - Visual requirements verified

### Secondary (MEDIUM confidence)

- Existing QuitModal.vue and PauseModal.vue implementations - Working code patterns

### Tertiary (LOW confidence)

- None - all findings verified with primary sources

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All libraries already in package.json, verified versions
- Architecture: HIGH - Clear pattern from existing GameModal, mockups examined
- Pitfalls: HIGH - Derived from code review and focus-trap documentation

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (stable codebase, no major changes expected)
