# Research Summary: CSS Visual Redesign

**Project:** Riddle Rush — Visual Redesign to Match Mockups
**Researched:** 2026-01-31
**Confidence:** HIGH

---

## Key Findings

### Stack

**Extend existing SCSS design system** — don't introduce new frameworks. Modern CSS (2026) provides all capabilities natively:

| Technology                 | Purpose                         | Confidence |
| -------------------------- | ------------------------------- | ---------- |
| SCSS (Dart Sass)           | Design system foundation        | HIGH       |
| CSS Custom Properties      | Runtime theming, dynamic states | HIGH       |
| Vue 3 Scoped CSS           | Component isolation             | HIGH       |
| `clamp()` + viewport units | Fluid responsive scaling        | HIGH       |
| Container queries          | Component-responsive behavior   | MEDIUM     |

**NO new dependencies needed.** Gradients, multi-layer shadows, text-shadow, backdrop-filter all have 95%+ browser support.

---

### Table Stakes Features (Must Have)

| Feature                                           | Complexity | Notes                              |
| ------------------------------------------------- | ---------- | ---------------------------------- |
| Gradient buttons (180deg, 2-color)                | Low        | CSS `linear-gradient()`            |
| Glossy/embossed effects                           | Low        | `box-shadow` + inset highlights    |
| Rounded corners (18-24px panels, 12-16px buttons) | Low        | `border-radius`                    |
| High-contrast typography (4.5:1 minimum)          | Medium     | `text-shadow` for busy backgrounds |
| Touch targets (44x44pt minimum)                   | Low        | Padding expansion                  |
| Modal dialogs with backdrop                       | Low        | Semi-transparent overlay           |
| Loading/splash screen                             | Low        | Brand + loading bar                |
| Smooth page transitions (300-400ms)               | Medium     | CSS transitions                    |
| Responsive layout (320px-1024px)                  | High       | `vw`, `vh`, `clamp()`              |
| Button states (normal/hover/active/disabled)      | Low        | CSS pseudo-classes                 |

---

### Architecture

**Component structure:**

```
assets/scss/
├── tokens/          # NEW: Game colors, typography, effects, layout
├── mixins/          # NEW: Panel, button, scaling utilities
└── utilities/       # NEW: Animations, backgrounds

components/
├── Base/            # EXISTING: Generic components
└── Game/            # NEW: 7 game-specific components
    ├── GamePanel.vue
    ├── GameButton.vue
    ├── GameDisplay.vue
    ├── GameHeader.vue
    ├── GameBackground.vue
    ├── GameModal.vue
    └── GameScrollList.vue
```

**Build order:**

1. Design tokens + mixins foundation
2. Core Game components
3. Page migrations (low-risk first)
4. Polish and optimization

---

### Critical Pitfalls to Avoid

| Pitfall                           | Warning Sign                          | Prevention                                        |
| --------------------------------- | ------------------------------------- | ------------------------------------------------- |
| **Fixed-unit mockup translation** | Layouts break at different zoom/width | Use `rem`, `vw`, `clamp()` instead of `px`        |
| **Excessive visual effects**      | Jank on scroll, battery drain         | Max 2-3 `backdrop-filter` elements, limit shadows |
| **Hover states on touch devices** | "Stuck" hover effects after tap       | Use `@media(hover: hover)` for hover styles       |
| **Cross-browser gradients**       | Safari renders differently            | Test Safari early, use fallback colors            |
| **Ignoring safe areas**           | Content hidden by notches             | Use `env(safe-area-inset-*)`                      |

---

### Responsive Scaling Strategy

**1080×1920 mockup → all devices:**

1. Convert mockup pixels to relative units
   - `64px gap` → `clamp(2rem, 4vw, 4rem)`
   - `48px font` → `clamp(2rem, 5vw + 1rem, 3rem)`

2. Create spacing scale in CSS variables
   - `--space-1` through `--space-8` based on mockup values

3. Use container queries for panels that resize based on parent, not viewport

4. Mobile-first breakpoints:
   - Base: ≤480px
   - Tablet: 768px+
   - Desktop: 1024px+

---

## Roadmap Implications

**Recommended phases:**

1. **Foundation** — Design tokens, mixins, scaling utilities (LOW risk)
2. **Components** — 7 Game components with mockup styling (MEDIUM effort)
3. **Pages (low-risk)** — language.vue, credits.vue, settings.vue
4. **Pages (critical path)** — index.vue, players.vue, game.vue, results.vue, leaderboard.vue
5. **Polish** — Animations, transitions, performance optimization

**Parallelization opportunities:**

- Game components can be built in parallel
- Page migrations are independent (can run 2-3 simultaneously)

---

## Open Questions

- **Backdrop-filter performance:** Test on 2-3 year old mid-range phones before committing to glassmorphism
- **Safari gradient rendering:** Verify mockup gradients render correctly in Safari
- **Dark mode:** Mockups don't show dark theme — confirm out of scope

---

## Sources

- [Nuxt 4 Styling Documentation](https://nuxt.com/docs/4.x/getting-started/styling)
- [CSS Container Queries in 2026 - LogRocket](https://blog.logrocket.com/container-queries-2026/)
- [Josh W. Comeau - Pixel Perfection](https://www.joshwcomeau.com/css/pixel-perfection/)
- [Vue.js SFC CSS Features](https://vuejs.org/api/sfc-css-features.html)
- [MDN - Using CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
