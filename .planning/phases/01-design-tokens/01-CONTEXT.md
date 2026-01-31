# Phase 1: Design Tokens - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish CSS custom properties for colors, typography, and spacing that match mockup specifications. This phase creates the foundation tokens that all subsequent component and page phases will consume. No actual components are built here — only the design system variables and utilities.

</domain>

<decisions>
## Implementation Decisions

### CSS Architecture

- **Add UnoCSS** to the project for utility classes (flex, gap, padding, etc.)
- **Keep SCSS for tokens** — design-system.scss continues to define CSS custom properties
- UnoCSS handles utilities, SCSS handles design tokens (colors, spacing, typography)
- No migration of existing SCSS maps — enhance and extend them

### Spacing System

- **Fluid scaling** using clamp() — 1080px mockup values scale proportionally to other widths
- **Hybrid value extraction** — use standard 4px/8px base scale, verify against mockup proportions
- **Minimum supported width:** 360px (Android baseline)
- **Maximum width:** Claude's discretion based on mockup analysis

### Typography

- **Embossed text effects:** capture the spirit, not pixel-perfect. 3D/embossed feel is important, minor variations acceptable
- **Font:** match mockup font exactly (identify and use the actual font from mockups)
- **Scaling approach:** Claude's discretion (fluid vs modular scale)

### PNG Replacement Strategy (Guiding Principle)

- **Goal:** Enable translations AND reduce bundle size (both equally important)
- **Extract ALL text** from images — replace with HTML/CSS text for translation support
- **If CSS can't match effect:** keep the PNG (don't sacrifice visual quality)
- **Keep as images:** background textures/patterns (complex backgrounds stay as PNGs)
- **Languages:** German + English only (existing i18n setup)

### Claude's Discretion

- Spacing token naming convention (numeric scale vs t-shirt sizes vs hybrid)
- Typography scaling approach (fluid clamp vs modular scale)
- Container max-width value
- Exact implementation of text shadow layers for embossed effect

</decisions>

<specifics>
## Specific Ideas

- UnoCSS was specifically chosen over Tailwind for lighter bundle size and on-demand generation
- The 360px minimum width ensures Android device compatibility without supporting very old/small phones
- "Capture the spirit" for text effects means the 3D/playful feel matters, but if a 4-layer text-shadow becomes 3 layers for simplicity, that's acceptable
- Font matching is important — invest time identifying the exact mockup font

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-design-tokens_
_Context gathered: 2026-01-31_
