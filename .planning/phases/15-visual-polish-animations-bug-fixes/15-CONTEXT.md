# Phase 15: Visual Polish, Animations & Bug Fixes - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

CSS fidelity pass across all screens to match mockups, Fortune Wheel visual redesign (game-theme-aligned, responsive from 300px), smooth page/component animations, CSS deduplication, and known bug fixes. No new features — polish and alignment only.

</domain>

<decisions>
## Implementation Decisions

### Fortune Wheel — Visual Style

- Use the **game design system** palette: blue gradient segments (alternating shades from the game's blue tokens), gold/orange embossed outer ring matching `--color-border-gold` panel borders
- Segment colors: use 2–3 alternating tones from the game's blue/teal/purple range — NOT the current rainbow palette
- The wheel must feel like it belongs in the game alongside GamePanel and GameButton components

### Fortune Wheel — Outer Ring

- **Gold/orange embossed ring**: thick ring using `--color-border-gold` (#ffd54f) with an inner glow matching the game panel border treatment
- Apply the same `embossed-border` mixin pattern used on GamePanel — consistent decorative language
- Add radial tick marks or studs around the ring edge for the classic game-show wheel feel

### Fortune Wheel — Pointer

- Replace the `▼` emoji with a **CSS-drawn 3D triangle pointer** in gold/orange
- Use CSS `border` trick or `clip-path: polygon()` for the shape
- Add drop-shadow for depth: `filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6))`
- Pointer should bounce with a subtle keyframe animation to draw attention

### Fortune Wheel — Center Hub

- **Gold gradient circle** (`linear-gradient(135deg, #ffd700, #ffa500)`) with white border and glow
- Show a `?` or star icon by default; swap to selected item's emoji after spin completes
- Keep the existing bounce animation on icon swap

### Fortune Wheel — Responsive Sizing (300px minimum)

- Container: `width: min(90vw, 90dvh, 420px)` with no lower px cap
- On screens ≤ 400px: use `min(88vw, 88dvh, 320px)` — fills most of the viewport
- Drop the explicit media query breakpoints at 480px/640px/768px in favor of fluid `clamp()` or `min()` sizing
- Segment text: `clamp(8px, 2.5vw, 14px)` — readable at 300px
- Segment icons: `clamp(16px, 5vw, 32px)` — visible at 300px
- Center circle: `clamp(60px, 18vw, 120px)` — proportional

### Fortune Wheel — Segment Shape

- Keep the `clip-path: polygon()` approach with CSS `sin()`/`cos()` — supported in all modern browsers
- Add `border-right: 1px solid rgba(255,255,255,0.3)` equivalent via overlay for segment dividers

### Page Animations

- **Slide left/right** based on navigation direction: forward → slide left, back → slide right
- Use Nuxt page transitions via `definePageMeta({ pageTransition: { name: 'slide-left' | 'slide-right' } })`
- Component mount stagger: player cards, leaderboard rows use `@vueuse/motion` with index-based `delay: index * 80`
- Duration: 250ms for page transitions, 300ms for component stagger sequences

### CSS Gap Fixes — Priority

- **credits.vue**: Full design system migration — replace BACKGROUND.png, CREDITS.png, ok.png with GameBackground + GameHeader + GamePanel + GameButton
- **round-start.vue**: Leave the Fortune Wheel as the main element; replace BACKGROUND.png image usage with GameBackground component; keep existing wheel and button layout
- **index.vue**: Replace LOGO.png with CSS text "RIDDLE RUSH" using GameHeader component (mockup shows text, not image)
- Other pages: minor gap fixes only (verify, tweak, don't rewrite)

### CSS Deduplication

- Extract shared `@keyframes` (fadeIn, scaleIn, slideUp, pulse, glow) from scoped component styles into `design-system.scss` global definitions — remove duplicates from credits.vue, round-start.vue, SplashScreen.vue, SettingsModal.vue
- Add `.page-shell` utility class for `min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column` — eliminates boilerplate on every page
- Extract back-button styles into a `.game-back-btn` utility class

### Claude's Discretion

- Exact segment color values within the game's blue/teal/purple range
- Exact stagger timing values (within 60–100ms per item range)
- Specific tick mark design on the wheel's outer ring
- Error state handling for empty wheel items

</decisions>

<specifics>
## Specific Ideas

- Fortune Wheel: "look a lot better and fitting on screens from 300px on" — the current rainbow colors and emoji pointer feel out of place. The wheel should look like it was designed as part of the same game, not assembled separately.
- Wheel style reference: think game-show wheel from a video game UI — embossed gold border, thematic colors, satisfying physics
- 300px is the minimum — this is a very narrow phone (320px is the historic iPhone SE minimum; 300px is conservative)

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- `GameBackground.vue`: wraps all pages, provides blue radial gradient — credits.vue and round-start.vue should switch to this
- `GameHeader.vue`: 3D text effect — index.vue can use this for "RIDDLE RUSH" title replacing LOGO.png
- `GamePanel.vue`: embossed border panel — use in credits.vue
- `GameButton.vue`: all variants (primary/secondary/warning/danger) — credits.vue's ok.png button becomes this
- `assets/scss/design-system.scss`: `$colors`, `$gradients`, `$spacings` maps; mixins: `embossed-border`, `glossy-button`, `responsive-scale`
- `@vueuse/motion`: already in nuxt.config modules; `v-motion` directive and `useMotion` composable available
- Vue `<Transition>` + `<TransitionGroup>`: built-in for page/list animations

### Established Patterns

- Design tokens: accessed via CSS custom properties (`var(--color-border-gold)`, `var(--spacing-md)`, etc.)
- Component scoped styles: `<style scoped>` in SFCs, referencing SCSS variables via `var(--xxx)`
- Page animations: `@vueuse/motion` with `v-motion` directive, `:initial`, `:enter`, `:delay` bindings
- Fortune Wheel: `clip-path: polygon(50% 50%, 50% 0%, ...)` segment approach — keep this
- Pointer: currently `▼` emoji in `.pointer-arrow` — replace with CSS shape
- Responsive sizing: `clamp()` and `min()` CSS functions throughout the design system

### Integration Points

- `pages/round-start.vue` renders `<FortuneWheel>` — any sizing/layout changes there may need page-level adjustments
- `nuxt.config.ts`: `pageTransition` can be set globally in `app` config
- `assets/scss/design-system.scss`: add `.page-shell` and animation utilities here
- `apps/game/app.vue` or individual pages: add `definePageMeta` for slide direction

</code_context>

<deferred>
## Deferred Ideas

- Confetti/particle effect on round completion — future phase (visual flourish)
- Animated Fortune Wheel spin sound effect integration — out of scope for Phase 15
- Dark mode — separate phase entirely

</deferred>

---

_Phase: 15-visual-polish-animations-bug-fixes_
_Context gathered: 2026-03-23_
