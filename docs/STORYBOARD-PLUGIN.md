# Storyboard Plugin Documentation

## Overview

The Storyboard Plugin is a powerful workflow management tool for the Riddle Rush game. It tracks user navigation, manages state transitions, provides analytics, and offers development tools for visualizing the game flow.

## Features

### 🎯 Core Features

- **Automatic Route Tracking**: Tracks all page transitions automatically
- **Flow Persistence**: Saves workflow history to localStorage
- **State Management**: Manages current state and transition history
- **Analytics**: Provides metrics on user behavior and navigation patterns
- **Dev Overlay**: Visual tool for developers to inspect workflow (dev mode only)

### 📊 Analytics Metrics

- Session duration tracking
- Total transitions count
- Average time per state
- Flow completion percentage
- State visit counts
- Navigation pattern analysis

### 🛠️ Developer Tools

- Interactive dev overlay (Ctrl/Cmd + Shift + S)
- Flow visualization with progress indicators
- Real-time state tracking
- Export flow data (JSON)
- Copy flow data to clipboard
- Reset flow functionality

## Installation

The plugin is automatically loaded in the game app. No manual installation required.

### Files Created

```
apps/game/
├── plugins/
│   └── storyboard.client.ts       # Main plugin
├── composables/
│   └── useStoryboard.ts           # Composable helper
└── components/
    └── StoryboardDevOverlay.vue   # Dev tools UI
```

## Usage

### Basic Usage

The plugin is automatically active and tracks all route changes. Access it via the composable:

```typescript
<script setup lang="ts">
const { flow, recordTransition, getFlowCompletion } = useStoryboard()

// Access current state
console.log(flow.value.currentState)

// Get flow completion
const completion = getFlowCompletion()
console.log(`Flow ${completion}% complete`)
</script>
```

### Manual Transition Recording

You can manually record transitions for custom workflow states:

```typescript
const { recordTransition, WORKFLOW_STATES } = useStoryboard()

// Record a transition with metadata
recordTransition('game', {
  category: 'riddles',
  difficulty: 'hard',
  score: 1000,
})
```

### Checking State History

```typescript
const { hasVisitedState, getStateVisitCount } = useStoryboard()

// Check if user has visited a state
if (hasVisitedState('game')) {
  console.log('User has played before')
}

// Get visit count
const visits = getStateVisitCount('main_menu')
console.log(`User has visited main menu ${visits} times`)
```

### Analytics

```typescript
const { getSessionDuration, getAverageTimePerState, getFlowCompletion, isFollowingGameFlow } =
  useStoryboard()

// Get analytics
console.log(`Session: ${getSessionDuration()}s`)
console.log(`Avg per state: ${getAverageTimePerState()}s`)
console.log(`Completion: ${getFlowCompletion()}%`)
console.log(`Following flow: ${isFollowingGameFlow()}`)
```

### Flow Management

```typescript
const { resetFlow, getPreviousState } = useStoryboard()

// Reset the entire flow
resetFlow()

// Get previous state (for back navigation)
const previousState = getPreviousState()
if (previousState) {
  router.push(previousState.path)
}
```

## Workflow States

The plugin defines these workflow states:

| State ID      | Name               | Path           | Description          |
| ------------- | ------------------ | -------------- | -------------------- |
| `main_menu`   | Main Menu          | `/`            | Game home screen     |
| `language`    | Language Selection | `/language`    | Language picker      |
| `settings`    | Settings           | `/settings`    | Game settings        |
| `credits`     | Credits            | `/credits`     | Credits screen       |
| `players`     | Player Setup       | `/players`     | Player configuration |
| `round_start` | Round Start        | `/round-start` | Round introduction   |
| `game`        | Game Play          | `/game`        | Active gameplay      |
| `results`     | Results            | `/results`     | Round results        |
| `leaderboard` | Leaderboard        | `/leaderboard` | Final scores         |

### Typical Game Flow

```
Main Menu → Players → Round Start → Game → Results
```

The plugin tracks if users follow this typical flow vs. custom navigation paths.

## Dev Overlay

### Activation

**Keyboard Shortcut**: `Ctrl/Cmd + Shift + S`

The overlay is only available in development mode (`import.meta.dev`).

### Features

1. **Session Stats**
   - Session duration
   - Total transitions
   - Average time per state
   - Flow completion percentage

2. **Current State**
   - Current page/state name
   - Route path
   - Real-time updates

3. **Game Flow Progress**
   - Visual progress through typical game flow
   - Checkmarks for visited states
   - Visit count badges
   - Current state highlighting

4. **History**
   - Last 10 transitions
   - Timestamps
   - State names
   - Clear history button

5. **Actions**
   - **Export Flow**: Download flow data as JSON
   - **Copy Data**: Copy flow data to clipboard
   - **Reset Flow**: Clear all tracking data

### Screenshots

The overlay shows:

- Real-time analytics
- Visual flow representation
- Complete navigation history
- Export/reset controls

## Configuration

Configure the plugin behavior:

```typescript
const { updateConfig } = useStoryboard()

updateConfig({
  enableDevOverlay: true, // Show dev overlay in dev mode
  enableTracking: true, // Enable state tracking
  maxHistorySize: 50, // Max history items to keep
  persistFlow: true, // Save to localStorage
})
```

### Default Configuration

```typescript
{
  enableDevOverlay: import.meta.dev,  // Only in dev mode
  enableTracking: true,                // Always track
  maxHistorySize: 50,                  // Keep last 50 transitions
  persistFlow: true                    // Persist to localStorage
}
```

## API Reference

### Composable: `useStoryboard()`

#### State

- `flow`: Readonly ref to current flow state
- `config`: Readonly ref to configuration
- `showDevOverlay`: Readonly ref to overlay visibility

#### Actions

- `recordTransition(stateId, metadata?)`: Record a state transition
- `resetFlow()`: Clear all flow data
- `updateConfig(config)`: Update configuration
- `toggleDevOverlay()`: Show/hide dev overlay

#### Getters

- `getPreviousState()`: Get previous state in history
- `hasVisitedState(stateId)`: Check if state was visited
- `getStateVisitCount(stateId)`: Get visit count for state
- `getGameFlowPath()`: Get typical game flow path
- `isFollowingGameFlow()`: Check if following typical flow
- `getFlowCompletion()`: Get flow completion percentage (0-100)
- `getSessionDuration()`: Get session duration in seconds
- `getAverageTimePerState()`: Get average time per state in seconds

#### Constants

- `WORKFLOW_STATES`: Object with all defined workflow states

### Types

```typescript
interface StoryboardState {
  id: string
  name: string
  path: string
  timestamp: number
  metadata?: Record<string, unknown>
}

interface StoryboardFlow {
  currentState: StoryboardState | null
  history: StoryboardState[]
  totalTransitions: number
  sessionStartTime: number
}

interface StoryboardConfig {
  enableDevOverlay: boolean
  enableTracking: boolean
  maxHistorySize: number
  persistFlow: boolean
}

type WorkflowStateId =
  | 'main_menu'
  | 'language'
  | 'settings'
  | 'credits'
  | 'players'
  | 'round_start'
  | 'game'
  | 'results'
  | 'leaderboard'
```

## Use Cases

### 1. User Onboarding Tracking

Track if new users complete the typical game flow:

```typescript
const { getFlowCompletion, hasVisitedState } = useStoryboard()

if (getFlowCompletion() === 100) {
  // User completed full game flow
  trackAnalytics('game_flow_completed')
}
```

### 2. Debugging Navigation Issues

Use the dev overlay to see the exact path users take:

```typescript
// Press Ctrl+Shift+S to open overlay
// View history to see navigation patterns
// Export data for analysis
```

### 3. Smart Back Navigation

Implement intelligent back button:

```typescript
const { getPreviousState } = useStoryboard()
const router = useRouter()

const goBack = () => {
  const previous = getPreviousState()
  if (previous) {
    router.push(previous.path)
  } else {
    router.push('/')
  }
}
```

### 4. A/B Testing Flow Variations

Track different navigation patterns:

```typescript
const { isFollowingGameFlow, flow } = useStoryboard()

if (!isFollowingGameFlow()) {
  // User took alternative path
  trackAnalytics('alternative_flow', {
    path: flow.value.history.map((s) => s.id),
  })
}
```

### 5. Session Analytics

Measure engagement:

```typescript
const { getSessionDuration, getAverageTimePerState, flow } = useStoryboard()

const analytics = {
  duration: getSessionDuration(),
  avgTimePerState: getAverageTimePerState(),
  totalTransitions: flow.value.totalTransitions,
  pagesVisited: new Set(flow.value.history.map((s) => s.id)).size,
}
```

## Performance

### Optimizations

- Automatic history trimming (configurable max size)
- Debounced localStorage writes
- Read-only reactive refs for performance
- Minimal bundle impact (~3KB gzipped)

### Best Practices

1. **Don't track too frequently**: Let route changes handle tracking
2. **Use metadata sparingly**: Only add relevant context
3. **Clean old data**: Reset flow periodically for long sessions
4. **Monitor history size**: Adjust `maxHistorySize` if needed

## Troubleshooting

### Dev Overlay Not Showing

- Check if in development mode (`import.meta.dev`)
- Verify keyboard shortcut: `Ctrl/Cmd + Shift + S`
- Check console for errors
- Ensure component is in app layout

### Tracking Not Working

```typescript
const { config, updateConfig } = useStoryboard()

// Ensure tracking is enabled
if (!config.value.enableTracking) {
  updateConfig({ enableTracking: true })
}
```

### LocalStorage Errors

If localStorage is full or blocked:

```typescript
// Disable persistence
updateConfig({ persistFlow: false })

// Or reduce history size
updateConfig({ maxHistorySize: 20 })
```

### TypeScript Errors

Make sure to import types:

```typescript
import type { StoryboardState, WorkflowStateId } from '~/composables/useStoryboard'
```

## Future Enhancements

Potential improvements:

- [ ] Visual flow diagram generator
- [ ] Export to different formats (CSV, PDF)
- [ ] Analytics dashboard integration
- [ ] Flow comparison tool
- [ ] Heatmap visualization
- [ ] Session replay capability
- [ ] Custom workflow definitions
- [ ] Integration with analytics services

## Contributing

To extend the storyboard plugin:

1. Add new workflow states in `plugins/storyboard.client.ts`
2. Update types in the same file
3. Document new states in this file
4. Test with dev overlay
5. Update tests if needed

## Support

For issues or questions:

- Check this documentation
- Use the dev overlay for debugging
- Check console for warnings/errors
- Report bugs via issue tracker

## License

Part of the Riddle Rush project. See main LICENSE file.
