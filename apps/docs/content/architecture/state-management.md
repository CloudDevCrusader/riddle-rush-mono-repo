---
title: State Management
description: Pinia stores with IndexedDB persistence
---

# State Management

Riddle Rush uses Pinia for state management with IndexedDB persistence.

## Stores

### Game Store (`stores/game.ts`)

Manages game sessions, categories, scores, and attempts.

**Key State:**

- Current game session
- Player list
- Current category and letter
- Score and attempts
- Game history

**Persistence:**

- Automatically saves to IndexedDB after mutations
- Restores session on app reload

### Settings Store (`stores/settings.ts`)

User preferences and configuration.

**Key State:**

- Language preference
- Audio settings
- Category filters
- UI preferences

## Data Flow

```
User Action → Component → Store Action → Service → IndexedDB
                                      ↓
                                   Store Mutation
                                      ↓
                                   UI Update (Reactive)
```

## IndexedDB Structure

- `gameSession` - Current active session
- `gameHistory` - Completed sessions
- `statistics` - Aggregated player stats
- `leaderboard` - High scores
- `settings` - User preferences

## Best Practices

1. **Always use store actions** - Don't mutate state directly
2. **Save after mutations** - Call `save*ToDB()` methods
3. **Handle errors** - Wrap IndexedDB operations in try-catch
4. **Type safety** - Use TypeScript types for all state
