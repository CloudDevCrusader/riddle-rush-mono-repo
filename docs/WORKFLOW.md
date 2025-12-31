# Game Workflow Documentation

This document maps the game workflow from the design document (Riddle Rush App.pdf) to the application screens and components.

> **Note:** This document describes the complete design vision. For **MVP scope changes** (coins hidden, navbar removed on mobile, etc.), see [DESIGN-TODO.md](./DESIGN-TODO.md) and [MVP-TASKS.md](./MVP-TASKS.md).

## Complete Game Flow

### 1. App Launch → Splash Screen
**Screen:** `components/SplashScreen.vue`
**Design Assets:** `docs/gfx/splash/`
**Features:**
- Display logo (LOGO.png)
- Show loading bar animation (loading top.png, loading down.png, LOADING_.png)
- Background (background.png)
- Auto-proceed after loading completes (2-3 seconds)

**Navigation:** → Main Menu (first time: → Language Selection)

---

### 2. Language Selection (First Time Only)
**Screen:** `pages/language.vue`
**Design Assets:** `docs/gfx/language/`
**Features:**
- Background (BACKGROUND.png)
- Language title (LANGUAGE.png)
- English flag button (Eng Flag.png)
- German flag button (German Flag.png)
- Language selection buttons (Language button.png)
- Checkmark for selected language (mark.png)
- OK button to confirm (OK.png)
- Back button (back.png)

**Navigation:** → Main Menu

---

### 3. Main Menu
**Screen:** `pages/index.vue` (needs redesign) or new `pages/menu.vue`
**Design Assets:** `docs/gfx/Main Menu/`
**Features:**
- Background (BACKGROUND.png)
- Logo (LOGO.png)
- Coin bar/score display (COIN BAR.png, 100.png)
- Profile icon (profile icon.png)
- Main buttons:
  - PLAY button (PLAY.png, PLAY-1.png hover state)
  - OPTIONS button (OPTIONS.png, OPTION.png hover)
  - CREDITS button (CREDITS.png, CREDITS-1.png hover)
  - EXIT button (EXIT.png)
- Menu icon (MENU.png, MENU-1.png)

**Navigation:**
- PLAY → Player Management
- OPTIONS → Settings
- CREDITS → Credits Page
- EXIT → Quit Confirmation Dialog

---

### 4. Settings
**Screen:** `pages/settings.vue` (needs creation)
**Design Assets:** `docs/gfx/settings/`
**Features:**
- Background (BACKGROUND.png)
- Settings title (options.png)
- Sound/Music controls:
  - Music label (Music.png) with icon (musical-note.png)
  - Sound label (Sound.png) with icon (volume.png)
  - Volume sliders (sound low bar.png, button.png)
- OK button (OK.png, ok buttton.png)
- Back button (back.png)
- Coin bar (COIN BAR.png, 100.png)

**Navigation:** ← Back to Main Menu

---

### 5. Player Management
**Screen:** `pages/players.vue` (needs creation)
**Design Assets:** `docs/gfx/players/`
**Features:**
- Background (BACKGROUND.png)
- Players title (players.png)
- Player list with scroll (scroll bar.png, screoll.png)
- Add player button (add.png, add back.png)
- Remove player button (minus.png)
- Player entry (Group 10.png, top.png)
- Start game button (start.png)
- Back button (back.png)

**Navigation:**
- START → Category Selection (current index.vue categories) OR → Alphabet Selection
- BACK → Main Menu

---

### 6. Category Selection
**Screen:** Current `pages/index.vue` categories section (keep as-is or integrate)
**Features:**
- Grid of available categories
- Each category shows icon and name
- Select category to start game

**Navigation:** → Alphabet Selection OR → Game (if random letter)

---

### 7. Alphabet/Letter Selection
**Screen:** `pages/alphabet.vue` (needs creation)
**Design Assets:** `docs/gfx/alphabets/`
**Features:**
- Background (BACKGROUND.png, back.png)
- Alphabet title (alphabet.png)
- Category display (CATEGORY.png)
- Letter selection buttons (a.png, animal.png examples)
- Round indicator (ROUND 01.png)
- Coin bar (COIN BAR.png)
- Next button (next.png)
- Back button (back-1.png, back.png)

**Navigation:**
- NEXT → Game Screen
- BACK → Category Selection

---

### 8. Game Screen
**Screen:** `pages/game.vue` (existing)
**Features:**
- Show selected category and letter
- Text input for player answer
- Timer/round counter
- Score display
- Pause button → Pause Menu Dialog

**Navigation:**
- PAUSE → Pause Menu Dialog
- Time up/Complete → Win Screen OR Scoring Screen

---

### 9. Pause Menu (Dialog)
**Component:** `components/PauseMenu.vue` (needs creation)
**Design Assets:** `docs/gfx/paused/`
**Features:**
- Background overlay (BACKGROUND.png)
- "Game Paused" title (Game Paused.png)
- Message (Game is paused, press resume to continue_.png)
- Resume button (Resume.png)
- Restart button (Restart.png)
- Home button (Home.png)
- Back button (back.png)

**Navigation:**
- RESUME → Return to Game
- RESTART → Restart current game
- HOME → Main Menu

---

### 10. Win Screen
**Screen:** `pages/win.vue` (needs creation)
**Design Assets:** `docs/gfx/you win/`
**Features:**
- Background (BACKGROUND.png)
- "You Win" title (you-win.png)
- Pop-up card (pop up.png)
- Score display (score bar.png)
- Star ratings (Star.png, Star copy.png)
- Next button (next.png)
- Home button (home.png)
- Back button (back.png)

**Navigation:**
- NEXT → Next Round OR Scoring Screen
- HOME → Main Menu

---

### 11. Scoring Screen
**Screen:** `pages/results.vue` or `pages/scoring.vue` (needs update)
**Design Assets:** `docs/gfx/scoring/`
**Features:**
- Background (BACKGROUND.png, back.png)
- Scoring title (scoring.png)
- Player scores list (scroll bar.png, screoll.png)
- Score entries (Shape 2.png, xyz.png, add.png, add back.png, minus.png)
- Next button (next.png)
- Back buttons (back-1.png, back.png)

**Navigation:**
- NEXT → Leaderboard
- BACK → Main Menu

---

### 12. Leaderboard
**Screen:** `components/Leaderboard.vue` or `pages/leaderboard.vue` (needs update)
**Design Assets:** `docs/gfx/Leaderboard/`
**Features:**
- Leaderboard title (leaderboard.png, leaderbpard.png)
- Ranking display (ranking.png)
- Top positions (1.png, 2.png, 3.png, 4.png, 5.png, s.png)
- Score display (500.png, Group 8.png)
- Player names (tobi.png example)
- Scroll bar (scroll bar.png, screoll.png)
- Coin bar (COIN BAR.png)
- OK button (ok.png)
- Back buttons (back.png, add back.png)
- Layer decorations (Layer 12 copy 3.png)

**Navigation:** ← Back to Main Menu or Scoring Screen

---

### 13. Profile
**Screen:** `pages/profile.vue` (needs creation)
**Design Assets:** `docs/gfx/profile/`
**Features:**
- Background (BACKGROUND.png)
- Profile title (profile.png, profile-1.png)
- Profile photo area (box.png, camera.png)
- Input fields:
  - First Name (First Name_.png)
  - Last Name (Last Name_.png)
  - Nickname (Nickname_.png)
  - Date of Birth (Date of Birth_.png)
- OK button (ok.png)
- Back buttons (back.png, back-1.png)
- Coin bar (COIN BAR.png, 100.png)

**Navigation:** ← Back to Main Menu

---

### 14. Quit Game Confirmation (Dialog)
**Component:** `components/QuitDialog.vue` (needs creation)
**Design Assets:** `docs/gfx/quit game/`
**Features:**
- "QUIT GAME" title (QUIT GAME.png)
- Confirmation message (Are you sure you want to quit game_.png)
- Yes button (yes.png)
- No button (no.png)
- Back button (back.png)

**Navigation:**
- YES → Exit app (or return to main menu)
- NO → Return to previous screen

---

## Navigation Map

```
Splash Screen
    ↓
[First Time: Language Selection]
    ↓
Main Menu
    ├── PLAY → Players → Category → Alphabet → Game → [Pause Menu] → Win → Scoring → Leaderboard
    ├── OPTIONS → Settings
    ├── CREDITS → Credits
    ├── PROFILE → Profile
    └── EXIT → Quit Confirmation
```

## Assets Directory Structure

```
public/
  assets/
    splash/
    language/
    main-menu/
    settings/
    players/
    alphabets/
    paused/
    win/
    scoring/
    leaderboard/
    profile/
    quit/
```

## Implementation Priority

1. **Phase 1: Core Navigation** (Highest Priority)
   - Update Splash Screen with designs
   - Create/Update Main Menu
   - Update Language Selection
   - Create Settings page

2. **Phase 2: Game Setup Flow**
   - Create Players Management
   - Create Alphabet Selection
   - Wire up navigation to Game

3. **Phase 3: Game End Flow**
   - Create Pause Menu Dialog
   - Create Win Screen
   - Update Scoring Screen
   - Update Leaderboard

4. **Phase 4: Additional Features**
   - Create Profile page
   - Create Quit Dialog
   - Polish transitions and animations
