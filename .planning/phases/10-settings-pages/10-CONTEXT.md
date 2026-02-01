# Phase 10: Settings Pages - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Settings and language configuration pages matching mockups. Two separate pages:

1. **Settings page** - OPTIONS title, Sound/Music sliders with custom styling
2. **Language page** - LANGUAGE title, flag-based language selection with checkmark

This phase builds UI for configuring existing audio and i18n systems. No new audio assets or additional languages.

</domain>

<decisions>
## Implementation Decisions

### Slider Styling

- **Track gradient:** Claude's discretion on full gradient vs fill-up-to-thumb (interpret mockup)
- **Thumb design:** CSS recreation using gradients and shadows (no image assets)
- **Interaction:** Click anywhere on track to jump + drag support
- **Value display:** No numeric value shown (position-only feedback)
- **Design consistency:** Match GameButton styling from main menu

### Language Selection

- **Flag icons:** Emoji flags (🇬🇧 🇩🇪) - consistent with simple approach
- **Flag container:** Rounded rectangle container around emoji
- **Selection indicator:** ✓ checkmark icon inside square (not solid green square)
- **Unselected state:** Empty checkbox outline where checkmark would go
- **Selection feedback:** Subtle animation when switching (checkmark animates in, brief highlight)
- **Apply timing:** Language change applies on OK press, not immediately on row tap
- **Language list:** Design supports adding more languages (expandable, not hardcoded to 2)
- **Access:** Separate menu item on main menu (not nested under Settings)

### Audio Behavior

- **Sound vs Music:** Sound = SFX (button clicks, effects), Music = BGM (background music)
- **Preview sound:** Play a special preview 'ding' sound when adjusting Sound slider
- **Preview frequency:** Throttled while dragging (~500ms intervals)
- **Music on settings:** Keep playing so user can adjust in real-time
- **Persistence:** Settings persist to IndexedDB across sessions
- **Audio icons:** Emoji icons (🔊 for sound, 🎵 for music)
- **Mute indicator:** Speaker icon changes to muted state when slider at 0

### Navigation Flow

- **Menu access:** OPTIONS button on main menu opens Settings page
- **Language access:** Separate LANGUAGE button on main menu
- **OK behavior:** Navigate back to previous screen (not always to menu)
- **In-game access:** Settings accessible from pause menu during gameplay

### Claude's Discretion

- Exact slider track gradient implementation (full vs progressive fill)
- Exact animation timing and easing
- Muted icon design (🔇 emoji or custom)
- Error state handling

</decisions>

<specifics>
## Specific Ideas

- Design should be consistent with main menu GameButton components
- Use emoji for icons throughout (flags 🇬🇧🇩🇪, audio 🔊🎵) for simplicity
- Wooden barrel/peg style thumb via CSS gradients matching game aesthetic
- Special preview sound for testing volume (distinct 'ding' or 'pop')

</specifics>

<deferred>
## Deferred Ideas

- **Coin system:** User requested adding coins app-wide. This is a new capability requiring coin display component, earning mechanics, and spending logic. Recommend as separate phase after visual redesign.
- **New sound assets:** User mentioned "create some iconic sounds for ingame" - this is audio production work, separate from settings UI.

</deferred>

---

_Phase: 10-settings-pages_
_Context gathered: 2026-02-01_
