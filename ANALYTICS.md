# Google Analytics Integration Guide

This project uses Google Analytics 4 (GA4) via the `nuxt-gtag` module for tracking user interactions and application performance.

## Setup

### 1. Get Google Analytics ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure for Development

Create a `.env` file in the project root:

```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 3. Configure for GitLab CI/CD

1. Go to your GitLab project
2. Navigate to Settings > CI/CD > Variables
3. Add a new variable:
   - Key: `GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX` (your Measurement ID)
   - Protected: Yes (optional)
   - Masked: Yes (recommended)

### 4. Install Dependencies

```bash
npm install
```

## Usage

### Automatic Page View Tracking

Page views are automatically tracked by the `nuxt-gtag` module. No additional code is needed for basic page view tracking.

### Custom Event Tracking

Use the `useAnalytics` composable in your components:

```vue
<script setup lang="ts">
const { trackEvent, trackGameEvent } = useAnalytics()

// Track a custom event
const handleButtonClick = () => {
  trackEvent('button_click', {
    button_name: 'start_game',
    location: 'homepage'
  })
}

// Track game-specific events
const handleGameStart = (category: string) => {
  trackGameEvent.start(category)
}

const handleCorrectAnswer = (category: string, itemName: string) => {
  trackGameEvent.answerCorrect(category, itemName)
}
</script>
```

### Available Game Events

The `trackGameEvent` helper provides pre-configured events:

```typescript
// Game started
trackGameEvent.start(category)

// Correct answer
trackGameEvent.answerCorrect(category, itemName)

// Incorrect answer
trackGameEvent.answerIncorrect(category, itemName)

// Game completed
trackGameEvent.gameComplete(category, score, durationInSeconds)

// Category selected
trackGameEvent.categorySelect(category)

// Item skipped
trackGameEvent.skipItem(category, itemName)
```

### Custom Events

For tracking other events:

```typescript
const { trackEvent } = useAnalytics()

// Simple event
trackEvent('share_clicked')

// Event with parameters
trackEvent('filter_applied', {
  filter_type: 'category',
  filter_value: 'sports'
})

// User interaction
trackEvent('settings_changed', {
  setting_name: 'theme',
  setting_value: 'dark'
})
```

### Example: Tracking in a Game Component

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { trackGameEvent } = useAnalytics()
const gameStore = useGameStore()

const startTime = ref<number>(0)

onMounted(() => {
  startTime.value = Date.now()
  trackGameEvent.start(gameStore.currentCategory)
})

const handleAnswer = (correct: boolean, itemName: string) => {
  if (correct) {
    trackGameEvent.answerCorrect(gameStore.currentCategory, itemName)
  } else {
    trackGameEvent.answerIncorrect(gameStore.currentCategory, itemName)
  }
}

const handleGameEnd = () => {
  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  trackGameEvent.gameComplete(
    gameStore.currentCategory,
    gameStore.score,
    duration
  )
}
</script>
```

## Privacy Considerations

### IP Anonymization

IP anonymization is enabled by default in `nuxt.config.ts`:

```typescript
gtag: {
  config: {
    anonymize_ip: true,
  }
}
```

### Cookie Consent

Consider implementing cookie consent based on your region's requirements (GDPR, CCPA, etc.):

```vue
<script setup lang="ts">
const { gtag } = useGtag()

const acceptCookies = () => {
  // Enable analytics
  gtag('consent', 'update', {
    analytics_storage: 'granted'
  })
}

const rejectCookies = () => {
  // Disable analytics
  gtag('consent', 'update', {
    analytics_storage: 'denied'
  })
}
</script>
```

### User Privacy

The configuration includes:
- IP anonymization enabled
- Secure cookie flags (`SameSite=None;Secure`)
- Analytics only enabled when `GOOGLE_ANALYTICS_ID` is set

## Testing

### Development

In development, analytics will only work if you set `GOOGLE_ANALYTICS_ID` in your `.env` file. Without it, the module is disabled and no data is sent.

To test analytics locally:

1. Set `GOOGLE_ANALYTICS_ID` in `.env`
2. Run `npm run dev`
3. Open your browser's Network tab
4. Look for requests to `google-analytics.com/g/collect`
5. Check the [GA4 Realtime report](https://analytics.google.com/) to see events

### Production

In production (GitLab Pages), analytics will work automatically if you've set the `GOOGLE_ANALYTICS_ID` environment variable in GitLab CI/CD settings.

### Debug Mode

To see detailed analytics logs in the console:

```typescript
// In nuxt.config.ts
gtag: {
  id: process.env.GOOGLE_ANALYTICS_ID || '',
  enabled: !!process.env.GOOGLE_ANALYTICS_ID,
  config: {
    anonymize_ip: true,
    debug_mode: true, // Add this for debugging
  },
}
```

## Useful Reports in GA4

### Engagement Reports
- **Events**: See all tracked events and their counts
- **Pages and screens**: View most visited pages
- **Realtime**: Monitor current active users

### Custom Reports

Create custom reports to track:
1. Game completion rate
2. Average game duration by category
3. Most popular categories
4. Success rate (correct vs incorrect answers)

### Setting Up Custom Events in GA4

1. Go to GA4 > Configure > Events
2. Click "Create event"
3. Set up conditions for custom events
4. Mark important events as "Conversions"

## Troubleshooting

### Events not showing in GA4

1. Check that `GOOGLE_ANALYTICS_ID` is set correctly
2. Wait up to 24 hours for data to appear in standard reports (use Realtime for immediate feedback)
3. Verify the Measurement ID format (`G-XXXXXXXXXX`)
4. Check browser console for errors
5. Ensure you're not blocking analytics with an ad blocker

### Analytics not working in CI/CD

1. Verify the environment variable is set in GitLab CI/CD settings
2. Check that the variable name is `GOOGLE_ANALYTICS_ID`
3. Ensure the build logs don't show the variable as empty
4. Test the deployed site in an incognito window

### CORS or CSP Issues

If you have Content Security Policy enabled, ensure it allows Google Analytics:

```typescript
// In nuxt.config.ts
app: {
  head: {
    meta: [
      {
        'http-equiv': 'Content-Security-Policy',
        content: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com;"
      }
    ]
  }
}
```

## Best Practices

1. **Event Naming**: Use lowercase with underscores (e.g., `game_start`, not `GameStart`)
2. **Parameters**: Keep parameter names consistent and meaningful
3. **Don't Over-track**: Only track events that provide actionable insights
4. **Test Thoroughly**: Test events in development before deploying
5. **Privacy First**: Always respect user privacy and comply with regulations
6. **Document Events**: Keep a list of all tracked events and their purposes

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [nuxt-gtag Module](https://github.com/johannschopplich/nuxt-gtag)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
