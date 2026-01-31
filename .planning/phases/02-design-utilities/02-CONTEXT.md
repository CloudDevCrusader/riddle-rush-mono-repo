# Phase 2: Design Utilities - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Create reusable SCSS mixins for visual effects (glossy buttons, embossed panels, drop shadows) and responsive scaling helpers.

</domain>

<decisions>
## Implementation Decisions

### Glossy button look

- Highlight direction: top-center.
- Gloss intensity: medium.
- Bevel edge: soft rounded.
- Gloss treatment: broad top fade (no thin specular band).

### Embossed panel borders

- Border thickness: medium.
- Inner glow tint: neutral white.
- Highlight direction: center-origin glow, minimal directional lighting.
- Bevel depth: pronounced.

### Shadow/glow layering

- Text glow softness: medium.
- Text glow layers: 4+ layers.
- Panel drop shadow: medium lift.
- Glow tint: warm gold.

### Scaling coverage

- Scale type, spacing, radius, and shadows.
- Small screens: balanced between readability and mockup proportions.
- Large screens: stay close to phone proportions (only slight growth).
- Scaling bounds: moderate (not tight, not loose).

### Claude's Discretion

None specified.

</decisions>

<specifics>
## Specific Ideas

- Background glow feels like it originates from the center.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 02-design-utilities_
_Context gathered: 2026-01-31_
