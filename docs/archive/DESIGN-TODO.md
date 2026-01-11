# Design TODO List

This document tracks design assets and pages that need to be created, updated, or implemented.

**Last Updated**: 2025-12-30
**Status**: Fortune wheel implemented, MVP flow verified, mobile optimizations completed

---

## 📱 MVP Scope Changes (December 2025)

The following UI elements have been **hidden or removed for MVP** to focus on core gameplay:

### Hidden for MVP

- **Coin System** - All coin displays and coin bars removed from:
  - Main menu top bar
  - Alphabet selection page
  - Settings page assets (designed but not shown)
  - Profile page assets (designed but not shown)
  - _Reason_: Coin/currency system not implemented yet, will be added post-MVP

### Removed for MVP

- **EXIT Button** - Main menu EXIT button (X icon) commented out
  - _Reason_: Caused positioning issues, users can use browser back button
- **Menu Icon** - Main menu bottom-right menu icon removed
  - _Reason_: Overlapped with feedback button, simplified navigation

### Mobile Optimizations Completed ✅

- **Navbar** - Hidden on mobile (≤640px) to maximize screen space
- **Fortune Wheel** - Optimized for mobile display:
  - Title image hidden on small screens
  - Increased touch targets (50px buttons)
  - Responsive radius (140px mobile, 180px desktop)
  - Reduced scrolling requirement
- **Touch Targets** - All buttons verified ≥44x44px for mobile

---

## ✅ Completed Designs & Implementation

The following pages have complete design assets AND are fully implemented:

- **Splash Screen** (`pages/index.vue` splash overlay, `public/assets/splash/`)
- **Main Menu** (`pages/index.vue`, `public/assets/main-menu/`)
- **Language Selection** (`pages/language.vue`, `public/assets/language/`)
- **Alphabet Selection (Fortune Wheel)** (`pages/alphabet.vue`, `public/assets/alphabets/`)
- **Players Management** (`pages/players.vue`, `public/assets/players/`)
- **Scoring/Results** (`pages/results.vue`, `public/assets/scoring/`)
- **Leaderboard** (`pages/leaderboard.vue`, `public/assets/leaderboard/`)
- **Win Screen** (`pages/win.vue`, `public/assets/win/`)

---

## 🚧 Pages/Modals Needing Implementation (Design Complete, Code Missing)

### 1. Settings Page ⚠️ HIGH PRIORITY

- **Design Location**: `docs/gfx/settings/`, `public/assets/settings/`
- **Status**: ❌ Page does not exist (`pages/settings.vue` not found)
- **Assets Available**:
  - ✅ Background (`BACKGROUND.png`)
  - ✅ Settings title (`settings.png`)
  - ✅ Music toggle button (`Music.png`, `musical-note.png`)
  - ✅ Sound toggle button (`Sound.png`, `volume.png`)
  - ✅ Volume slider bars (`sound low bar.png`)
  - ✅ OK button (`ok buttton.png`, `OK.png`)
  - ✅ Back button (`back.png`)
  - ✅ Coin bar (`COIN BAR.png`, `100.png`) - _Hidden for MVP_
  - ✅ Options button (`options.png`)
- **Implementation Needed**:
  - Create `/pages/settings.vue`
  - Integrate with settings store (`stores/settings.ts`)
  - Add music on/off toggle
  - Add sound effects on/off toggle
  - Add volume slider control
  - Connect "Options" button in main menu to `/settings` route

### 2. Profile Page ⚠️ MEDIUM PRIORITY

- **Design Location**: `docs/gfx/profile/`, `public/assets/profile/`
- **Status**: ❌ Page does not exist (`pages/profile.vue` not found)
- **Assets Available**:
  - ✅ Background (`BACKGROUND.png`)
  - ✅ Profile title (`profile.png`, `profile-1.png`)
  - ✅ Camera icon (`camera.png`)
  - ✅ Input field labels (`First Name_.png`, `Last Name_.png`, `Nickname_.png`, `Date of Birth_.png`)
  - ✅ Profile box/container (`box.png`)
  - ✅ OK button (`ok.png`)
  - ✅ Back buttons (`back.png`, `back-1.png`)
  - ✅ Coin bar (`COIN BAR.png`, `100.png`) - _Hidden for MVP_
  - ✅ Mockup reference (`profile mockup.png`)
- **Implementation Needed**:
  - Create `/pages/profile.vue`
  - Add user profile form
  - Add profile picture upload/selection functionality
  - Create profile store for user data
  - Connect "Profile" button in main menu to `/profile` route

### 3. Paused Modal/Overlay ⚠️ HIGH PRIORITY

- **Design Location**: `docs/gfx/paused/`, `public/assets/paused/`
- **Status**: ❌ Pause functionality not implemented
- **Assets Available**:
  - ✅ Background (`BACKGROUND.png`)
  - ✅ "Game Paused" title (`paused.png`)
  - ✅ Pause message (`game is paused press resume to continue.png`)
  - ✅ Resume button (`resume.png`)
  - ✅ Restart button (`restart.png`)
  - ✅ Home button (`home.png`)
  - ✅ Back button (`back.png`)
- **Implementation Needed**:
  - Create pause modal component (`components/PauseModal.vue`)
  - Add pause button to game page header (⋮ menu button already exists)
  - Implement pause/resume game logic in game store
  - Add keyboard shortcut for pause (ESC key)
  - Pause timer if timed mode exists

### 4. Quit Game Modal ⚠️ MEDIUM PRIORITY

- **Design Location**: `docs/gfx/quit game/`, `public/assets/quit/`
- **Status**: ❌ Quit confirmation not implemented
- **Assets Available**:
  - ✅ "QUIT GAME" title (`quit game.png`)
  - ✅ Confirmation message (`are you sure you want to quit.png`)
  - ✅ Yes button (`yes.png`)
  - ✅ No button (`no.png`)
  - ✅ Back button (`back.png`)
- **Implementation Needed**:
  - Create quit confirmation modal component (`components/QuitModal.vue`)
  - Trigger from game page back button or menu
  - Implement quit game logic (save progress, clear session, return to menu)
  - Add confirmation before navigating away from active game

---

## ❌ Missing Design Assets (Page Exists, Design Incomplete)

### 1. Main Gameplay Screen ⚠️ CRITICAL PRIORITY

- **Current File**: `pages/game.vue`
- **Status**: ⚠️ Implemented with basic CSS, missing design assets
- **Current Features**:
  - Header with back button (←), round/player info, menu button (⋮)
  - Category emoji and name display
  - Letter badge showing "Beginnt mit X"
  - Text input for answers ("Deine Antwort...")
  - Submit button (✓)
  - Skip button ("Überspringen →")
  - New Round button ("Neue Runde ↻")
  - Current turn player display
- **Design Assets MISSING** (need designer to create):
  - ❌ Background image/pattern for game page
  - ❌ Category card/container design (currently using simple card)
  - ❌ Letter badge custom design (currently using basic div)
  - ❌ Styled answer input field (currently plain textbox)
  - ❌ Submit button icon/design (currently plain ✓)
  - ❌ Skip/New Round button designs (currently plain buttons with arrows)
  - ❌ Visual feedback animation for correct answer (green flash, confetti, etc.)
  - ❌ Visual feedback animation for wrong answer (red flash, shake, etc.)
  - ❌ Multi-player turn indicator highlight design
  - ❌ "All players submitted" celebration card
  - ❌ Score popup animation design (+10 points, etc.)
  - ❌ Timer UI if timed mode is added

**Suggested Design Elements**:

- Background matching other pages' theme
- Category card with decorative frame similar to other screens
- Large letter badge with glow effect (similar to alphabet selection)
- Input field with themed border and focus state
- Animated submit button (pulse when enabled, disabled state)
- Celebratory animations for correct answers
- Player turn indicator with avatar frame/highlight

### 2. Credits Page

- **Current File**: `pages/credits.vue`
- **Status**: ⚠️ Implemented with basic styling, no design mockup
- **Current Features**:
  - Back button
  - Credits title
  - Team sections (Game Design, Programming, Art)
  - Team member names
- **Design Assets MISSING**:
  - ❌ Background image
  - ❌ Credits title design/logo
  - ❌ Team member card designs
  - ❌ Section headers design (Game Design, Programming, Art)
  - ❌ Back button styling (currently using win page assets)
  - ❌ Layout grid/positioning guide

### 3. About Page

- **Current File**: `pages/about.vue`
- **Status**: ⚠️ Basic implementation, needs design
- **Current Features**:
  - Game description
  - Features list
  - Back button
- **Design Assets MISSING**:
  - ❌ Background image
  - ❌ About title design
  - ❌ Feature icons/badges
  - ❌ Text content layout design
  - ❌ Back button styling

---

## 🎮 Multi-Player Design Elements Status

### ✅ Already Designed & Implemented

- Player slots with add/remove buttons (`pages/players.vue`)
- Round indicator in game header
- Player count display in game header
- Scoring page with multiple players (`pages/results.vue`)
- Leaderboard with rank badges 1-5 (`public/assets/leaderboard/`)

### ❌ Missing Multi-Player Designs

#### 1. Rank Badge for 6th Place

- **Location**: Leaderboard page
- **Current**: Only has rank badges 1-5 (`1.png`, `2.png`, `3.png`, `4.png`, `5.png`)
- **Needed**: `6.png` rank badge to support 6-player games

#### 2. Player Turn Indicator Highlight

- **Location**: Game page during multi-player
- **Current**: Simple text "Current Turn: Player 1"
- **Needed Design**:
  - Highlighted card showing active player
  - Player avatar/icon frame
  - Glow or border effect
  - Turn number indicator

#### 3. All Players Submitted Card

- **Location**: Game page when round completes
- **Current**: Basic card with button
- **Needed Design**:
  - Celebration/completion themed card
  - Success icon or checkmark
  - "All players submitted!" message design
  - Styled "Go to Scoring" button
  - Optional: Confetti animation

---

## 🔄 Design Review Needed

### 1. Button States & Interactions

**Review all buttons across pages for:**

- ✅ Normal state (exists for most buttons)
- ⚠️ Hover state (some buttons have `-1.png` variants, inconsistent)
- ❌ Active/pressed state (missing for most buttons)
- ⚠️ Disabled state (needed for submit, start, next buttons)
- ❌ Loading state (for async actions)

**Pages to review**: All pages, especially game, players, results

### 2. Input Field States

**Text input fields need:**

- ⚠️ Default state (basic styling exists)
- ❌ Focus state (highlight border, glow)
- ❌ Error state (red border for invalid input)
- ❌ Disabled state (grayed out)

**Found in**: game.vue (answer input)

### 3. Responsive Design Verification

**All pages need mobile/tablet testing:**

- ✅ Touch target sizes - Verified ≥44x44px for mobile (buttons optimized to 50px on alphabet page)
- ⚠️ Text readability (font sizes, contrast) - Needs comprehensive review
- ⚠️ Layout stacking (elements overlapping on small screens) - Needs testing on game/results pages
- ✅ Fortune wheel sizing - **Completed** (responsive 140px mobile, 180px desktop)
- ✅ Navbar - Hidden on mobile (≤640px) for better screen utilization

**Priority pages still needing mobile testing**: game, players, results

### 4. Accessibility

**Design considerations needed:**

- Color contrast ratios (WCAG AA compliance)
- Focus indicators for keyboard navigation
- Screen reader friendly element labeling
- High contrast mode support

---

## 🎨 Missing UI Components

### Loading States

- **Current**: Generic `components/Spinner.vue`
- **Needed**:
  - Branded loading spinner matching game theme
  - Page transition loading indicators
  - Button loading states (for async actions)
  - Skeleton screens for content loading

### Error States

- **Current**: No error state designs
- **Needed**:
  - Network error display (offline mode, API failure)
  - Category load failure screen
  - No results found state
  - Generic error modal/toast design

### Empty States

- **Current**: Basic "No entries" text
- **Needed**:
  - Empty leaderboard illustration
  - No players added yet (players page)
  - No game history (profile/stats)
  - Empty state icons/illustrations matching theme

### Notifications/Toasts

- **Needed**:
  - Success notification design
  - Error notification design
  - Info/warning notification design
  - Toast position and animation

---

## 📋 Animation & Sound Design

### Page Transitions (CSS/Animation Needed)

- Fade/slide between page navigation
- Modal slide-up/fade-in animations
- Button hover effects (scale, glow, shadow)
- Drawer/menu slide animations

### Game-Specific Animations (Need Design Specs)

- ✅ Fortune wheel spin (implemented in `alphabet.vue`)
- ❌ Correct answer celebration (confetti, score popup)
- ❌ Wrong answer feedback (shake, red flash)
- ❌ Score count-up animation
- ❌ Leaderboard entry reveal animation
- ❌ Round complete transition
- ❌ Level up/achievement popup

### Sound Design Integration (Audio Files Needed)

- ❌ Button click sound
- ❌ Correct answer chime
- ❌ Wrong answer buzz
- ❌ Round complete fanfare
- ❌ Background music track (optional, toggleable)
- ❌ Achievement unlock sound
- ❌ Menu navigation sound

**Note**: Settings page has music/sound toggle UI ready, waiting for audio files

---

## 🚀 Implementation Priority

### 🔴 Critical (Blocking MVP Completeness)

1. **Settings Page** - Users expect settings from main menu "Options" button
2. **Pause Modal** - Essential for game interruption handling
3. **Main Gameplay Screen Design** - Current implementation needs visual polish
4. **Game Visual Feedback** - Correct/wrong answer animations

### 🟡 High (Core Features)

5. **Quit Game Modal** - Prevent accidental game exits
6. **Profile Page** - Main menu "Profile" button currently broken
7. **Rank Badge #6** - Support full 6-player mode
8. **Error/Loading States** - Improve UX for edge cases

### 🟢 Medium (Polish & Enhancement)

9. **Credits Page Design** - Make credits visually appealing
10. **About Page Design** - Professional game info page
11. **Button States** - Hover/active/disabled consistency
12. **Multi-player UI Polish** - Turn indicators, submission cards

### 🔵 Low (Nice to Have)

13. **Animations** - Advanced effects and transitions
14. **Sound Effects** - Audio feedback library
15. **Empty States** - Illustrations for empty data
16. **Accessibility Improvements** - WCAG compliance

---

## 📂 Asset Organization & Naming

### Current Structure

```
docs/gfx/           # Original design files (Photoshop/AI exports)
  ├── Main Menu/
  ├── alphabets/
  ├── language/
  ├── Leaderboard/
  ├── paused/
  ├── players/
  ├── profile/
  ├── quit game/
  ├── scoring/
  ├── settings/
  ├── splash/
  └── you win/

public/assets/      # Production-ready assets
  ├── main-menu/
  ├── alphabets/
  ├── language/
  ├── leaderboard/
  ├── paused/
  ├── players/
  ├── profile/
  ├── quit/
  ├── scoring/
  ├── settings/
  ├── splash/
  └── win/
```

### Naming Convention Issues

- ⚠️ Inconsistent folder naming (`Main Menu` vs `main-menu`, `quit game` vs `quit`)
- ⚠️ Mixed capitalization in filenames (`BACKGROUND.png`, `back.png`, `ok buttton.png`)
- ⚠️ Typos in asset names (`ok buttton.png` should be `ok button.png`)
- ⚠️ Unclear naming (`profile-1.png`, `back-1.png` - what's the variant?)

### Recommended Naming Standards

1. **Folders**: Use kebab-case consistently (`main-menu`, `quit-game`, `you-win`)
2. **Files**: Use descriptive lowercase with hyphens (`background.png`, `ok-button.png`)
3. **Variants**: Use suffixes for states (`button-normal.png`, `button-hover.png`, `button-disabled.png`)
4. **Avoid**: Generic names (`1.png`, `2.png`), typos, mixed cases

---

## 📝 Notes for Designer

### Technical Specifications

- **Base Resolution**: 1920x1080 for desktop, scale down for mobile
- **Format**: PNG with transparency for UI elements
- **Compression**: Optimize for web (use tools like TinyPNG, ImageOptim)
- **Naming**: Clear, descriptive names matching functionality
- **Organization**: Group related assets in folders by page/feature
- **Sprite Sheets**: Consider for small icons to reduce HTTP requests

### Current Design System (Extracted from Existing Assets)

- **Color Palette**:
  - Primary: Purple/blue gradients (#667eea, #764ba2)
  - Accent: Gold/yellow (#FFD700)
  - Background: Dark navy (#1a1a2e)
  - Text: White/light gray
- **Typography**:
  - Display: Poppins (game titles, headings)
  - Body: Inter (UI text, descriptions)
  - Sizes: Responsive with clamp() (mobile-first)
- **Button Style**:
  - Rounded corners
  - 3D effect with drop shadows
  - Hover states with scale/glow
  - Image-based (not CSS-only)
- **Spacing**:
  - Consistent padding using CSS variables
  - `var(--spacing-sm)`, `--spacing-md`, `--spacing-lg`, etc.

### Multi-Player Design Considerations

- **Player Count**: Support 2-6 players simultaneously
- **Scalability**: UI elements should stack/grid gracefully
- **Visual Distinction**: "Active player" must stand out clearly
- **Readability**: Scores, names must be legible at a glance
- **Touch Targets**: Minimum 44x44px for mobile buttons

---

## ✨ Future Design Scope (Not Currently Needed)

These features are not yet implemented and don't need designs immediately:

- Achievements/badges system
- Player statistics dashboard
- Difficulty level selection UI
- Timed mode countdown timer
- Online multiplayer lobby
- Daily challenge cards
- Seasonal theme variants
- Dark/light mode toggle
- Custom avatar upload/selection
- Team mode (2v2, 3v3)

**Design these only if/when development roadmap includes them.**

---

## 🎯 Quick Action Checklist for Designer

### Immediate Actions (This Week)

- [ ] Create Settings page mockup and export assets
- [ ] Create Profile page mockup and export assets
- [ ] Create Pause modal overlay design
- [ ] Create Quit confirmation modal design
- [ ] Design main gameplay screen (game.vue) with all UI elements
- [ ] Create correct/wrong answer animation specs
- [ ] Design rank badge #6 for leaderboard

### Next Sprint

- [ ] Create Credits page design
- [ ] Create About page design
- [ ] Design button states (hover, active, disabled) for all buttons
- [ ] Create loading spinner with game branding
- [ ] Design error/empty state illustrations
- [ ] Create notification/toast component designs

### Polish Phase

- [ ] Define animation timing and easing curves
- [ ] Create sound effect specifications
- [ ] Design advanced transitions and microinteractions
- [ ] Review accessibility (contrast, focus states)
- [ ] Create design system documentation

---

**Document Maintained By**: Claude Sonnet 4.5
**Next Review Date**: After settings/profile/pause/quit implementation
