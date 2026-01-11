# Performance Measurement

Built-in performance monitoring utilities using the Web Performance API.

## Features

- ✅ Mark and measure performance
- ✅ Automatic metrics tracking (count, average, min, max)
- ✅ Function execution timing
- ✅ Navigation timing metrics
- ✅ Resource timing analysis
- ✅ Memory usage monitoring
- ✅ Development-only performance reports

## Usage

### Basic Measurement

```typescript
const { mark, measure } = usePerformance()

// Start measurement
mark('data-fetch')

// ... perform operation
await fetchData()

// End measurement
const duration = measure('data-fetch')
console.log(`Operation took ${duration}ms`)
```

### Measure Function Execution

```typescript
const { measureFn } = usePerformance()

// Automatically measure async function
const data = await measureFn('fetch-riddles', async () => {
  return await fetch('/api/riddles').then((r) => r.json())
})
```

### Get Metrics

```typescript
const { getMetrics, getAllMetrics } = usePerformance()

// Get specific metric
const metric = getMetrics('data-fetch')
console.log(metric)
// {
//   count: 5,
//   total: 250,
//   average: 50,
//   min: 45,
//   max: 60,
//   last: 52
// }

// Get all metrics
const all = getAllMetrics()
```

### Navigation Timing

```typescript
const { getNavigationTiming } = usePerformance()

const timing = getNavigationTiming()
console.log(timing)
// {
//   dns: 5,
//   tcp: 10,
//   request: 50,
//   response: 100,
//   domProcessing: 200,
//   domContentLoaded: 50,
//   loadComplete: 30,
//   totalTime: 445
// }
```

### Resource Timing

```typescript
const { getResourceTiming } = usePerformance()

// Get all resources
const resources = getResourceTiming()

// Get specific resource
const images = getResourceTiming('image.png')

console.log(resources)
// [
//   { name: 'app.js', duration: 123, size: 45000, type: 'script' },
//   { name: 'style.css', duration: 56, size: 12000, type: 'css' }
// ]
```

### Memory Usage

```typescript
const { getMemoryUsage } = usePerformance()

const memory = getMemoryUsage()
console.log(memory)
// {
//   usedJSHeapSize: 10000000,
//   totalJSHeapSize: 15000000,
//   jsHeapSizeLimit: 2200000000,
//   usedPercentage: "0.45"
// }
```

### Performance Report

```typescript
const { logReport } = usePerformance()

// Log comprehensive performance report to console
logReport()
```

## Plugin Integration

The performance plugin automatically tracks:

- App initialization time
- Page transitions
- Vue component setup
- Route changes

In development, performance tools are exposed globally:

```javascript
// Available in browser console
window.__performance__.mark('custom-operation')
window.__performance__.measure('custom-operation')
window.__performance__.logReport()
```

## Use in Components

```vue
<script setup lang="ts">
const { measureFn } = usePerformance()

const loadGame = async () => {
  await measureFn('load-game', async () => {
    // Load game data
    await loadRiddles()
    await loadSettings()
  })
}

onMounted(() => {
  loadGame()
})
</script>
```

## Use with Composables

```typescript
// useGameActions.ts
export const useGameActions = () => {
  const { measureFn } = usePerformance()

  const submitAnswer = async (answer: string) => {
    return await measureFn('submit-answer', async () => {
      // Process answer logic
      const result = await checkAnswer(answer)
      return result
    })
  }

  return { submitAnswer }
}
```

## Use with $perf Plugin

```vue
<script setup lang="ts">
const { $perf } = useNuxtApp()

const handleAction = async () => {
  $perf.mark('user-action')
  // ... perform action
  $perf.measure('user-action')
}
</script>
```

## Performance Monitoring Best Practices

1. **Measure Critical Operations**
   - API calls
   - Data processing
   - UI rendering
   - Route transitions

2. **Use Descriptive Names**

   ```typescript
   // Good
   mark('fetch-user-profile')
   mark('render-game-board')

   // Bad
   mark('operation1')
   mark('thing')
   ```

3. **Review Metrics Regularly**

   ```typescript
   // In development, check performance
   if (process.env.NODE_ENV === 'development') {
     const { logReport } = usePerformance()
     logReport()
   }
   ```

4. **Clean Up in Production**

   ```typescript
   const { clearMetrics } = usePerformance()

   // Clear old metrics periodically
   setInterval(() => {
     clearMetrics()
   }, 300000) // Every 5 minutes
   ```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
interface PerformanceMetrics {
  [key: string]: {
    count: number
    total: number
    average: number
    min: number
    max: number
    last: number
  }
}
```

## Browser Support

Uses standard Web Performance API:

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Gracefully degrades if API is not available.
