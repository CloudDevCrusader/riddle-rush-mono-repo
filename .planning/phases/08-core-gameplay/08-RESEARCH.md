# Phase 8 Research: Core Gameplay

## Current State Analysis

### Game Page (`apps/game/pages/game/[[gameId]].vue`)

- **837 lines** - fully functional
- All features work: back button, round display, category, letter, input, next button
- **Issue: Styling doesn't match mockup**

## Mockup vs Current - Visual Comparison

| Element            | Mockup Style                                  | Current Style          | Change Needed               |
| ------------------ | --------------------------------------------- | ---------------------- | --------------------------- |
| **Category panel** | Orange header + cream body, gold border       | Single orange gradient | Split into 2 sections       |
| **Category text**  | Gold 3D with brown outline                    | Gold with glow         | Add outline/3D effect       |
| **Letter**         | Light blue fill, dark blue outline, 3D shadow | Blue with cyan glow    | Change to outlined 3D style |
| **Round text**     | Gold with brown outline                       | Gold with glow         | Add outline                 |
| **NEXT button**    | Bright green glossy, gold border              | Green gradient         | Minor tweaks                |
| **Back button**    | Red circle, white arrow                       | Red circle             | OK as-is                    |

## Key Style Updates (CSS only)

### 1. Category Panel

```css
/* Header section */
background: linear-gradient(180deg, #ff9933 0%, #ff8800 100%);
/* Body section */
background: linear-gradient(180deg, #fff5e6 0%, #ffe4c4 100%);
border: 4px solid #daa520;
```

### 2. Letter - 3D Outlined Style

```css
color: #7ec8e3; /* light blue fill */
-webkit-text-stroke: 8px #2b5b84; /* dark blue outline */
text-shadow:
  6px 6px 0 #1a3a5c,
  /* 3D depth */ 0 10px 20px rgba(0, 0, 0, 0.3); /* drop shadow */
```

### 3. Text with Outline (Category name, Round)

```css
color: #ffd700;
-webkit-text-stroke: 2px #8b4513;
text-shadow: 2px 2px 0 #8b4513;
```

## Scope

**In scope:** CSS styling changes only
**Out of scope:** Layout restructuring, functionality changes

## Estimated Effort

- Single plan: ~20-30 min (CSS updates)
- Verification: ~5 min
