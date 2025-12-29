# Design TODO List

This document tracks design assets and pages that need to be created, updated, or implemented by the designer.

## ✅ Completed Designs (Assets Available in `docs/gfx/`)

The following pages have complete design assets:

- **Splash Screen** (`docs/gfx/splash/`)
- **Main Menu** (`docs/gfx/Main Menu/`)
- **Language Selection** (`docs/gfx/language/`)
- **Alphabet Selection** (`docs/gfx/alphabets/`)
- **Players Management** (`docs/gfx/players/`)
- **Scoring/Results** (`docs/gfx/scoring/`)
- **Leaderboard** (`docs/gfx/Leaderboard/`)
- **Win Screen** (`docs/gfx/you win/`)
- **Settings Modal** (`docs/gfx/settings/`)
- **Profile Page** (`docs/gfx/profile/`)
- **Paused Modal** (`docs/gfx/paused/`)
- **Quit Game Modal** (`docs/gfx/quit game/`)

---

## 🚧 Pages Needing Implementation (Design Exists, Page Doesn't)

### 1. Settings Page
- **Design Location**: `docs/gfx/settings/`
- **Status**: Design complete, page not implemented
- **Assets Available**:
  - Background
  - Settings title
  - Music toggle button with musical note icon
  - Sound toggle button with volume icon
  - Volume slider bars
  - OK button
  - Back button
  - Coin bar
- **Implementation Needed**:
  - Create `/pages/settings.vue`
  - Integrate with settings store
  - Add music on/off functionality
  - Add sound effects on/off functionality
  - Add volume slider control

### 2. Profile Page
- **Design Location**: `docs/gfx/profile/`
- **Status**: Design complete, page not implemented
- **Assets Available**:
  - Background
  - Profile title
  - Camera icon for profile picture
  - Input fields: First Name, Last Name, Nickname, Date of Birth
  - Profile box/container
  - OK button
  - Back button
  - Coin bar (100 coins)
- **Implementation Needed**:
  - Create `/pages/profile.vue`
  - Add user profile form
  - Add profile picture upload functionality
  - Integrate with user settings/profile store

### 3. Paused Modal/Screen
- **Design Location**: `docs/gfx/paused/`
- **Status**: Design complete, not implemented
- **Assets Available**:
  - Background
  - "Game Paused" title
  - "Game is paused, press resume to continue" message
  - Resume button
  - Restart button
  - Home button
  - Back button
- **Implementation Needed**:
  - Create pause functionality in game page
  - Create modal/overlay component
  - Implement pause/resume game logic
  - Add pause button to game header

### 4. Quit Game Modal
- **Design Location**: `docs/gfx/quit game/`
- **Status**: Design complete, not implemented
- **Assets Available**:
  - "QUIT GAME" title
  - "Are you sure you want to quit game?" message
  - Yes button
  - No button
  - Back button
- **Implementation Needed**:
  - Create quit confirmation modal component
  - Add quit button to game/menu
  - Implement quit game logic (clear session, return to menu)

---

## ❌ Missing Design Assets (Page Exists, No Design)

### 1. Main Gameplay Screen
- **Current File**: `/pages/game.vue`
- **Status**: Implemented with custom CSS, no design mockup available
- **Current Features**:
  - Category and letter display
  - Text input for answers
  - Submit button
  - Attempts counter
  - Back button
  - Score display (single-player)
  - Round/Players display (multi-player)
- **Design Needed**:
  - Background image/pattern
  - Category display card design
  - Letter badge/display design
  - Answer input field design (styled text box)
  - Submit button design
  - Attempts/score display design
  - Visual feedback for correct/wrong answers
  - Multi-player turn indicator design
  - "All players submitted" card design

### 2. Credits Page
- **Current File**: `/pages/credits.vue`
- **Status**: Implemented with custom CSS, no design mockup
- **Design Needed**:
  - Background
  - Credits title
  - Team member cards design
  - Developer/designer attribution styling
  - Back button (styled)

### 3. About Page
- **Current File**: `/pages/about.vue`
- **Status**: Basic implementation, needs design
- **Design Needed**:
  - Background
  - About/info layout design
  - Text content styling
  - Back button

### 4. Home/Index Page
- **Current File**: `/pages/index.vue`
- **Status**: Implemented but may need design review
- **Design Needed**:
  - Verify if current design matches intent
  - Category cards design review
  - Navigation elements review

---

## 🎮 Multi-Player Specific Design Elements Needed

The following elements were added for multi-player support and need design assets:

### 1. Player Turn Indicator
- **Location**: Game page during multi-player mode
- **Current**: Simple card with player name
- **Needed**: Styled card showing whose turn it is
  - Player avatar/icon
  - Player name with highlight
  - Turn number indicator
  - Animation/glow effect to draw attention

### 2. All Players Submitted Card
- **Location**: Game page when all players complete round
- **Current**: Basic card with "Go to Scoring" button
- **Needed**: Celebration/completion card design
  - Success/checkmark icon
  - "All players submitted!" message
  - Styled "Go to Scoring" button
  - Confetti or celebration animation (optional)

### 3. Multi-Player Score Adjustments (Results Page)
- **Location**: Results/scoring page
- **Current**: Using generic add/minus buttons
- **Review Needed**: Verify if current design works for multiple players
  - Player score card layout for 2-6 players
  - +/- buttons design (currently using `add.png` and `minus.png`)
  - Player answer display

### 4. Multi-Player Leaderboard Elements
- **Location**: Leaderboard page
- **Current**: Using existing rank badges (1.png, 2.png, 3.png, 4.png, 5.png)
- **Additions Needed**:
  - Rank badge for 6th place (only has 1-5)
  - Round completion indicator design
  - "Next Round" button design (currently plain)
  - "End Game" button design (currently plain)
  - Round number display (e.g., "Round 2 Complete!")

---

## 🔄 Design Review/Improvements Needed

### 1. Responsive Design
- **All Pages**: Verify mobile responsiveness
- **Priority Pages**: Game, Players, Results, Leaderboard
- **Elements to Check**:
  - Touch target sizes for mobile
  - Layout stacking on small screens
  - Font sizes and readability

### 2. Accessibility
- **Color Contrast**: Review text readability on backgrounds
- **Focus States**: Design for keyboard navigation focus indicators
- **Button States**: Hover, active, disabled states for all buttons

### 3. Loading States
- **Current**: Generic spinner component
- **Needed**: Branded loading animations for:
  - Game data loading
  - Category fetching
  - Page transitions

### 4. Error States
- **Current**: No error state designs
- **Needed**:
  - Network error display
  - Category load failure
  - No results found

### 5. Empty States
- **Needed**:
  - No players added yet (players page)
  - No score history (profile/stats)
  - No leaderboard entries

---

## 📋 Animation & Interaction Design

### Transitions Needed
1. **Page Transitions**: Smooth fade/slide between pages
2. **Button Hover/Press**: Scale, glow, or shadow effects
3. **Modal Animations**: Slide-up, fade-in for modals
4. **Success/Error Feedback**: Animations for correct/wrong answers
5. **Score Animations**: Count-up animation for score changes
6. **Leaderboard Animations**: Entry appearance, ranking changes

### Sound Design Integration
- Button click sounds
- Correct answer chime
- Wrong answer buzz
- Round complete fanfare
- Level up/achievement sounds

---

## 🎨 Asset Organization

### Current Structure
```
docs/gfx/           # Original design files (Photoshop/Figma exports)
public/assets/      # Production-ready assets (used in app)
```

### Naming Conventions
- Use kebab-case for folder names: `main-menu`, `quit-game`, `you-win`
- Use descriptive names for assets: `BACKGROUND.png`, `add-button.png`
- Consistent capitalization (currently mixed - consider standardizing)

### Missing Asset Variants
Some assets may need additional states:
- Buttons: normal, hover, active, disabled
- Toggle switches: on/off states
- Input fields: default, focus, error, disabled

---

## 🚀 Priority Recommendations

### High Priority (Core Multi-Player Experience)
1. ✅ Multi-player leaderboard rank badges (6th place)
2. ✅ Player turn indicator card design
3. ✅ "All submitted" completion card
4. ✅ Main gameplay screen design (answer input, category display)
5. ✅ Pause modal implementation

### Medium Priority (Polish & Features)
6. Settings page implementation
7. Profile page implementation
8. Quit game modal implementation
9. Credits page design
10. Loading and error states

### Low Priority (Nice to Have)
11. Advanced animations
12. Sound effect design
13. Empty state illustrations
14. Achievement/badge designs

---

## 📝 Notes for Designer

### Technical Specifications
- **Resolution**: Design for 1920x1080 base, scale down for mobile
- **Format**: PNG with transparency for UI elements
- **File Size**: Optimize for web (compress PNGs, use appropriate resolution)
- **Naming**: Clear, descriptive names matching functionality
- **Organization**: Group related assets in folders by page/feature

### Current Design System
- **Color Palette**: Extract from existing designs (appears to use blues, purples, yellows)
- **Typography**: Current fonts appear to be Poppins and Inter (verify)
- **Button Style**: Rounded, 3D effect with shadows and hover states
- **Spacing**: Consistent padding and margins (review existing pages)

### Multi-Player Specific Considerations
- Design should accommodate 2-6 players
- Elements should scale/stack gracefully
- Consider visual distinction for "active player" vs "waiting players"
- Score displays should be clear and easy to read quickly

---

## ✨ Future Design Considerations

### Potential Features (Not Yet Implemented)
- Achievements/badges system
- Player statistics/history dashboard
- Difficulty levels (easy/medium/hard)
- Timed mode
- Multiplayer online (vs local)
- Daily challenges
- Seasonal themes

---

**Last Updated**: 2025-12-29
**Updated By**: Claude Sonnet 4.5
**Status**: Multi-player support implemented, design assets review in progress
