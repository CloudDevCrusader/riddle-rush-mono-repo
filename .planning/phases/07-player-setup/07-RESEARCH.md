# Phase 7: Player Setup - Research

**Researched:** 2026-02-01
**Domain:** Nuxt 4 + Vue 3 UI implementation (player configuration page)
**Confidence:** HIGH

## Summary

This phase is a UI-focused implementation in the existing Nuxt 4 + Vue 3 game app, using the established design system (SCSS tokens + UnoCSS utilities) and layout components already in the repo. The players page should be rebuilt to match the mockup with CSS-first styling, leveraging design tokens, `GameBackground`, and the standard button/scroll patterns rather than image assets.

The correct player count range is already standardized via `MAX_PLAYERS = 6`, and the players page currently uses Vue refs and list rendering patterns that should be reused. Input fields should be rendered from a count-driven array and bound with `v-model` for placeholder text, while the START GAME button should follow the game button styling and placement conventions from the design system.

**Primary recommendation:** Build the player setup UI with Vue refs + `v-for`, clamp count via `MAX_PLAYERS`, and use design-system tokens/UnoCSS utilities with `GameBackground`/`GamePanel` for mockup-accurate CSS (no image-based coins).

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library            | Version | Purpose                          | Why Standard                             |
| ------------------ | ------- | -------------------------------- | ---------------------------------------- |
| Nuxt               | 4.2.2   | App framework, pages routing     | Repo standard for UI pages (`apps/game`) |
| Vue                | 3.5.26  | Component rendering + reactivity | Required for page UI + `v-model`         |
| UnoCSS             | 66.6.0  | Utility classes mapped to tokens | Hybrid CSS approach for mockup alignment |
| SCSS design system | In-repo | Tokens, mixins, clamp scaling    | Mockup-aligned tokens and effects        |

### Supporting

| Library             | Version   | Purpose                                | When to Use                        |
| ------------------- | --------- | -------------------------------------- | ---------------------------------- |
| @riddle-rush/shared | workspace | Shared constants (e.g., `MAX_PLAYERS`) | Always use for limits and config   |
| @pinia/nuxt         | 0.11.3    | Game state store                       | Use to persist selected players    |
| vue-i18n            | 11.1.0    | Placeholder text and UI strings        | Use for input placeholder + labels |

### Alternatives Considered

| Instead of          | Could Use           | Tradeoff                                          |
| ------------------- | ------------------- | ------------------------------------------------- |
| CSS tokens + UnoCSS | Image assets for UI | Loses scalability and violates CSS-first decision |

**Installation:**

```bash
pnpm install
```

## Architecture Patterns

### Recommended Project Structure

```
apps/game/
├── pages/players.vue              # Player setup page
├── components/layout/             # GameBackground, GamePanel
├── components/game/               # GameButton, GameScrollList
└── assets/scss/                    # design-system.scss + effects
```

### Pattern 1: Page Scaffold With GameBackground + Tokens

**What:** Wrap page content in `GameBackground`, then build layout using SCSS tokens and UnoCSS utilities.
**When to use:** All mockup-driven pages that share the same background and spacing rules.
**Example:**

```vue
<!-- Source: apps/game/components/layout/GameBackground.vue -->
<GameBackground>
  <div class="players-layout">
    <!-- Page content -->
  </div>
</GameBackground>
```

### Pattern 2: Count-Driven Inputs With `v-for`

**What:** Drive input fields from a reactive list and re-render on count changes.
**When to use:** Player count stepper and dynamic name fields (1–6 players).
**Example:**

```vue
<!-- Source: apps/game/pages/players.vue -->
<div v-for="(player, index) in players" :key="`player-${index}-${player.name}`">
  <input v-model="player.name" type="text" />
</div>
```

### Pattern 3: Standard Button Styling via GameButton

**What:** Use `GameButton` for consistent gradient buttons and pressed state.
**When to use:** START GAME button and any secondary actions that should match the system style.
**Example:**

```vue
<!-- Source: apps/game/components/game/GameButton.vue -->
<GameButton variant="primary" size="lg">START GAME</GameButton>
```

### Anti-Patterns to Avoid

- **Image-based UI panels/buttons:** Violates CSS-first design decision and scales poorly.
- **Hardcoding max players:** Use `MAX_PLAYERS` to keep rules consistent.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                | Don't Build               | Use Instead               | Why                                                 |
| ---------------------- | ------------------------- | ------------------------- | --------------------------------------------------- |
| Max player limit       | Inline numeric constants  | `MAX_PLAYERS` constant    | Keeps game rules consistent across pages            |
| Scrollable player list | Custom scrollbar per page | `GameScrollList` styles   | Consistent scroll behavior + dual scrollbar support |
| 3D/embossed text       | Ad-hoc text-shadow        | SCSS mixins in `effects/` | Standardized depth/contrast on all pages            |

**Key insight:** The design system already encodes the mockup look (colors, radii, clamp spacing, text effects); reuse it to avoid visual drift.

## Common Pitfalls

### Pitfall 1: Count changes don’t update inputs

**What goes wrong:** Player fields don’t re-render or keep stale values when count decreases.
**Why it happens:** Mutating arrays in-place or not trimming to count length.
**How to avoid:** Use refs and reassign arrays when size changes; clamp to 1–`MAX_PLAYERS`.
**Warning signs:** Input list length doesn’t match stepper value.

### Pitfall 2: Placeholder text not localized

**What goes wrong:** Placeholder text is hardcoded and diverges from localization.
**Why it happens:** Skipping `t()` usage on inputs.
**How to avoid:** Use `useI18n()`/`usePageSetup().t` for placeholder text.
**Warning signs:** English-only placeholder despite localized UI.

### Pitfall 3: Reintroducing coin assets

**What goes wrong:** Coins appear in the players page, violating the “no coins” decision.
**Why it happens:** Reusing older assets or mockup-derived images.
**How to avoid:** Use CSS-only styling and check for coin assets in the template.
**Warning signs:** Any coin image references in `players.vue` or styles.

## Code Examples

Verified patterns from repo sources:

### Max Players Constant

```ts
// Source: packages/shared/src/constants.ts
export const MAX_PLAYERS = 6
```

### Game Button Styling

```vue
<!-- Source: apps/game/components/game/GameButton.vue -->
<GameButton variant="primary" size="lg">START GAME</GameButton>
```

### Mockup-Aligned Clamp Scaling

```scss
// Source: apps/game/assets/scss/effects/_scaling.scss
@function mockup-clamp($px, $min-scale: 0.86, $max-scale: 1.04, $base-width: 1080px) {
  $min: $px * $min-scale;
  $max: $px * $max-scale;
  $preferred: calc(#{$px} * (100vw / #{$base-width}));

  @return clamp(#{$min}, #{$preferred}, #{$max});
}
```

## State of the Art

| Old Approach                   | Current Approach                                    | When Changed       | Impact                                                               |
| ------------------------------ | --------------------------------------------------- | ------------------ | -------------------------------------------------------------------- |
| Image-based background/buttons | CSS-first design tokens + GameBackground/GameButton | Current repo state | Scales better across devices and matches mockup without heavy assets |

**Deprecated/outdated:**

- Image-based page compositions for core UI elements; replace with tokenized CSS.

## Open Questions

1. **Should player names be stored immediately in `gameStore.players` or staged until START GAME?**
   - What we know: `players.vue` currently stages `pendingPlayerNames` before navigation.
   - What's unclear: Whether player setup should directly mutate `gameStore.players` in this phase.
   - Recommendation: Keep staging via `pendingPlayerNames` unless Phase 5 introduced a new flow.

2. **Exact mockup spacing for stepper + inputs**
   - What we know: Spacing tokens are driven by `mockup-clamp()`.
   - What's unclear: Specific spacing values for PAGE-03 without the image.
   - Recommendation: Use token scale (`spacing-md/lg/xl`) and adjust once `players.png` is referenced during implementation.

## Sources

### Primary (HIGH confidence)

- `apps/game/uno.config.ts` - UnoCSS tokens + shortcuts
- `apps/game/assets/scss/design-system.scss` - Colors, spacing, radius, gradients
- `apps/game/components/layout/GameBackground.vue` - Background wrapper
- `apps/game/components/game/GameButton.vue` - Button styling
- `apps/game/components/game/GameScrollList.vue` - Scroll list styling
- `apps/game/pages/players.vue` - Existing players UI patterns
- `packages/shared/src/constants.ts` - `MAX_PLAYERS`

### Secondary (MEDIUM confidence)

- None

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - derived from `apps/game/package.json` and local config
- Architecture: HIGH - patterns are present in repo components/pages
- Pitfalls: MEDIUM - inferred from current patterns and prior decisions

**Research date:** 2026-02-01
**Valid until:** 2026-03-03
