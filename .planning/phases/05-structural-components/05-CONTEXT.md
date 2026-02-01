# Phase 5: Structural Components - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Create GameHeader, GameModal, and GameScrollList components — the final pieces of the component library. These structural components will be used across all pages (headers), dialog flows (modals), and list displays (players page, leaderboard). Foundation (Phases 1-2) and interactive components (Phases 3-4) are already complete.

</domain>

<decisions>
## Implementation Decisions

### Modal Header Styles

- Two variants: `danger` (red header) and `default` (blue header)
- Blue header used for: Credits, Language-selector, Menu (pause), Settings
- Red header used for: Quit Game only
- Header bar is optional — support both header bar style (Quit Game) and headerless (Game Paused with title in body)
- Content via default slot — pages compose their own buttons/text inside modal
- v-model controlled visibility — parent owns open/close state, modal emits close event

### Title Text Effects (GameHeader)

- Full header bar component — includes background area, spacing, centering (not just styled text)
- Match mockup exactly — bold multi-layer 3D shadows, high contrast, playful game feel
- Optional left slot for back button (Players page has it, Leaderboard doesn't)
- Optional right slot for future flexibility (even though coins are excluded now)
- Transparent background — sits directly on page's GameBackground
- One consistent text size across all pages
- Color variants supported: white (default), gold, green, blue, orange (game button colors)

### Player List Styling (GameScrollList)

- Generic list component — accepts any row content via slots
- List applies consistent row styling (shadows, spacing, backgrounds) to slot content
- Built-in rank display with `showRanks` prop — renders crowns for positions 1-3, numbered badges for 4-6
- SVG icons for crowns — inline SVG for crisp scaling and easy color control (gold/silver/bronze)

### Modal Backdrop & Dismiss

- Backdrop click closes modal — common mobile pattern, click outside to dismiss
- Medium backdrop opacity (50-60%) — balanced dimming, background visible but modal focused
- Animate open/close — fade + scale, typical 200-300ms timing
- Full accessibility: focus trap (keyboard can't tab outside) + Escape key to close

### Claude's Discretion

- Exact animation easing curves and durations
- Specific shadow layer values for 3D text effect
- Focus trap implementation approach
- Row spacing and gap values within lists

</decisions>

<specifics>
## Specific Ideas

- Modal variants map to mockups: blue for most dialogs (settings, language, pause), red only for quit confirmation
- Crown icons should be SVG inline — gold crown (1st), silver crown (2nd), bronze crown (3rd), then numbered circles for 4th-6th
- Header text effect should be as prominent as mockups show — this is a playful game, not subtle UI

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 05-structural-components_
_Context gathered: 2026-02-01_
