# Design Documentation

This guide covers the design system, mockups, UI guidelines, and mobile-first implementation.

---

# Riddle Rush Design Guide
## Photoshop-Friendly Design System

This guide provides all the design specifications for editing and creating assets in Photoshop.

## 🎨 Color Palette

### Primary Colors
- **Primary Orange**: `#FF6B35` (RGB: 255, 107, 53)
- **Primary Light**: `#FF8C61` (RGB: 255, 140, 97)
- **Primary Dark**: `#E65528` (RGB: 230, 85, 40)
- **Primary Gradient**: Linear gradient 135° from `#FF6B35` to `#F7931E`

### Secondary Colors
- **Secondary Teal**: `#4ECDC4` (RGB: 78, 205, 196)
- **Secondary Light**: `#7DD3CB` (RGB: 125, 211, 203)
- **Secondary Dark**: `#3AAFA9` (RGB: 58, 175, 169)
- **Secondary Gradient**: Linear gradient 135° from `#4ECDC4` to `#44A08D`

### Accent Colors
- **Purple**: `#9B59B6` (RGB: 155, 89, 182)
- **Blue**: `#3498DB` (RGB: 52, 152, 219)
- **Green**: `#2ECC71` (RGB: 46, 204, 113)
- **Yellow**: `#F1C40F` (RGB: 241, 196, 15)
- **Red**: `#E74C3C` (RGB: 231, 76, 60)

### Neutral Colors
- **Dark**: `#2C3E50` (RGB: 44, 62, 80)
- **Dark Light**: `#34495E` (RGB: 52, 73, 94)
- **Gray**: `#95A5A6` (RGB: 149, 165, 166)
- **Gray Light**: `#BDC3C7` (RGB: 189, 195, 199)
- **Light**: `#ECF0F1` (RGB: 236, 240, 241)
- **White**: `#FFFFFF` (RGB: 255, 255, 255)

### Background Gradients

**Main Background (Purple)**:
- Type: Linear Gradient
- Angle: 135°
- Colors: `#667eea` → `#764ba2`

**Warm Background**:
- Type: Linear Gradient
- Angle: 135°
- Colors: `#f093fb` → `#f5576c`

**Cool Background**:
- Type: Linear Gradient
- Angle: 135°
- Colors: `#4facfe` → `#00f2fe`

**Success Gradient**:
- Type: Linear Gradient
- Angle: 135°
- Colors: `#43e97b` → `#38f9d7`

**Error Gradient**:
- Type: Linear Gradient
- Angle: 135°
- Colors: `#fa709a` → `#fee140`

## 📐 Typography

### Font Families
- **Primary**: Inter (400, 500, 600, 700, 900)
- **Display**: Poppins (400, 500, 600, 700, 900)

Download from Google Fonts:
- https://fonts.google.com/specimen/Inter
- https://fonts.google.com/specimen/Poppins

### Font Sizes (Desktop)
- **Extra Small**: 14px
- **Small**: 16px
- **Base**: 18px
- **Large**: 20px
- **Extra Large**: 24px
- **2XL**: 32px
- **3XL**: 48px
- **4XL**: 64px

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Black**: 900

### Line Height
- Use 1.6 (160%) for body text
- Use 1.2 (120%) for headings

## 📏 Spacing System

Use these values for consistent spacing:
- **XS**: 4px
- **SM**: 8px
- **MD**: 12px
- **LG**: 16px
- **XL**: 24px
- **2XL**: 32px
- **3XL**: 48px

## 🔲 Border Radius

- **Small**: 8px (buttons, inputs)
- **Medium**: 16px (cards)
- **Large**: 24px (large cards, modals)
- **Extra Large**: 32px (hero elements)
- **Full**: 9999px (pills, badges)

## 🌑 Shadows

### Small Shadow
- Offset: 0px, 2px
- Blur: 8px
- Color: Black at 8% opacity

### Medium Shadow
- Offset: 0px, 4px
- Blur: 16px
- Color: Black at 12% opacity

### Large Shadow
- Offset: 0px, 8px
- Blur: 32px
- Color: Black at 16% opacity

### Extra Large Shadow
- Offset: 0px, 16px
- Blur: 48px
- Color: Black at 20% opacity

## 🎯 Component Specifications

### Buttons

**Primary Button**:
- Background: Primary Gradient
- Text: White (#FFFFFF)
- Font: Poppins Semibold 20px
- Padding: 16px 32px
- Min Height: 56px
- Border Radius: 24px
- Shadow: Medium

**Secondary Button**:
- Background: Secondary Gradient
- Text: White (#FFFFFF)
- Font: Poppins Semibold 20px
- Padding: 16px 32px
- Min Height: 56px
- Border Radius: 24px
- Shadow: Medium

**Outline Button**:
- Background: White (#FFFFFF)
- Border: 2px solid Primary (#FF6B35)
- Text: Primary (#FF6B35)
- Font: Poppins Semibold 20px
- Padding: 16px 32px
- Min Height: 56px
- Border Radius: 24px

**Large Button**:
- Same as primary but:
- Min Height: 72px
- Padding: 24px 48px
- Font Size: 24px

### Cards

**Standard Card**:
- Background: White (#FFFFFF)
- Border Radius: 24px
- Padding: 24px
- Shadow: Medium

**Category Card**:
- Background: White (#FFFFFF)
- Border Radius: 24px
- Padding: 24px
- Min Height: 100px
- Shadow: Medium
- Hover: translateY(-4px) + Large Shadow

**Card Icon**:
- Size: 56px × 56px
- Background: Primary Gradient
- Border Radius: 16px
- Icon Size: 32px
- Shadow: Small

### Input Fields

**Text Input**:
- Background: Light (#ECF0F1)
- Border: 2px solid Light (#ECF0F1)
- Border Radius: 16px
- Padding: 16px
- Font: Inter Medium 20px
- Min Height: 56px

**Focused State**:
- Background: White (#FFFFFF)
- Border: 2px solid Primary (#FF6B35)
- Add glow: 0 0 0 4px rgba(255, 107, 53, 0.1)

### Badges

**Score Badge**:
- Background: White (#FFFFFF)
- Border Radius: 16px
- Padding: 12px 24px
- Shadow: Medium

**Offline Badge**:
- Background: White at 20% opacity
- Backdrop Blur: 10px
- Border Radius: 9999px
- Padding: 8px 16px
- Font: Inter Semibold 14px
- Color: White (#FFFFFF)

### Logo

**Logo Container**:
- Size: 120px × 120px
- Background: White (#FFFFFF)
- Border Radius: 32px
- Shadow: Extra Large
- Emoji Size: 64px

## 📱 Touch Targets

Minimum touch target size for mobile: **44px × 44px**

All interactive elements should be at least this size for comfortable touch interaction.

## 🎭 Icon Guidelines

### Emoji Icons
Use system emojis for consistent cross-platform appearance:
- Target/Game: 🎯
- Female: 👩
- Male: 👨
- Boat: ⛵
- Flower: 🌸
- Plant: 🌿
- Briefcase: 💼
- Bug: 🐛
- Trophy: 🏆
- Lightning: ⚡
- Check: ✓
- Cross: ✗

### Icon Sizes
- Small: 20px
- Medium: 24px
- Large: 32px
- Extra Large: 48px
- Hero: 64px

## 📐 Grid System

### Desktop (1200px+)
- Max Content Width: 1200px
- Grid: 12 columns
- Gutter: 24px
- Margin: 24px

### Tablet (768px - 1199px)
- Max Content Width: 100%
- Grid: 8 columns
- Gutter: 16px
- Margin: 16px

### Mobile (< 768px)
- Max Content Width: 100%
- Grid: 4 columns
- Gutter: 12px
- Margin: 12px

## 🎨 Creating Assets in Photoshop

### Document Setup

1. **Create New Document**:
   - Width: 1920px (desktop) or 375px (mobile)
   - Height: As needed
   - Resolution: 72 DPI (web)
   - Color Mode: RGB
   - Background: Transparent or White

2. **Set Up Guides**:
   - Use spacing system (8px grid)
   - Enable snap to grid
   - View > New Guide Layout

### Layer Organization

```
📁 Background
  └── gradient-layer
📁 Header
  ├── logo
  ├── title-text
  └── subtitle-text
📁 Content
  ├── cards-group
  │   ├── card-1
  │   ├── card-2
  │   └── card-3
  └── buttons-group
📁 Effects
  └── shadows-group
```

### Gradient Setup

To create gradients in Photoshop:

1. Select Gradient Tool (G)
2. Click gradient bar in options
3. Set gradient type to Linear
4. Add color stops at 0% and 100%
5. Set angle to 135° for diagonal gradients

Example (Primary Gradient):
- Stop 1 (0%): #FF6B35
- Stop 2 (100%): #F7931E
- Style: Linear
- Angle: 135°

### Shadow Setup

To create drop shadows:

1. Double-click layer
2. Add Drop Shadow effect
3. Set parameters based on shadow specifications above

Example (Medium Shadow):
- Blend Mode: Multiply
- Opacity: 12%
- Angle: 90°
- Distance: 4px
- Spread: 0%
- Size: 16px

### Exporting Assets

**For Web (PNG)**:
- File > Export > Export As
- Format: PNG-24
- Transparency: Yes (if needed)
- Scale: 1x, 2x, 3x for retina displays

**For Icons**:
- Size: Original design size
- Export at 1x, 2x, 3x
- Name: icon-name.png, icon-name@2x.png, icon-name@3x.png

**PWA Icons Needed**:
- 192x192px - icon-192.png
- 512x512px - icon-512.png

## 🔄 Animation Guidelines

### Timing
- Fast: 150ms (micro-interactions)
- Base: 250ms (standard transitions)
- Slow: 350ms (complex animations)
- Bounce: 500ms (playful interactions)

### Easing
- Standard: cubic-bezier(0.4, 0, 0.2, 1)
- Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

### Common Animations
- **Hover**: Transform translateY(-4px) + increase shadow
- **Active/Tap**: Transform scale(0.95)
- **Fade In**: Opacity 0 → 1 + translateY(20px → 0)
- **Scale In**: Opacity 0 → 1 + scale(0.9 → 1)
- **Slide Up**: Opacity 0 → 1 + translateY(100% → 0)

## 📐 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

### Mobile Adjustments
- Reduce font sizes by 10-20%
- Decrease spacing by 25%
- Single column layouts
- Larger touch targets (min 48px)

## ✨ Design Best Practices

1. **Consistency**: Use the design system consistently across all screens
2. **Hierarchy**: Establish clear visual hierarchy with size, color, and spacing
3. **Whitespace**: Don't be afraid of whitespace - it improves readability
4. **Contrast**: Ensure sufficient contrast for accessibility (WCAG AA: 4.5:1 for text)
5. **Touch-Friendly**: All interactive elements should be easily tappable
6. **Performance**: Optimize images and use appropriate formats
7. **Accessibility**: Consider color blindness, screen readers, and keyboard navigation

## 📝 Design Checklist

Before finalizing designs:

- [ ] Colors match the design system
- [ ] Fonts are Inter or Poppins
- [ ] Spacing uses the 8px grid system
- [ ] Border radius matches specifications
- [ ] Shadows are correctly applied
- [ ] Touch targets are at least 44×44px
- [ ] Text is readable (sufficient contrast)
- [ ] Hover and active states are defined
- [ ] Mobile responsive layout is considered
- [ ] Assets are exported in correct formats
- [ ] Icons are consistent in size and style

## 🛠 Tools & Resources

### Design Tools
- **Adobe Photoshop**: Main design tool
- **Adobe XD**: For prototyping (optional)
- **Figma**: Alternative design tool (optional)

### Web Tools
- **Google Fonts**: For downloading Inter and Poppins
- **ColorHexa**: For color conversions and shades
- **WebAIM Contrast Checker**: For accessibility testing
- **TinyPNG**: For image optimization

### Export Formats
- **PNG**: For images with transparency
- **JPG**: For photos (not recommended for UI)
- **SVG**: For icons and logos (scalable)
- **WebP**: For modern browsers (better compression)

## 🎯 Common Use Cases

### Creating a New Category Card

1. Create rectangle: 280px × 100px
2. Fill: White (#FFFFFF)
3. Border Radius: 24px
4. Add drop shadow (Medium)
5. Add icon circle: 56px × 56px with primary gradient
6. Add category emoji: 32px
7. Add category name: Poppins Semibold 20px
8. Add arrow: 32px, Primary color (#FF6B35)
9. Arrange with 24px padding

### Creating a Button

1. Create rounded rectangle
2. Width: Auto (based on text + padding)
3. Height: 56px (or 72px for large)
4. Border Radius: 24px
5. Fill: Primary gradient (135°)
6. Add text: Poppins Semibold 20px, White
7. Padding: 16px horizontal, centered vertical
8. Add medium drop shadow
9. Create hover state with increased shadow

### Creating the App Icon

1. Create square: 1024px × 1024px
2. Fill: Primary gradient
3. Add emoji/symbol: 512px, centered
4. Optional: Add rounded corners (180px radius for iOS)
5. Export as PNG
6. Create smaller versions (512px, 192px) for PWA

## 🎨 Color Usage Guidelines

### Do's
- Use primary color for main actions
- Use secondary color for alternative actions
- Use neutral colors for backgrounds and text
- Use accent colors sparingly for highlights
- Maintain consistent color meaning (green = success, red = error)

### Don'ts
- Don't use too many colors in one screen
- Don't use low contrast color combinations
- Don't use colors as the only indicator (accessibility)
- Don't override system colors without good reason

## 📱 Mobile-Specific Guidelines

### Touch Interactions
- All buttons minimum 48px tall
- Interactive elements have clear active states
- Provide visual feedback on tap
- Use larger hit areas than visible elements

### Layout
- Single column preferred
- Thumb-friendly navigation at bottom
- Important actions easily reachable
- Sufficient spacing between tap targets

### Typography
- Minimum font size: 16px for body text
- Larger tap targets for links
- Short, scannable content
- Clear visual hierarchy

## 🎓 Additional Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Fonts](https://fonts.google.com/)
- [Adobe Color](https://color.adobe.com/)

---

**Need Help?**

This design system is built for flexibility while maintaining consistency. Feel free to adapt these guidelines for your specific needs, but always keep user experience and accessibility in mind.

**Version**: 1.0
**Last Updated**: December 2025
**Design System**: Riddle Rush PWA
# 🎯 Riddle Rush Design Implementation Summary

## Overview

The Guess Game has been completely redesigned with a modern, touch-friendly UX inspired by Riddle Rush but with a contemporary, vibrant aesthetic perfect for offline table-game style play on phones and desktop touchscreens.

## ✨ What Was Created

### 1. **Design System** (`assets/css/design-system.css`)
A comprehensive design system featuring:
- **Vibrant Color Palette**: Orange primary, teal secondary, with 5 accent colors
- **Modern Gradients**: Purple, warm, cool, success, and error gradients
- **Typography Scale**: Inter for body, Poppins for headlines (responsive sizing)
- **Spacing System**: 8px grid-based spacing (XS to 3XL)
- **Touch-Friendly**: Minimum 44px touch targets with tap highlights
- **Animations**: 6 built-in animations (fade, slide, scale, bounce, pulse, shake)
- **Responsive**: Fluid typography and spacing using clamp()
- **Accessible**: WCAG AA compliant colors, keyboard navigation support

### 2. **Homepage** (`pages/index.vue`)
A stunning category selection screen with:
- **Gradient Background**: Purple gradient with subtle pattern overlay
- **Logo Section**: Large emoji-based logo with title and subtitle
- **Offline Badge**: Pulsing indicator showing offline capability
- **Schnellstart Button**: Large, prominent quick-play button
- **Category Grid**: Responsive grid of colorful category cards with:
  - Emoji icons in gradient backgrounds
  - Smooth hover animations
  - Touch-friendly sizing
  - Staggered fade-in animations
- **Load More**: Progressive category loading
- **Feature Cards**: Glassmorphic cards highlighting key features
- **Share Integration**: Native share API support

### 3. **Game Screen** (`pages/game.vue`)
An immersive gameplay experience with:
- **Header Bar**: Score display, back button, menu button
- **Category Display**: Large card showing category and starting letter
- **Input System**: Clean text input with submit button
- **Real-time Feedback**: Animated success/error messages with gradients
- **Other Answers**: Chip-style display of alternative answers
- **Attempts List**: Visual history of all guesses with indicators
- **Action Buttons**: Skip and new round options
- **Menu Overlay**: Modal menu with game options and share functionality

### 4. **Design Documentation** (`DESIGN_GUIDE.md`)
Complete Photoshop-friendly guide including:
- Color swatches with RGB values
- Typography specifications with font weights
- Component dimensions and spacing
- Shadow and border radius specs
- Grid system and breakpoints
- Animation timing and easing
- Asset export guidelines
- PWA icon requirements
- Design checklist
- Best practices and accessibility guidelines

## 🎨 Design Philosophy

### Inspired by Riddle Rush
- **Table Game Feel**: Designed for group play and offline use
- **Clear Categories**: Easy category selection with visual icons
- **Simple Scoring**: Prominent score display
- **Touch-First**: Large buttons and input fields

### Modern Enhancements
- **Vibrant Gradients**: Eye-catching backgrounds and buttons
- **Smooth Animations**: Delightful micro-interactions
- **Glassmorphism**: Backdrop blur effects for modern aesthetic
- **Responsive Design**: Perfect on phones, tablets, and desktop
- **PWA-Ready**: Installable with offline-first design

## 📱 Touch-Friendly Features

All interactive elements are optimized for touch:
- ✅ Minimum 44px touch targets
- ✅ Large, tappable buttons (56-72px height)
- ✅ Spacious input fields
- ✅ Clear visual feedback on tap
- ✅ Smooth animations (no jank)
- ✅ Thumb-friendly layouts
- ✅ No hover-dependent interactions

## 🎯 Key UI Components

### Buttons
- **Primary**: Orange gradient, white text
- **Secondary**: Teal gradient, white text
- **Outline**: White background, orange border
- All buttons have ripple effect on tap

### Cards
- White background with medium shadows
- 24px border radius
- Smooth hover/tap animations
- Category cards with emoji icons

### Typography
- **Headings**: Poppins (600-900 weight)
- **Body**: Inter (400-600 weight)
- Fluid sizing from mobile to desktop

### Colors
- **Primary**: #FF6B35 (Orange)
- **Secondary**: #4ECDC4 (Teal)
- **Accents**: Purple, Blue, Green, Yellow, Red
- **Neutrals**: Dark, Gray, Light, White

## 🎨 Photoshop Editing

The design is fully editable in Photoshop:

1. **All colors are specified** with RGB values
2. **Gradients have exact angles** and stop positions
3. **Shadows have specific** blur and opacity values
4. **Typography uses web fonts** (Inter & Poppins)
5. **Component dimensions** are documented
6. **Icon sizes** are standardized
7. **Export guidelines** for web assets
8. **PWA icon templates** included

## 📐 Responsive Breakpoints

- **Mobile**: < 640px (single column, larger text)
- **Tablet**: 640-1024px (2 columns)
- **Desktop**: 1024px+ (3 columns, max 1200px width)

## ♿ Accessibility Features

- High contrast ratios (WCAG AA)
- Keyboard navigation support
- Focus indicators
- Screen reader friendly markup
- Touch-friendly hit areas
- No color-only indicators

## 🚀 Performance

- CSS variables for theming
- Hardware-accelerated animations
- Optimized gradients and shadows
- Minimal DOM elements
- Efficient event handling

## 📦 Files Created/Modified

### New Files
- `assets/css/design-system.css` - Complete design system
- `DESIGN_GUIDE.md` - Photoshop editing guide
- `DESIGN_SUMMARY.md` - This file

### Modified Files
- `app/app.vue` - Integrated design system
- `pages/index.vue` - New homepage design
- `pages/game.vue` - New game screen design

## 🎓 How to Customize

### Changing Colors
1. Open `assets/css/design-system.css`
2. Find `:root` section at top
3. Modify CSS variables (e.g., `--color-primary`)
4. Colors update throughout entire app

### Creating New Components
1. Follow design guide specifications
2. Use CSS variables for colors
3. Apply utility classes (`.btn`, `.card`, etc.)
4. Add touch-friendly attributes (`.tap-highlight`, `.no-select`)

### Adding Animations
1. Use existing animation classes (`.animate-fade-in`, etc.)
2. Or create new @keyframes in design system
3. Apply with `animation` property

### Exporting Assets
1. Follow DESIGN_GUIDE.md export section
2. Use correct dimensions
3. Export at 1x, 2x, 3x for retina
4. Optimize with TinyPNG or similar

## 🎯 Next Steps

### Recommended Enhancements
1. **Create PWA Icons**: Use design guide to create 192x192 and 512x512 icons
2. **Add More Categories**: Expand category list with emojis
3. **Sound Effects**: Add audio feedback for correct/incorrect answers
4. **Haptic Feedback**: Implement vibration API for touch feedback
5. **Dark Mode**: Add dark theme variant
6. **Leaderboards**: Track high scores
7. **Multiplayer**: Add turn-based gameplay
8. **Customization**: Allow users to choose color themes

### Testing Checklist
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet
- [ ] Test on desktop with touch
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test offline functionality
- [ ] Test PWA installation
- [ ] Test different screen sizes
- [ ] Test animations on low-end devices

## 📚 Resources

- **Design System**: `assets/css/design-system.css`
- **Design Guide**: `DESIGN_GUIDE.md`
- **Google Fonts**: https://fonts.google.com/
- **Color Tool**: https://color.adobe.com/
- **Icon Resources**: Use system emojis or https://emojipedia.org/

## 🎉 Result

The app now features:
- ✅ Modern, vibrant design
- ✅ Touch-optimized interface
- ✅ Smooth animations
- ✅ Offline-first UX
- ✅ Fully responsive
- ✅ Photoshop-editable
- ✅ Accessibility compliant
- ✅ Table-game feel for group play

Perfect for playing offline at game nights, parties, or family gatherings!

---

**Design Version**: 1.0
**Date**: December 2025
**Inspired by**: Ravensburger Riddle Rush
**Built with**: Vue 3, Nuxt 4, Modern CSS
# Mockup Verification & Simplification Report

## ✅ Pages Aligned with Mockups

### 1. **Main Menu** (`pages/index.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/main-menu/`
- ✅ Uses `LOGO.png` for logo
- ✅ Uses `PLAY.png`, `OPTIONS.png`, `CREDITS.png` buttons
- ✅ Uses hover states (`PLAY-1.png`, `OPTION.png`, `CREDITS-1.png`)
- ✅ Menu toggle button uses `MENU.png`
- ✅ **Simplified**: Menu panel shows Play, Language, Settings, Credits
- ✅ **No coins**: Coin bar removed per requirements

### 2. **Players Page** (`pages/players.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/players/`
- ✅ Uses `players.png` for title
- ✅ Uses `top.png` decoration
- ✅ Uses `Group 10.png` for player slots
- ✅ Uses `add.png` and `minus.png` for add/remove
- ✅ Uses `start.png` for start button
- ✅ Uses scroll bar assets
- ✅ **Simple**: Add players, then start game

### 3. **Round Start** (`pages/round-start.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/alphabets/`
- ✅ Shows fortune wheels for category and letter selection
- ✅ Automatically navigates to game after selection
- ✅ **Simple**: No manual navigation needed

### 4. **Game Screen** (`pages/game.vue`) - **CORE GAMEPLAY**
- ✅ Uses `BACKGROUND.png` from `assets/alphabets/`
- ✅ Uses `back.png` for back button
- ✅ Uses `ROUND 01.png` for round indicator
- ✅ Uses `CATEGORY.png` for category label
- ✅ Uses `next.png` for next button
- ✅ **No coins**: Coin count removed per requirements
- ✅ Shows category, letter, and player input
- ✅ **Simple**: Players submit answers, then proceed

### 5. **Results/Scoring** (`pages/results.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/scoring/`
- ✅ Uses `scoring.png` for title
- ✅ Uses `Shape 2.png` for score slots
- ✅ Uses `xyz.png` for player avatars
- ✅ Uses `add.png` and `minus.png` for score adjustment
- ✅ Uses `next.png` and `back-1.png` for navigation
- ✅ Uses scroll bar assets
- ✅ **Simple**: Adjust scores, then proceed to leaderboard

### 6. **Leaderboard** (`pages/leaderboard.vue`) - **FINAL SCREEN**
- ✅ Uses `BACKGROUND.png` from `assets/leaderboard/`
- ✅ Uses `leaderbpard.png` and `ranking.png` for title
- ✅ Uses rank badges (`1.png`, `2.png`, etc.)
- ✅ Uses `tobi.png` for player avatars
- ✅ Uses `500.png` for score icon
- ✅ Uses `ok.png` for OK button
- ✅ Uses scroll bar assets
- ✅ **Simplified**: Removed round info, decorative layer
- ✅ **Final screen**: When game completed, only shows OK button to return home
- ✅ **No back button** when game is completed

### 7. **Settings** (`pages/settings.vue` + `components/SettingsModal.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/settings/`
- ✅ Uses `options.png` for title
- ✅ Uses `Sound.png` and `Music.png` for controls
- ✅ Uses volume sliders (matching mockup)
- ✅ Uses `back.png` for back button
- ✅ **No coins**: Coin bar removed
- ✅ **Simple**: Only sound and music volume controls

### 8. **Credits** (`pages/credits.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/credits/`
- ✅ Uses `CREDITS.png` for title
- ✅ Uses `back.png` for back button
- ✅ Uses `ok.png` for OK button
- ✅ Shows Game Design, Programming, Art credits
- ✅ **No coins**: Coin display removed
- ✅ **Simple**: Just shows credits and returns

### 9. **Language** (`pages/language.vue`)
- ✅ Uses `BACKGROUND.png` from `assets/language/`
- ✅ Uses `LANGUAGE.png` for title
- ✅ Uses `Eng Flag.png` and `German Flag.png`
- ✅ Uses `Language button.png` for buttons
- ✅ Uses `mark.png` for selected indicator
- ✅ Uses `OK.png` for OK button
- ✅ **Simple**: Select language and confirm

## 🗑️ Removed/Unused Pages

### Deleted:
- ✅ `pages/test.vue` - Test page removed

### Unused (but kept for potential future use):
- `pages/about.vue` - Redundant with credits, but kept for potential future content
- `pages/alphabet.vue` - Old alphabet selection, replaced by round-start
- `pages/categories.vue` - Old category selection, replaced by round-start
- `pages/categories-new.vue` - Old category selection variant

## 📋 Game Flow (Simplified)

```
Main Menu (index.vue)
  ↓
Players (players.vue) - Add players
  ↓
Round Start (round-start.vue) - Spin wheels for category & letter
  ↓
Game (game.vue) - Players submit answers
  ↓
Results (results.vue) - Adjust scores
  ↓
Leaderboard (leaderboard.vue) - View rankings
  ↓
  ├─ Game not completed → Round Start (next round)
  └─ Game completed → Main Menu (final screen)
```

## ✅ Simplifications Made

1. **Removed coin system** - No coin displays anywhere
2. **Removed win page** - Leaderboard is the final screen
3. **Simplified leaderboard** - Removed decorative elements, round info
4. **Menu toggle** - Simple menu panel with essential options
5. **Direct navigation** - No unnecessary intermediate pages
6. **Removed test page** - Clean codebase

## 🎯 Mockup Alignment Status

| Page | Mockup | Assets Used | Status |
|------|--------|-------------|--------|
| Main Menu | ✅ | ✅ | ✅ Complete |
| Players | ✅ | ✅ | ✅ Complete |
| Round Start | ✅ | ✅ | ✅ Complete |
| Game | ✅ | ✅ | ✅ Complete |
| Results | ✅ | ✅ | ✅ Complete |
| Leaderboard | ✅ | ✅ | ✅ Complete |
| Settings | ✅ | ✅ | ✅ Complete |
| Credits | ✅ | ✅ | ✅ Complete |
| Language | ✅ | ✅ | ✅ Complete |

## ✨ Summary

**All pages are aligned with mockups and use designer assets.**
**The game is simplified to the core flow: Menu → Players → Round Start → Game → Results → Leaderboard.**
**No unnecessary complexity or features remain.**
# Mobile-First Improvements Task List

Generated: 2025-12-31

## 🚨 CRITICAL BUGS (Fix First)

### 1. Game Flow Completely Broken
**Priority: CRITICAL**
**File:** `middleware/game-active.global.ts:9`

**Problem:** Middleware blocks `/alphabet` route, preventing any game from starting.
- User flow: Players → /alphabet → Categories → Game
- Middleware requires active session for `/alphabet`
- Session is only created AFTER alphabet selection
- Creates catch-22: cannot start game

**Fix:** Remove `/alphabet` from `protectedPages` array
```typescript
const protectedPages = ['/game', '/categories'] // Remove '/alphabet'
```

---

### 2. Google Analytics Not Implemented
**Priority: HIGH**
**Files:**
- `composables/useAnalytics.ts` - Stub implementation
- `nuxt.config.ts` - Missing nuxt-gtag module

**Problem:** Analytics configured but not functional
- `useAnalytics.ts` only logs to console
- `nuxt-gtag` module not installed
- `GOOGLE_ANALYTICS_ID` env var exists but unused
- No actual tracking happening

**Fix:**
1. Install `nuxt-gtag` module: `pnpm add -D nuxt-gtag`
2. Add to nuxt.config.ts modules array
3. Implement gtag calls in useAnalytics.ts
4. Add GOOGLE_ANALYTICS_ID to .env.aws

**Reference:** `ANALYTICS.md` has full documentation

---

### 3. Missing i18n Translation Keys
**Priority: MEDIUM**
**Files:** `locales/de.json`, `locales/en.json`

**Problem:** Console warnings during gameplay
- Missing: `players.ready`
- Missing: `game.no_active_session`

**Fix:** Add missing keys to translation files

---

## 📱 MOBILE UX/UI IMPROVEMENTS

### 4. Replace Browser Prompts with Custom Modals
**Priority: HIGH**
**File:** `pages/players.vue:152`

**Problem:** Using `prompt()` for player names
- Not mobile-friendly (small input, poor UX)
- Doesn't match app design aesthetic
- No touch optimization

**Fix:** Create custom modal component
- Large touch-friendly input field
- Beautiful design matching game theme
- Virtual keyboard support
- Better validation feedback

---

### 5. Add Haptic Feedback
**Priority: HIGH**
**Component:** Create `composables/useHaptics.ts`

**Problem:** No tactile feedback on interactions
- Mobile games need haptic feedback for engagement
- Taps feel unresponsive without vibration

**Fix:** Implement Vibration API
```typescript
export const useHaptics = () => {
  const light = () => navigator.vibrate?.(10)    // Light tap
  const medium = () => navigator.vibrate?.(25)   // Button press
  const success = () => navigator.vibrate?.([50, 50, 100]) // Success pattern
  const error = () => navigator.vibrate?.([100, 50, 100, 50, 100]) // Error pattern
}
```

**Apply to:**
- All button clicks (light)
- Correct answers (success)
- Wrong answers (error)
- Navigation (medium)

---

### 6. Add Pull-to-Refresh
**Priority: MEDIUM**
**Pages:** Main menu, statistics, leaderboard

**Problem:** No way to refresh data on mobile
- Users expect pull-to-refresh gesture
- Critical for leaderboards and stats updates

**Fix:** Implement pull-to-refresh using CSS + touch events
- Visual indicator while pulling
- Haptic feedback on trigger
- Reload relevant data

---

### 7. Improve Loading States
**Priority: MEDIUM**
**All pages with async operations**

**Problem:** No visual feedback during navigation/loading
- Users don't know if app is responding
- Appears frozen during data fetches

**Fix:**
- Add skeleton loaders for content
- Loading spinners for buttons during async operations
- Progress indicators for game setup
- Disable buttons during processing

---

### 8. Add Swipe Gestures
**Priority: MEDIUM**
**Pages:** Game, Categories, Players

**Problem:** Missing intuitive mobile interactions
- No swipe-to-navigate
- No swipe-to-skip in game
- Underutilizes mobile capabilities

**Fix:**
- Swipe left/right for navigation between screens
- Swipe up to skip current item in game
- Swipe down for menu/settings
- Add visual hints for swipe gestures

---

### 9. Optimize Touch Targets
**Priority: MEDIUM**
**All interactive elements**

**Problem:** Need verification of touch target sizes
- iOS recommends 44x44px minimum
- Android recommends 48x48dp minimum

**Audit:** Check all buttons, especially:
- Back buttons
- Remove player buttons
- Category selection items
- Game answer inputs

**Fix:** Ensure minimum touch target sizes with padding

---

### 10. Add Bottom Sheet Navigation
**Priority: MEDIUM**
**Component:** Create `BottomSheet.vue`

**Problem:** Settings/options use full-page modals
- Mobile users expect bottom sheets
- More thumb-friendly on large screens
- Follows iOS/Android patterns

**Fix:** Convert modals to bottom sheets:
- Settings modal
- Player add/edit
- Category filters
- Game help/info

---

### 11. Implement Screen Orientation Lock
**Priority: LOW**
**All game screens**

**Problem:** No orientation handling
- Game designed for portrait
- Landscape could break layouts

**Fix:** Lock to portrait during active game
```typescript
screen.orientation?.lock('portrait')
```

---

### 12. Add Install Prompt Optimization
**Priority: MEDIUM**
**File:** `pages/index.vue`

**Problem:** Install prompt exists but not optimized
- Could show at better timing
- No A/B testing or analytics
- Missing install benefits explanation

**Fix:**
- Show prompt after user plays first successful game
- Add "Why install?" tooltip
- Track install conversion rate (needs GA)
- Add dismissal cooldown (don't spam)

---

### 13. Improve Toast Notifications
**Priority: MEDIUM**
**Component:** `components/Toast.vue` (if exists)

**Problem:** Toasts may not be thumb-friendly
- Dismiss buttons should be accessible
- Auto-dismiss timing needs testing on mobile
- Position could block important UI

**Fix:**
- Swipe-to-dismiss gesture
- Optimal auto-dismiss timing (3-4s)
- Position at top (safe area aware)
- Larger touch targets for action buttons

---

### 14. Add Offline Indicator
**Priority: LOW**
**Global component**

**Problem:** No visual feedback when offline
- Users may not know why features don't work
- PWA works offline but unclear

**Fix:**
- Offline banner at top
- Auto-hide when back online
- Show which features work offline
- Prevent online-only actions with helpful message

---

### 15. Optimize Animations for Performance
**Priority: LOW**
**All pages with animations**

**Problem:** May cause jank on low-end devices
- CSS animations not GPU-accelerated
- No reduced-motion support

**Fix:**
- Use transform/opacity for animations (GPU)
- Add will-change hints strategically
- Respect prefers-reduced-motion
- Test on low-end Android devices

---

### 16. Add Quick Actions Integration
**Priority: LOW**
**Already configured in manifest**

**Problem:** Configured but needs testing
- App shortcuts exist in manifest
- Need to verify they work properly
- Could add more useful shortcuts

**Fix:**
- Test long-press app icon on Android
- Add "Resume Game" shortcut if session exists
- Add "View Stats" shortcut

---

### 17. Implement Share API
**Priority: MEDIUM**
**Pages:** Results, Statistics

**Problem:** No way to share scores/achievements
- Mobile users love sharing game results
- Missing social engagement opportunity

**Fix:** Use Web Share API
```typescript
navigator.share({
  title: 'My Riddle Rush Score!',
  text: `I scored ${score} points!`,
  url: window.location.href
})
```

**Share from:**
- Game results screen
- Leaderboard positions
- Statistics/achievements

---

### 18. Add Screenshot/Share Result Card
**Priority:** MEDIUM
**Page:** Win/Results screen

**Problem:** No visual result card to share
- Text-only sharing is boring
- Need shareable graphic for social media

**Fix:**
- Generate beautiful result card with:
  - Player name(s)
  - Score
  - Category
  - Time
  - Branded with app logo
- Use html2canvas or similar
- Auto-download or share

---

### 19. Improve Error Messages
**Priority: LOW**
**All error states**

**Problem:** Error messages may not be helpful
- Need actionable guidance
- Mobile users need clear next steps

**Fix:**
- User-friendly error messages
- Suggest fixes (e.g., "Check connection")
- Add retry buttons
- Log technical details to console only

---

### 20. Add Sound Toggle Visual Feedback
**Priority: LOW**
**Settings/Audio controls**

**Problem:** Audio settings may not show current state clearly
- Users should see if sound is on/off
- Toggle should have clear visual states

**Fix:**
- Clear on/off indicators
- Preview sound when changing
- Visual feedback matches audio state
- Persist across sessions (already implemented?)

---

## 📊 ANALYTICS EVENTS TO IMPLEMENT

Once Google Analytics is integrated:

1. **Game Events:**
   - `game_started` - Category, player count, letter
   - `game_completed` - Score, duration, category
   - `game_abandoned` - At what stage
   - `answer_submitted` - Correct/incorrect
   - `skip_used` - Frequency tracking

2. **Engagement:**
   - `app_installed` - PWA install conversion
   - `share_clicked` - Share button usage
   - `leaderboard_viewed` - Engagement metric
   - `settings_changed` - Which settings

3. **Performance:**
   - `page_load_time` - Core Web Vitals
   - `offline_mode_used` - PWA offline usage
   - `error_occurred` - Error tracking

---

## 🎨 DESIGN POLISH

### 21. Add Micro-interactions
**Priority: LOW**

- Button press animations (scale down)
- Success confetti on correct answers
- Wobble on incorrect answers
- Smooth page transitions
- Particle effects on win screen

### 22. Improve Typography Scaling
**Priority: LOW**

- Test on various screen sizes (small phones to tablets)
- Ensure readability at all viewport sizes
- Consider dynamic font sizing based on content length

### 23. Add Dark Mode (Future)
**Priority: VERY LOW**

- Respect `prefers-color-scheme`
- Toggle in settings
- Smooth transition between modes

---

## 🧪 TESTING PRIORITIES

1. **Critical Path Testing:**
   - Players → Alphabet → Categories → Game → Results
   - Must work flawlessly on mobile

2. **Cross-Device Testing:**
   - iPhone SE (small screen)
   - iPhone 14 Pro (notch handling)
   - Samsung Galaxy (Android)
   - iPad (tablet)

3. **Network Conditions:**
   - Offline mode
   - Slow 3G
   - Airplane mode toggle

4. **Accessibility:**
   - Screen reader support
   - Touch target sizes
   - Color contrast
   - Keyboard navigation (for PWA on desktop)

---

## 📝 IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (Immediate)
1. Fix game flow middleware bug
2. Implement Google Analytics
3. Fix missing i18n keys

### Phase 2: Core Mobile UX (Week 1)
4. Replace browser prompts with custom modals
5. Add haptic feedback
6. Improve loading states
7. Optimize touch targets

### Phase 3: Engagement Features (Week 2)
8. Add swipe gestures
9. Implement share functionality
10. Create shareable result cards
11. Add pull-to-refresh

### Phase 4: Polish & Optimization (Week 3)
12. Bottom sheet navigation
13. Improve toast notifications
14. Add micro-interactions
15. Performance optimizations

### Phase 5: Nice-to-Have (Future)
16. Advanced animations
17. Offline indicator
18. Dark mode
19. Additional analytics events
20. Comprehensive accessibility improvements

---

## 🎯 SUCCESS METRICS

After implementing mobile-first improvements, measure:

1. **Engagement:**
   - Average session duration
   - Games completed per session
   - Return user rate

2. **Technical:**
   - PWA install rate
   - Bounce rate
   - Time to interactive
   - Offline usage percentage

3. **User Satisfaction:**
   - Share button clicks
   - Repeat game rate
   - Settings changes frequency

---

## 📚 Resources

- [Mobile Web Best Practices](https://web.dev/mobile)
- [PWA Patterns](https://web.dev/patterns)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)
