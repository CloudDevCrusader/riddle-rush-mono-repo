# Roadmap: Visual Redesign to Match Mockups

## Overview

Transform all Riddle Rush screens to match designer mockups pixel-for-pixel by building a modern CSS design system, creating 7 game-specific components, and migrating 8 pages and 2 modals. Foundation establishes tokens and utilities, components provide reusable UI building blocks, and pages deliver the complete visual overhaul from splash screen through gameplay to leaderboard.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Tokens** - Color palette, typography, and spacing foundation
- [x] **Phase 2: Design Utilities** - Effects mixins and responsive scaling system
- [x] **Phase 3: Core Layout Components** - Panel and background containers
- [x] **Phase 4: Interactive Components** - Buttons and display elements
- [x] **Phase 5: Structural Components** - Headers, modals, and scrollable lists
- [x] **Phase 6: Splash & Navigation** - Initial screens and main menu
- [x] **Phase 7: Player Setup** - Player configuration interface
- [x] **Phase 8: Core Gameplay** - Main game screen (critical path)
- [x] **Phase 9: Game Results** - Scoring and leaderboard pages
- [ ] **Phase 10: Settings Pages** - Options and language selection
- [ ] **Phase 11: Modal Dialogs** - Quit and pause overlays

## Phase Details

### Phase 1: Design Tokens

**Goal**: Establish CSS custom properties for colors, typography, and spacing that match mockup specifications
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):

1. Blue gradient backgrounds, orange/gold borders, and button colors (green/blue/orange) available as CSS variables
2. Display font styles with multi-layer text-shadow for embossed effect defined as CSS variables
3. Spacing scale derived from 1080x1920 mockup values accessible throughout app
4. Typography scales maintain readability at 360px width and 1024px width

**Plans:** 3 plans

Plans:

- [x] 01-01-PLAN.md - Install and configure UnoCSS for utility-first CSS
- [x] 01-02-PLAN.md - Enhance design-system.scss with mockup-specific tokens
- [x] 01-03-PLAN.md - Wire UnoCSS to SCSS tokens and verify system

### Phase 2: Design Utilities

**Goal**: Create reusable SCSS mixins for visual effects and responsive scaling functions
**Depends on**: Phase 1
**Requirements**: FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):

1. Glossy gradient mixin produces mockup-matching button appearance
2. Embossed border mixin creates 3D panel effect with inner glow
3. Multi-layer drop shadow mixin applies to text and panels
4. Responsive scaling utility converts mockup pixel values to clamp() with viewport units
5. All effects maintain performance (no jank on scroll)
   **Plans:** 2 plans

Plans:

- [x] 02-01-PLAN.md - Add responsive scaling utilities and shadow/glow mixins
- [x] 02-02-PLAN.md - Create glossy button and embossed panel mixins

### Phase 3: Core Layout Components

**Goal**: GamePanel and GameBackground components provide foundation for all screens
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-05
**Success Criteria** (what must be TRUE):

1. GamePanel renders with orange/gold border, rounded corners (18-24px), and inner glow
2. GameBackground applies blue radial gradient with spotlight effect
3. Components scale responsively from 320px to 1024px width
4. Components can be composed (panel inside background) without style conflicts
   **Plans**: 2 plans

Plans:

- [x] 03-01-PLAN.md - Create GameBackground component
- [x] 03-02-PLAN.md - Create GamePanel component

### Phase 4: Interactive Components

**Goal**: GameButton and GameDisplay provide styled interactive elements matching mockups
**Depends on**: Phase 2
**Requirements**: COMP-02, COMP-03
**Success Criteria** (what must be TRUE):

1. GameButton renders gradient (green primary, blue secondary, orange warning) with embossed 3D effect
2. Button responds to normal/hover/active/disabled states with appropriate visual feedback
3. Button press shows active state (inset appearance)
4. GameDisplay renders yellow/gold text with glow effect for scores and letters
5. Display text remains readable against busy backgrounds (4.5:1 contrast minimum)
   **Plans**: 2 plans

Plans:

- [x] 04-01-PLAN.md - Create GameButton component with gradient variants and 3D press effect
- [x] 04-02-PLAN.md - Create GameDisplay component with gold text and glow effect

### Phase 5: Structural Components

**Goal**: GameHeader, GameModal, and GameScrollList complete component library
**Depends on**: Phase 3, Phase 4
**Requirements**: COMP-04, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):

1. GameHeader applies decorative text effects to page titles
2. GameModal renders with colored header bar, backdrop, and centered positioning
3. Modal backdrop prevents interaction with underlying content
4. GameScrollList displays player/leaderboard cards with consistent styling
5. ScrollList handles 1-6 players without layout breaking
   **Plans**: 3 plans

Plans:

- [x] 05-01-PLAN.md - Create GameHeader and GameScrollList components
- [x] 05-02-PLAN.md - Create GameModal with focus trap
- [x] 05-03-PLAN.md - Verify structural components (visual + interaction)

### Phase 6: Splash & Navigation

**Goal**: Splash screen and main menu visually match mockups and provide entry to app
**Depends on**: Phase 5
**Requirements**: PAGE-01, PAGE-02
**Success Criteria** (what must be TRUE):

1. Splash screen displays "RIDDLE RUSH" title with 3D text effect
2. Loading bar animates at bottom of splash screen
3. Main menu shows PLAY/MENU/OPTIONS/CREDITS buttons stacked vertically
4. No coins or profile avatar visible on main menu
5. Buttons respond to touch/click with visual feedback
6. Navigation from splash to menu works smoothly (300-400ms transition)
   **Plans**: 2 plans

Plans:

- [x] 06-01-PLAN.md — Create splash.vue page with animated loading and auto-navigation
- [x] 06-02-PLAN.md — Refactor index.vue main menu to use GameButton components

### Phase 7: Player Setup

**Goal**: Players page matches mockup for configuring game participants
**Depends on**: Phase 5
**Requirements**: PAGE-03
**Success Criteria** (what must be TRUE):

1. Player count stepper (+/-) adjusts from 1 to 6 players
2. Name input fields display with placeholder text and mockup styling
3. Input fields appear/disappear when player count changes
4. START GAME button is styled and positioned as in mockup
5. No coins visible on players page
   **Plans**: 2 plans

Plans:

- [x] 07-01-PLAN.md — Rebuild players page layout, stepper, and inputs
- [x] 07-02-PLAN.md — Verify players page against mockup requirements

### Phase 8: Core Gameplay

**Goal**: Game page matches alphabet.png mockup for primary gameplay screen (critical path)
**Depends on**: Phase 5
**Requirements**: PAGE-04
**Success Criteria** (what must be TRUE):

1. Round indicator displays centered below header
2. Category panel has two-part design (orange header + cream body)
3. Large letter displays with 3D blue styling
4. Text input styled to fit theme (required for multiplayer)
5. Back button positioned top-left
6. NEXT button matches mockup green glossy styling
   **Plans**: 2 plans

Plans:

- [x] 08-01-PLAN.md — Refactor game page layout and styling to match mockup
- [x] 08-02-PLAN.md — Verify game page against mockup requirements

### Phase 9: Game Results

**Goal**: Scoring and leaderboard pages display game outcomes matching mockups
**Depends on**: Phase 5
**Requirements**: PAGE-05, PAGE-06
**Success Criteria** (what must be TRUE):

1. Scoring page shows player cards with name and score
2. Green +pts indicators display for correct answers
3. Red -pts indicators display for incorrect/skipped answers
4. NEXT ROUND button styled as in mockup
5. Leaderboard displays "Ranking" header
6. Crown icons appear for positions 1-3
7. Numbered badges appear for positions 4-6
8. Player names and scores align consistently
9. No coins visible on either page
   **Plans**: 2 plans

Plans:

- [x] 09-01-PLAN.md — Create GamePlayerCard component and scoring page with score indicators
- [x] 09-02-PLAN.md — Refactor leaderboard page to use GameScrollList with rank badges

### Phase 10: Settings Pages

**Goal**: Settings and language pages match mockups for app configuration
**Depends on**: Phase 5
**Requirements**: PAGE-07, PAGE-08
**Success Criteria** (what must be TRUE):

1. Settings page displays "OPTIONS" title in styled header
2. Sound/Music sliders have custom styled track and thumb
3. Slider values update visually when adjusted
4. OK button matches mockup styling
5. Language page displays "LANGUAGE" title in panel
6. English/German rows show flag icons with checkmark for selected language
7. Language selection updates when row clicked
8. OK button returns to previous screen
   **Plans**: 2 plans

Plans:

- [ ] 10-01-PLAN.md — Create GameSlider component and refactor settings page
- [ ] 10-02-PLAN.md — Refactor language page with emoji flags and selection checkmark

### Phase 11: Modal Dialogs

**Goal**: Quit and pause modals match mockups for in-game overlays
**Depends on**: Phase 5
**Requirements**: MODAL-01, MODAL-02
**Success Criteria** (what must be TRUE):

1. Quit modal displays red header bar with "QUIT GAME" title
2. Confirmation text asks "Are you sure you want to quit game?"
3. NO button styled red, YES button styled green
4. Pause modal displays blue header with "Game Paused"
5. Resume message appears below header
6. Resume button (green), Restart button (blue), Home button (orange) display stacked
7. Clicking outside modal does not dismiss it
8. Modal backdrop dims background content
   **Plans**: TBD

Plans:

- TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11

| Phase                     | Plans Complete | Status      | Completed  |
| ------------------------- | -------------- | ----------- | ---------- |
| 1. Design Tokens          | 3/3            | Complete    | 2026-01-31 |
| 2. Design Utilities       | 2/2            | Complete    | 2026-01-31 |
| 3. Core Layout Components | 2/2            | Complete    | 2026-02-01 |
| 4. Interactive Components | 2/2            | Complete    | 2026-02-01 |
| 5. Structural Components  | 3/3            | Complete    | 2026-02-01 |
| 6. Splash & Navigation    | 2/2            | Complete    | 2026-02-01 |
| 7. Player Setup           | 2/2            | Complete    | 2026-02-01 |
| 8. Core Gameplay          | 2/2            | Complete    | 2026-02-01 |
| 9. Game Results           | 2/2            | Complete    | 2026-02-01 |
| 10. Settings Pages        | 0/2            | Not started | -          |
| 11. Modal Dialogs         | 0/TBD          | Not started | -          |
