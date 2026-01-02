---
title: Color Palette
description: Complete color system for Riddle Rush design
---

# Color Palette

Complete color system for Riddle Rush design.

## Primary Colors

### Orange Primary
- **Primary Orange**: `#FF6B35` (RGB: 255, 107, 53)
- **Primary Light**: `#FF8C61` (RGB: 255, 140, 97)
- **Primary Dark**: `#E65528` (RGB: 230, 85, 40)
- **Primary Gradient**: Linear gradient 135° from `#FF6B35` to `#F7931E`

## Secondary Colors

### Teal Secondary
- **Secondary Teal**: `#4ECDC4` (RGB: 78, 205, 196)
- **Secondary Light**: `#7DD3CB` (RGB: 125, 211, 203)
- **Secondary Dark**: `#3AAFA9` (RGB: 58, 175, 169)
- **Secondary Gradient**: Linear gradient 135° from `#4ECDC4` to `#44A08D`

## Background Gradients

### Main Background (Purple)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Warm Background
```css
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Cool Background
```css
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

## Usage in Code

Colors are defined in the design system SCSS file:
- `assets/scss/design-system.scss`

Access via CSS variables:
```css
color: var(--color-primary);
background: var(--gradient-primary);
```
