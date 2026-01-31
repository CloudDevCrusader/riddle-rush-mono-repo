# Feature Landscape: Mobile Casual Game UI Visual Elements

**Domain:** Mobile casual game UI redesign (Nuxt 4 PWA)
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

Mobile casual game UIs in 2026 prioritize clarity over decoration, responsiveness over fixed layouts, and accessibility over aesthetics. The shift from flashy skeuomorphism to functional polish means: gradients add depth without overwhelming, animations communicate state rather than impress, and touch targets are generous. For a word-guessing game PWA, table stakes include glossy gradient buttons, rounded panel cards, readable typography with contrast enhancements, smooth transitions between states, and responsive scaling from phones to tablets.

This research categorizes visual UI features into three tiers: table stakes (must-have for polished game feel), differentiators (nice touches that elevate quality), and anti-features (patterns to deliberately avoid). All recommendations are based on 2026 mobile game UI trends, accessibility standards (WCAG 2.2), and platform-specific guidelines (iOS, Android, PWA).

---

## Table Stakes

Features users expect in a polished mobile casual game UI. Missing these makes the product feel unfinished or unprofessional.

| Feature                                          | Why Expected                                               | Complexity | Notes                                                                                            | Dependencies               |
| ------------------------------------------------ | ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ | -------------------------- |
| **Gradient Buttons**                             | Standard in casual games for depth and visual interest     | Low        | Use 180deg linear gradients (light-to-dark, 2-color max). CSS `background: linear-gradient()`    | Color system               |
| **Glossy/Embossed Effect**                       | Communicates "tappable" affordance                         | Low        | Combine gradient with subtle `box-shadow` and inset highlight. Single `text-shadow` for text     | Gradient buttons           |
| **Rounded Corners (Panels)**                     | Softens UI, creates friendly feel expected in casual games | Low        | `border-radius: 18px-24px` for panels, `12-16px` for buttons                                     | Base component system      |
| **High-Contrast Typography**                     | Readability on colorful backgrounds is critical            | Medium     | 4.5:1 contrast ratio minimum (WCAG AA). Use `text-shadow` or text stroke for complex backgrounds | Color system               |
| **Touch Target Size (44x44pt min)**              | iOS HIG and accessibility requirement                      | Low        | Minimum 44x44pt (iOS), 48x48dp (Android). Use padding to expand tap area                         | Button components          |
| **Modal Dialogs with Backdrop**                  | Standard pattern for pause/quit/confirmations              | Low        | Semi-transparent dark overlay (rgba(0,0,0,0.5-0.7)) with centered rounded panel                  | Z-index system             |
| **Loading/Splash Screen**                        | Sets tone, covers asset loading time                       | Low        | Brand logo, loading bar, max 2-second display. Avoid blocking interactivity                      | PWA config                 |
| **Smooth Page Transitions**                      | Eliminates jarring cuts between screens                    | Medium     | CSS transitions (300-400ms) or View Transitions API. Use fade/slide patterns                     | Router integration         |
| **Responsive Layout (Phone to Tablet)**          | Single UI must work across 320px-1024px widths             | High       | Use relative units (vw, vh, clamp()), aspect ratio anchoring, safe area insets                   | Design system, breakpoints |
| **Visual Hierarchy via Size/Color**              | Guides user attention to primary actions                   | Low        | Primary buttons larger/brighter, secondary muted. 3-level hierarchy max                          | Color/typography system    |
| **Icon Consistency**                             | Unified visual language across UI                          | Low        | Single icon set (outline or filled, not mixed). Consistent size (24px-32px base)                 | Asset library              |
| **Card/Panel Drop Shadows**                      | Elevates UI elements above background, creates depth       | Low        | `box-shadow: 0 4px 12px rgba(0,0,0,0.15)` for moderate elevation                                 | Design system              |
| **Input Focus States**                           | Accessibility requirement for keyboard/screen reader users | Low        | Visible outline or border change on focus. Never `outline: none` without alternative             | Input components           |
| **Button States (Normal/Hover/Active/Disabled)** | Essential feedback for touch interactions                  | Low        | Normal (gradient), Hover (brightness +10%), Active (scale 0.95), Disabled (opacity 0.5)          | Button components          |

---

## Differentiators

Features that elevate quality and delight users. Not expected, but add polish and personality.

| Feature                              | Value Proposition                                                 | Complexity | Notes                                                                                              | Dependencies              |
| ------------------------------------ | ----------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- | ------------------------- |
| **Micro-Interactions on Tap**        | Reinforces action completion, adds juice                          | Medium     | Scale pulse (1.0 → 1.05 → 1.0) on tap, 150ms. Subtle haptic feedback on supported devices          | Animation system          |
| **Progress Bar Animations**          | Makes waiting feel shorter, reinforces game theme                 | Low        | Animated fill with gradient or stripes. Use CSS `@keyframes` or `<progress>` element               | Loading states            |
| **Leaderboard Crown/Badge Icons**    | Gamification visual reward for top players                        | Low        | Vector SVG icons (gold/silver/bronze). Position absolute on player cards                           | Icon library              |
| **Text Shadow/Stroke Outlines**      | Enhances readability over busy backgrounds without solid overlays | Low        | Multi-directional shadow: `-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black` | Typography system         |
| **Radial Gradient Backgrounds**      | Adds depth to screens without imagery                             | Low        | `radial-gradient(circle at 50% 35%, #start, #mid, #end)` for spotlight effect                      | Background system         |
| **Staggered List Animations**        | Polished entry for player lists, leaderboards                     | Medium     | Fade-in + slide-up with 50ms delay per item. Use Vue `<TransitionGroup>`                           | Animation utilities       |
| **Modal Enter/Exit Transitions**     | Smooth appearance/dismissal of dialogs                            | Medium     | Scale-fade in (0.9 → 1.0 opacity 0 → 1) over 250ms, backdrop fade over 200ms                       | Modal component           |
| **Elastic Button Press**             | Satisfying tactile feedback on tap                                | Low        | `transform: scale(0.95)` on press, spring easing on release                                        | Button components         |
| **Variable Font Sizing (clamp)**     | Fluid typography that scales smoothly across devices              | Medium     | `font-size: clamp(1.2rem, 3vw, 2.4rem)` for headings. Requires testing across breakpoints          | Typography system         |
| **Bento Grid Layouts**               | Organizes content (settings, player cards) without clutter        | Medium     | Rounded cards in grid with consistent gap spacing. CSS Grid with `auto-fit`                        | Layout system             |
| **Sound/Music Slider Customization** | Styled range inputs with gradient track and custom thumb          | High       | Replace default `<input type="range">` with custom CSS. Gradient fill on active portion            | Settings UI, CSS masking  |
| **Animated Background Elements**     | Subtle motion (floating shapes, particles) adds liveliness        | High       | CSS keyframe animations or canvas-based particles. Must be performant (GPU-accelerated)            | Performance budget        |
| **Empty State Illustrations**        | Friendly messaging when no data (e.g., no players added)          | Low        | Simple SVG illustration + helpful text. Avoid generic "no data" messages                           | Icon/illustration library |
| **Offline Mode Indicator**           | Reassures user PWA works offline                                  | Low        | Small badge or toast when offline detected. Use Service Worker registration status                 | PWA integration           |
| **Auto-Save Feedback**               | Visual confirmation data persisted (IndexedDB)                    | Low        | Subtle checkmark or toast on save. Avoid blocking modals                                           | Data persistence layer    |

---

## Anti-Features

Patterns to explicitly AVOID. Common mistakes in mobile game UIs that hurt UX or accessibility.

| Anti-Feature                                     | Why Avoid                                                                                    | What to Do Instead                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Hamburger Menu for Primary Navigation**        | Buries critical features, increases drop-off. Out of favor in 2026 for feature-rich apps     | Persistent bottom navigation bar with 3-5 tabs. Use icons + labels for clarity                           |
| **Excessive Animations (>300ms)**                | Creates lag perception on mid-range devices, annoys users who want speed                     | Animations 150-300ms max. Prioritize functional animations (state feedback) over decorative              |
| **Cluttered UI with >5 Elements Visible**        | Overwhelms small screens, creates decision paralysis                                         | One primary action per screen. Hide secondary options in modals/menus. Follow "one task, one screen"     |
| **Fixed Pixel Layouts**                          | Breaks on devices outside design resolution (1080x1920). Causes horizontal scroll or tiny UI | Use relative units (%, vw, rem), CSS clamp(), aspect ratio anchoring. Test 320px-1024px widths           |
| **Low Contrast Text (<3:1 ratio)**               | Fails accessibility, unreadable in sunlight (common mobile context)                          | 4.5:1 minimum (WCAG AA). Use text shadow/stroke on complex backgrounds. Test with contrast checker       |
| **Small Touch Targets (<44pt)**                  | Causes rage taps, frustration. Fails accessibility (WCAG 2.5.8)                              | 44x44pt minimum (iOS), 48x48dp (Android). Use padding to expand tap area without visual bulk             |
| **Auto-Playing Music/Sounds**                    | Violates user expectations, creates negative first impression                                | User-initiated only. Persist sound preferences to localStorage. Provide visible mute toggle              |
| **Blocking Splash Screens >2s**                  | Users abandon apps with long load times. PWA best practice                                   | Load critical assets only, defer non-critical. Show interactive UI as soon as possible (<2s)             |
| **Inconsistent UI Elements**                     | Breaks mental model, feels unprofessional                                                    | Single design system with reusable components. Same button styles, spacing, typography across app        |
| **Misleading Button Placement**                  | Dark pattern: swapping Yes/No positions to trick users into unwanted actions                 | Consistent button order: destructive actions (Delete, Quit) always on same side. Add confirmation delays |
| **Non-Vector Graphics for UI**                   | Blurry on high-DPI screens and when scaled                                                   | SVG for icons/illustrations. CSS for gradients/shapes. Reserve raster images for photos only             |
| **Parallax/3D Effects on Mobile**                | Performance drain, causes motion sickness in some users                                      | Subtle 2D animations only. Respect `prefers-reduced-motion` media query for accessibility                |
| **Complex Gestures (Swipe, Pinch, Multi-Touch)** | Discovery problem: users don't know gesture exists. Conflicts with browser gestures          | Tap-based interactions only. Gestures as shortcuts for visible button alternatives                       |
| **Flash of Unstyled Content (FOUC)**             | Unprofessional, breaks immersion                                                             | Inline critical CSS, use loading skeletons, ensure fonts load before render                              |
| **Infinite Scrolling Without Pagination**        | Impossible to reach footer, causes performance issues with long lists                        | Virtual scrolling for long lists (e.g., leaderboard). Provide "Load More" button alternative             |

---

## Feature Dependencies

Visual features build on each other. Implement foundation first.

```
FOUNDATION LAYER (Implement First)
├─ Design System (CSS Custom Properties)
│  ├─ Color Palette (primary, secondary, accent, neutral)
│  ├─ Typography Scale (clamp-based fluid sizing)
│  ├─ Spacing System (consistent margins, padding, gaps)
│  └─ Border Radius Values (consistent rounding)
│
├─ Base Components
│  ├─ Button (with states: normal, hover, active, disabled)
│  ├─ Panel/Card (rounded corners, shadow, responsive padding)
│  ├─ Modal (backdrop, enter/exit transitions, focus trap)
│  └─ Input (focus states, validation styling)
│
└─ Responsive System
   ├─ Breakpoints (phone, tablet, desktop)
   ├─ Safe Area Insets (notch handling)
   └─ Viewport Units (vw, vh, svh for mobile browsers)

VISUAL POLISH LAYER (Implement Second)
├─ Gradient System
│  ├─ Button Gradients (glossy/embossed effect)
│  ├─ Background Gradients (radial, linear)
│  └─ Panel Shadows (elevation hierarchy)
│
├─ Typography Enhancements
│  ├─ Text Shadow/Stroke (readability on complex backgrounds)
│  ├─ Variable Font Loading (performance optimization)
│  └─ Contrast Validation (automated testing)
│
└─ Icon Library
   ├─ SVG Sprite Sheet (single HTTP request)
   ├─ Consistent Sizing (24px, 32px, 48px)
   └─ Crown/Badge Variants (leaderboard rankings)

INTERACTION LAYER (Implement Third)
├─ Animations
│  ├─ Page Transitions (fade/slide, 300ms)
│  ├─ Micro-Interactions (button press, input focus)
│  └─ List Animations (staggered entry)
│
├─ Touch Feedback
│  ├─ Haptic Feedback (vibration API on supported devices)
│  ├─ Visual Feedback (scale, brightness change)
│  └─ Loading States (spinners, progress bars)
│
└─ Accessibility
   ├─ Focus Management (modal focus trap, skip links)
   ├─ Screen Reader Labels (ARIA attributes)
   └─ Reduced Motion Support (prefers-reduced-motion)
```

---

## MVP Recommendation

For a visual redesign to match mockups, prioritize table stakes first, then add 2-3 differentiators per screen.

### Phase 1: Foundation (All Screens)

1. Design system with CSS custom properties (colors, typography, spacing, radius)
2. Gradient button component with all states (normal, hover, active, disabled)
3. Rounded panel/card component with shadows
4. Responsive layout system with breakpoints
5. Typography with text shadows for readability
6. Touch target size validation (44x44pt minimum)

**Rationale:** Without foundation, every screen will require duplicate CSS. Build reusable components first.

### Phase 2: Core Screens (Match Mockups)

1. **Splash Screen** - Loading bar, brand logo, radial gradient background
2. **Main Menu** - Primary action buttons (Play, Settings, Language), glossy gradients
3. **Players Page** - Add/remove player controls, name input fields with focus states
4. **Game Page** - Category/letter display, text input, NEXT button, back button, round indicator
5. **Results/Scoring** - Player cards with +/- point indicators, gradient backgrounds
6. **Leaderboard** - Crown/badge icons, player ranking list, card layout

**Rationale:** These screens are the core game flow. Visual alignment here has highest user impact.

### Phase 3: Secondary Screens (Match Mockups)

1. **Settings Page** - Styled sound/music sliders, toggle switches
2. **Language Selector** - Flag icons with checkmark selection state
3. **Pause Modal** - Resume/Restart/Home buttons in styled card dialog
4. **Quit Modal** - YES/NO buttons, confirmation messaging

**Rationale:** Used less frequently. Can defer until core flow is polished.

### Phase 4: Differentiators (Polish)

1. Micro-interactions on button tap (scale pulse)
2. Staggered list animations (leaderboard, player list)
3. Modal enter/exit transitions (scale-fade)
4. Offline mode indicator (PWA context)
5. Progress bar animations (loading states)

**Rationale:** Nice-to-haves that elevate quality. Add after core visual alignment is complete.

### Defer to Post-MVP

- Animated background elements (performance risk)
- Complex custom sliders (high effort, low ROI for word game)
- Empty state illustrations (content-dependent)
- Advanced haptic feedback (limited browser support)

**Rationale:** These features have high complexity-to-value ratio for a word-guessing game. Focus on matching mockups first.

---

## Responsive Behavior on Mobile

Key strategies for scaling UI from phones to tablets while maintaining visual consistency.

### Aspect Ratio Strategy

- **Design base:** 1080x1920 (9:16 portrait, common mobile resolution)
- **Safe area:** Center 16:9 region contains critical UI (buttons, text)
- **Expansion zones:** Wider screens (tablets) expand horizontally, taller screens expand vertically
- **Anchoring:** Position UI elements relative to edges (top, bottom, sides) not center

### Scaling Approaches

| Element        | Phone (320-414px)           | Tablet (768-1024px)      | Method                                         |
| -------------- | --------------------------- | ------------------------ | ---------------------------------------------- |
| **Typography** | 16-24px base                | 18-28px base             | `clamp(1rem, 2.5vw, 1.75rem)` fluid sizing     |
| **Buttons**    | 44x44pt minimum             | 48x56pt comfortable      | Use `padding` to expand, not fixed height      |
| **Panels**     | 90% viewport width          | Max 600px width          | `width: min(90vw, 600px)` clamping             |
| **Spacing**    | 16px base gap               | 24px base gap            | `clamp(1rem, 3vw, 1.5rem)` for consistent feel |
| **Icons**      | 24px base                   | 32px base                | Relative sizing or sprite with multiple sizes  |
| **Modals**     | Full-screen on small phones | Centered card on tablets | Media query breakpoint at 600px                |

### Critical Breakpoints

1. **375px (iPhone SE)** - Minimum phone width. Test all touch targets fit.
2. **414px (iPhone Pro Max)** - Common large phone. Comfortable spacing.
3. **768px (iPad Portrait)** - Tablet start. Switch from full-width to max-width panels.
4. **1024px (iPad Landscape)** - Large tablet. Multi-column layouts possible.

### Testing Checklist

- [ ] UI scales without horizontal scroll on 320px width
- [ ] Touch targets remain 44x44pt at all sizes
- [ ] Typography remains readable (min 16px) at smallest breakpoint
- [ ] Gradients don't distort (use `background-size: cover`)
- [ ] Modals don't obscure critical UI on small screens
- [ ] Landscape orientation doesn't break layout (use svh units for height)

---

## Technical Implementation Notes

### CSS Architecture

- **Methodology:** Use CSS custom properties for design tokens, SCSS for mixins/functions
- **Naming:** BEM or utility-first (Tailwind-style) for consistency
- **Organization:** Separate files for variables, base, components, utilities, pages
- **Performance:** Inline critical CSS (above-fold), defer non-critical. Target <50KB total CSS.

### Animation Performance

- **GPU Acceleration:** Animate `transform` and `opacity` only (avoid `width`, `height`, `top`, `left`)
- **Will-Change:** Use sparingly on elements about to animate, remove after
- **Reduced Motion:** Respect `@media (prefers-reduced-motion: reduce)` - disable decorative animations
- **Frame Rate:** Target 60fps. Test on mid-range devices (not just flagship phones).

### Gradient Implementation

```css
/* Standard button gradient (glossy effect) */
.button-primary {
  background: linear-gradient(180deg, #44c8ff 0%, #0a7bda 100%);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.2),
    /* Drop shadow */ inset 0 1px 0 rgba(255, 255, 255, 0.3); /* Glossy highlight */
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2); /* Embossed border */
}

/* Radial background gradient (spotlight effect) */
.page-background {
  background: radial-gradient(circle at 50% 35%, #1cc6ff 0%, #0b7ad6 40%, #0a4cc7 100%);
}
```

### Typography with Text Shadow

```css
/* High contrast text over complex backgrounds */
.display-text {
  font-family: 'Baloo 2', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #ffffff;
  text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.5),
    /* Primary shadow */ -1px -1px 0 rgba(0, 0, 0, 0.8),
    /* Outline top-left */ 1px -1px 0 rgba(0, 0, 0, 0.8),
    /* Outline top-right */ -1px 1px 0 rgba(0, 0, 0, 0.8),
    /* Outline bottom-left */ 1px 1px 0 rgba(0, 0, 0, 0.8); /* Outline bottom-right */
}
```

### Responsive Touch Targets

```css
/* Ensure minimum tap area without visual bulk */
.button {
  /* Visual size can be smaller */
  padding: 12px 24px;

  /* Tap area extends via pseudo-element */
  position: relative;
}

.button::before {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -8px;
  /* Ensures 44x44pt minimum even if visual button is smaller */
}
```

---

## Accessibility Considerations

Mobile casual games must balance playfulness with accessibility. Key requirements:

### Visual Accessibility

- **Color Contrast:** 4.5:1 minimum for text, 3:1 for large text (>24px) - WCAG AA
- **Text Alternatives:** All icon-only buttons need `aria-label` or visible label
- **Focus Indicators:** Never remove outline without providing alternative (border, shadow, background change)
- **Error Messages:** Text + color + icon (don't rely on color alone)

### Motor Accessibility

- **Touch Targets:** 44x44pt minimum (iOS), 48x48dp (Android) - WCAG 2.5.8 (Level AA is 24x24px but platform guidelines stricter)
- **Spacing:** 8px minimum between tappable elements to prevent mis-taps
- **No Timing:** Avoid timed challenges that can't be paused (or provide generous time limits)
- **One-Handed Use:** Critical actions within thumb reach zone (bottom 2/3 of screen)

### Cognitive Accessibility

- **Simple Language:** Avoid jargon in UI labels (e.g., "Start" not "Initiate Session")
- **Consistent Patterns:** Same button placement, same modal structure across screens
- **Clear Feedback:** Every action has visible confirmation (animation, toast, state change)
- **Error Prevention:** Confirmation modals for destructive actions (Quit, Delete)

### Reduced Motion

```css
/* Disable decorative animations for users with vestibular disorders */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Platform-Specific Considerations

### iOS (PWA in Safari)

- **Safe Area Insets:** Use `env(safe-area-inset-top)` for notch avoidance
- **Tap Highlight:** Disable `-webkit-tap-highlight-color: transparent`, provide custom feedback
- **Font Rendering:** `-webkit-font-smoothing: antialiased` for crisp text
- **Viewport:** `viewport-fit=cover` in meta tag to allow edge-to-edge design

### Android (PWA in Chrome)

- **Status Bar:** Theme color in manifest.json controls status bar color
- **Touch Feedback:** Ripple effect expected on buttons (use `::before` pseudo-element animation)
- **Back Button:** Ensure Android back button closes modals before exiting app
- **Install Prompt:** `beforeinstallprompt` event allows custom "Add to Home Screen" button

### Desktop (Progressive Enhancement)

- **Hover States:** Include hover styles for mouse users, but don't rely on them
- **Keyboard Navigation:** Tab order follows visual order, Enter/Space activate buttons
- **Larger Screens:** Max-width constraints (600-800px) for readability, center UI
- **Cursor:** `cursor: pointer` on interactive elements for affordance

---

## Sources

### Mobile Game UI Design Patterns (2026)

- [Best Examples in Mobile Game UI Designs (2026 Review)](https://pixune.com/blog/best-examples-mobile-game-ui-design/)
- [Game UI Database](https://www.gameuidatabase.com/)
- [Top 7 Stunning Mobile Game UI Designs](https://allclonescript.com/blog/mobile-game-app-ui-designs)
- [A Complete Guide to Game UI Design](https://www.andacademy.com/resources/blog/ui-ux-design/game-ui-design/)
- [The UI Design Styles Every Designer Should Know in 2026](https://dev.to/trixsec/the-ui-design-styles-every-designer-should-know-in-2026-1pmc)

### Animations & Transitions

- [Transforming Game Interfaces with Animated UI](https://punchev.com/blog/transforming-game-interfaces-with-animated-ui)
- [Mobile Game UI Design: Best Practices and Tips](https://bambamtastic.com/mobile-game-ui-design/)
- [How To Use Animation To Improve Mobile User Experience](https://design4users.com/animation-mobile-user-experience/)
- [Designing Mobile Games: Best Practices & Trends](https://www.webmobril.com/designing-mobile-games-best-practices-trends/)

### Color Schemes & Gradients

- [2026's Top App Color Schemes That Boost UX and Brand Engagement](https://www.designrush.com/best-designs/apps/trends/app-colors)
- [Modern App Colors: Design Palettes That Work In 2026](https://webosmotic.com/blog/modern-app-colors/)
- [10 Game-Changing UI/UX Design Trends for Mobile Apps in 2026](https://cpluz.com/blog/10-game-changing-ui-ux-design-trends-for-mobile-apps-in-2026-enhance-user-experience/)
- [Top 20 Modern Color Combinations Must Use in 2026](https://prodesignschool.com/design/top-20-modern-color-combinations-must-use-in-2026/)

### Loading & Splash Screens

- [Designing Engaging Splash Screens for Mobile Gaming Apps](https://datacalculus.com/en/blog/mobile-gaming-apps/uiux-designer/designing-engaging-splash-screens-for-mobile-gaming-apps)
- [Creating a Splash Screen For Mobile Games](https://blog.yarsalabs.com/creating-a-splash-screen-for-mobile-games-part-1/)
- [Game UI Database - Loading Screen](https://www.gameuidatabase.com/index.php?scrn=3)
- [10 Great Mobile App Launch Screen Examples in 2026](https://www.mobiloud.com/blog/mobile-app-launch-screen-examples)

### Responsive Design & Scaling

- [Aspect Ratio Scaling — Mobile and Tablets](https://medium.com/the-space-ape-games-experience/aspect-ratio-scaling-mobile-and-tablets-d574ab20a943)
- [Size Matters: How to Choose the Right Dimensions for Mobile Game Design](https://bambamtastic.com/what-size-should-i-design-mobile-games-at/)
- [Scaling your Mobile Game to Any Device Size](https://medium.com/@martindrapeau/scaling-your-mobile-game-to-any-device-size-4d12dd79cad6)
- [Designing for Mobile: A Deep Dive into Responsive UI, Screen Densities, and Asset Scaling](https://medium.muz.li/designing-for-mobile-a-deep-dive-into-responsive-ui-screen-densities-and-asset-scaling-f8766363ab08)

### Anti-Patterns & Mistakes to Avoid

- [7 UI Pitfalls Mobile App Developers Should Avoid in 2026](https://www.webpronews.com/7-ui-pitfalls-mobile-app-developers-should-avoid-in-2026/)
- [10 Common Mistakes to Avoid in Mobile Game Design](https://www.tap-nation.io/blog/10-common-mistakes-to-avoid-in-mobile-game-design/)
- [The Problems with UI Design in Mobile Games Dev](https://medium.com/@etiennebadia/the-problems-with-ui-design-in-mobile-games-dev-d07e59e4b625)
- [Avoiding UI Pitfalls: Anti-Patterns](https://www.numberanalytics.com/blog/avoiding-ui-pitfalls-anti-patterns)

### Button & Panel Design

- [How to design professional looking mobile game buttons](https://www.construct.net/en/tutorials/design-professional-looking-911)
- [How to Use Gradients on Buttons](https://uxmovement.com/buttons/how-to-use-gradients-on-buttons/)
- [UI Design: Glossy Buttons with CSS3 Gradient](https://www.hongkiat.com/blog/css3-glossy-effect/)
- [Better-designed buttons](https://indieklem.com/8-better-designed-buttons/)

### Typography & Readability

- [Top Typography Trends in 2026](https://www.brandcrowd.com/blog/top-typography-trends-in-2026)
- [The basics of typography in game interface](https://indieklem.com/13-the-basics-of-typography-in-game-interface/)
- [10 Mobile Typography Tips for Better Readability](https://onenine.com/10-mobile-typography-tips-for-better-readability/)
- [Color Contrast Accessibility: Complete WCAG 2025 Guide](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)

### Touch Target Size & Accessibility

- [Accessible Target Sizes Cheatsheet](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [WCAG 2.5.8: Target size (Minimum) (Level AA)](https://silktide.com/accessibility-guide/the-wcag-standard/2-5/input-modalities/2-5-8-target-size-minimum/)
- [All accessible touch target sizes](https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/)
- [Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/)
