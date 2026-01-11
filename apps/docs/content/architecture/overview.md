---
title: Architecture Overview
description: System architecture and design patterns
---

# Architecture Overview

Riddle Rush follows a layered architecture pattern with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────┐
│      Pages (UI & Routes)            │
├─────────────────────────────────────┤
│   Layouts (Page Structure)         │
├─────────────────────────────────────┤
│  Base Components (Reusable UI)     │
├─────────────────────────────────────┤
│  Composables (Reactive Logic)       │
├─────────────────────────────────────┤
│   Services (Business Logic)         │
├─────────────────────────────────────┤
│   Stores (State Management)         │
└─────────────────────────────────────┘
```

## Key Technologies

- **Framework**: Nuxt 4 (Vue 3)
- **State Management**: Pinia
- **Data Persistence**: IndexedDB (via idb library)
- **Styling**: SCSS with design system
- **Type Safety**: TypeScript (strict mode)
- **PWA**: @vite-pwa/nuxt
- **i18n**: @nuxtjs/i18n

## Core Principles

1. **Offline-First**: All game data cached locally
2. **Reactive State**: Pinia stores with IndexedDB persistence
3. **Component Reusability**: Base components for common UI patterns
4. **Type Safety**: Full TypeScript coverage
5. **Performance**: Code splitting, lazy loading, asset optimization

## Architecture Layers

### Pages Layer

File-based routing with Nuxt. Each page handles its own UI logic.

### Layouts Layer

Common page structures (default, game, menu).

### Components Layer

- **Base Components**: Reusable UI building blocks
- **Feature Components**: Game-specific components

### Composables Layer

Reactive logic and utilities:

- `useIndexedDB` - Database operations
- `useGameState` - Game state management
- `useAudio` - Sound effects
- `useAnalytics` - Tracking

### Services Layer

Pure business logic functions:

- `GameService` - Game rules and calculations
- `StorageService` - Data persistence abstraction

### Stores Layer

Pinia stores for global state:

- `game` store - Current game session
- `settings` store - User preferences

## Data Flow

1. User interaction → Page component
2. Page component → Composable/Store action
3. Store action → Service (business logic)
4. Service → IndexedDB (persistence)
5. Store mutation → UI update (reactive)

## Next Steps

- [Project Structure](/docs/architecture/structure)
- [State Management](/docs/architecture/state-management)
- [Data Persistence](/docs/architecture/data-persistence)
- [PWA Implementation](/docs/architecture/pwa)
