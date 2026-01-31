# Phase 2: Design Utilities - Research

**Researched:** 2026-01-31
**Domain:** SCSS mixins, CSS visual effects, responsive clamp scaling
**Confidence:** MEDIUM

## Summary

This phase should codify the mockup effects into reusable SCSS mixins and functions that sit alongside the existing design tokens in `apps/game/assets/scss/design-system.scss`. The standard approach is Sass mixins/functions that emit layered gradients, box-shadow/text-shadow stacks, and pseudo-element highlights, with a `clamp()`-based utility for fluid scaling.

Planning should emphasize: (1) a small, composable set of mixins for glossy buttons, embossed panels, and glow/shadow layers; (2) one clamp conversion utility aligned to the existing 360px to 1080px viewport range used in the design system; and (3) performance safety by limiting shadow layers and avoiding heavy filters on large surfaces. The mixins should reuse CSS variables and token maps so UnoCSS utilities can continue to reference the same values.

**Primary recommendation:** Build three effect mixins plus a single clamp conversion helper in the existing SCSS design system, reusing token maps and CSS vars for colors and radii.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library                        | Version            | Purpose                                  | Why Standard                                        |
| ------------------------------ | ------------------ | ---------------------------------------- | --------------------------------------------------- |
| Sass (SCSS)                    | Dart Sass 1.97.3\* | Author mixins/functions and reuse tokens | Standard for SCSS mixins/functions in this codebase |
| CSS `clamp()`                  | Spec-defined       | Fluid responsive scaling                 | Standard CSS math for bounded fluid sizing          |
| CSS `box-shadow`/`text-shadow` | Spec-defined       | Multi-layer glow/shadow effects          | Standard CSS for layered shadows                    |
| CSS gradients                  | Spec-defined       | Gloss and bevel highlights               | Standard CSS for multi-stop highlights              |

### Supporting

| Library          | Version            | Purpose                                   | When to Use                          |
| ---------------- | ------------------ | ----------------------------------------- | ------------------------------------ |
| UnoCSS           | ^66.6.0            | Utility classes referencing CSS variables | When exposing effects via utilities  |
| Sass `sass:math` | Dart Sass 1.97.3\* | Unit-safe math for clamp formula          | When computing fluid scaling in SCSS |

\*Version noted from Sass documentation; actual toolchain version may differ in this repo.

### Alternatives Considered

| Instead of    | Could Use         | Tradeoff                                        |
| ------------- | ----------------- | ----------------------------------------------- |
| CSS `clamp()` | Media-query steps | Less smooth scaling, more rules to maintain     |
| CSS shadows   | Raster images     | Heavier assets, poorer scaling, harder to theme |

**Installation:**

```bash
# No new packages required for CSS functions or Sass mixins
```

## Architecture Patterns

### Recommended Project Structure

```
apps/game/assets/scss/
├── design-system.scss   # Tokens, CSS vars, base mixins and helpers
└── effects/             # Optional: phase-specific mixins
    ├── _glossy.scss
    ├── _embossed.scss
    ├── _shadows.scss
    └── _scaling.scss
```

### Pattern 1: Token-driven mixins

**What:** Mixins accept semantic parameters (tint, intensity) and use existing CSS variables for colors, radii, and shadow tokens.
**When to use:** For glossy, embossed, and glow effects that must align with the design tokens and UnoCSS utilities.
**Example:**

```scss
// Source: https://sass-lang.com/documentation/at-rules/mixin/
@mixin glossy-button($base, $highlight: rgba(255, 255, 255, 0.45)) {
  background: linear-gradient(180deg, $base 0%, darken($base, 12%) 100%);
  box-shadow:
    0 12px 0 rgba(0, 0, 0, 0.18),
    0 14px 28px rgba(0, 0, 0, 0.18);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 50% 0%, $highlight 0%, transparent 60%);
    pointer-events: none;
  }
}
```

### Pattern 2: Clamp utility function

**What:** A single function returns `clamp(min, preferred, max)` using a unit-safe formula tied to the mockup width.
**When to use:** For font size, spacing, radius, and shadow offsets tied to 1080px mockups.
**Example:**

```scss
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
// Source: https://sass-lang.com/documentation/values/numbers/
@use 'sass:math';

@function fluid($min, $max, $min-vw: 360px, $max-vw: 1080px) {
  $slope: math.div($max - $min, $max-vw - $min-vw);
  $intercept: $min - $slope * $min-vw;
  @return clamp($min, calc(#{$intercept} + #{$slope} * 100vw), $max);
}
```

### Anti-Patterns to Avoid

- **Effect duplication:** avoid copy-pasting shadow stacks across components; always use mixins.
- **Unbounded scaling:** avoid `vw`-only sizes without clamp bounds.
- **Unit-unsafe math:** avoid string interpolation for units (use unit-safe math via `sass:math`).
- **Heavy filters on large surfaces:** avoid `filter: blur()` and `backdrop-filter` for core effects unless tested on target devices.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem            | Don't Build         | Use Instead             | Why                          |
| ------------------ | ------------------- | ----------------------- | ---------------------------- |
| Responsive scaling | JS resize listeners | CSS `clamp()` math      | More reliable and performant |
| Glossy effects     | Image overlays      | CSS gradients + shadows | Scales cleanly, themable     |

**Key insight:** CSS math functions and shadows already cover the required effects with better scalability and performance than JS or raster assets.

## Common Pitfalls

### Pitfall 1: Shadow stacks too heavy

**What goes wrong:** Excess layers/large blur values cause jank on scroll.
**Why it happens:** Shadows are repainted frequently; large blur radii are expensive.
**How to avoid:** Limit to 3-5 layers, prefer small blurs; test on mid-range phones.
**Warning signs:** Scroll stutter or delayed tap feedback.

### Pitfall 2: Gloss highlight misalignment

**What goes wrong:** Gloss band looks like a thin specular line or off-center.
**Why it happens:** Using a narrow gradient or incorrect highlight origin.
**How to avoid:** Use broad top fade with radial origin at top-center; verify against mockup.
**Warning signs:** Highlight looks sharp or shifts when resizing.

### Pitfall 3: Embossed border loses depth on light panels

**What goes wrong:** Inner glow and border blend into the panel background.
**Why it happens:** Insufficient contrast between border and inner glow.
**How to avoid:** Use a slightly darker outer edge + neutral white inner glow and a subtle inset shadow.
**Warning signs:** Border reads flat in light backgrounds.

### Pitfall 4: Unit errors in scaling math

**What goes wrong:** Sass emits invalid calc values or errors when mixing units.
**Why it happens:** Interpolating numbers into strings or dividing without `sass:math`.
**How to avoid:** Use `sass:math` and keep units attached to numbers.
**Warning signs:** Sass errors about incompatible units or strings in calc.

## Code Examples

Verified patterns from official sources:

### Multi-layer shadows (box-shadow)

```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow */
box-shadow:
  inset 0 -3em 3em rgb(0 200 0 / 30%),
  0 0 0 2px white,
  0.3em 0.3em 1em rgb(200 0 0 / 60%);
```

### clamp() for fluid sizing

```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/clamp */
font-size: clamp(1rem, 2.5vw, 2rem);
```

### Sass mixin usage

```scss
// Source: https://sass-lang.com/documentation/at-rules/mixin/
@mixin reset-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

nav ul {
  @include reset-list;
}
```

## State of the Art

| Old Approach              | Current Approach | When Changed | Impact                                |
| ------------------------- | ---------------- | ------------ | ------------------------------------- |
| Media queries for scaling | CSS `clamp()`    | 2020+        | Smooth fluid scaling with fewer rules |

**Deprecated/outdated:**

- Fixed pixel-only sizing for responsive layouts (use clamp-based bounds instead).

## Open Questions

1. **Exact numeric targets for gloss and emboss**
   - What we know: Mockup wants top-center gloss, medium intensity, pronounced bevel.
   - What's unclear: Exact shadow/gradient stop values to match the mockup.
   - Recommendation: Derive values during implementation and validate with visual tests.

2. **Performance budget for shadows on mid-range phones**
   - What we know: Heavy blur and many layers can cause jank.
   - What's unclear: Acceptable layer count and blur radius on target devices.
   - Recommendation: Test sample components with 3-5 layers and adjust.

## Sources

### Primary (HIGH confidence)

- https://sass-lang.com/documentation/at-rules/mixin/ - Sass mixin syntax and usage
- https://sass-lang.com/documentation/values/numbers/ - Unit-safe math and number units
- https://developer.mozilla.org/en-US/docs/Web/CSS/clamp - clamp() definition and usage
- https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow - multi-shadow syntax

### Secondary (MEDIUM confidence)

- Local codebase: `apps/game/assets/scss/design-system.scss` for existing tokens and mixins

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM - Sass and CSS features verified, toolchain version inferred from docs
- Architecture: MEDIUM - based on current SCSS layout and decisions
- Pitfalls: MEDIUM - standard CSS performance concerns, device limits untested

**Research date:** 2026-01-31
**Valid until:** 2026-03-02
