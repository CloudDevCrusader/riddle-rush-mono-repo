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
