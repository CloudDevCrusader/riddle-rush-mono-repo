# Parallel Execution Plan - Riddle Rush v1.0.3

## Overview

This plan breaks down the refactoring and testing work into **4 parallel workstreams** that can be executed simultaneously by different agents or developers.

---

## 🎯 Workstream A: Testing Infrastructure (High Priority)

**Owner:** Agent A / Test Engineer  
**Estimated Time:** 6-8 hours  
**Dependencies:** None (can start immediately)

### Tasks:

#### A1: Create Unit Tests for useWebSocket

**File:** `tests/unit/use-websocket.spec.ts`
**Lines to test:** 245 lines
**Focus:**

- Mock Socket.IO client
- Test connection lifecycle (connect, disconnect, reconnect)
- Test event handling (emit, on, off)
- Test error handling and retry logic
- Test connection status states
- Test room joining/leaving

```typescript
// Key scenarios to test:
- Initial state (disconnected)
- Successful connection
- Connection failure with retry
- Disconnection and reconnection
- Message sending/receiving
- Error handling
- Room management
- Clean disconnection on unmount
```

**Verification:**

```bash
pnpm run test:unit -- use-websocket
```

---

#### A2: Create Unit Tests for useIndexedDB

**File:** `tests/unit/use-indexed-db.spec.ts`
**Lines to test:** 295 lines
**Focus:**

- Mock IndexedDB using fake-indexeddb
- Test database initialization and upgrade
- Test CRUD operations for all stores
- Test transaction handling
- Test error handling (quota exceeded, access denied)
- Test concurrent access

```typescript
// Key scenarios to test:
- Database initialization
- Save/load game session
- Save/load game history
- Save/load statistics
- Save/load leaderboard
- Save/load settings
- Handle quota exceeded
- Handle database upgrade
- Clear old data
```

**Verification:**

```bash
pnpm run test:unit -- use-indexed-db
```

---

#### A3: Create Unit Tests for useAudio (New Enhanced Version)

**File:** `tests/unit/use-audio.spec.ts`
**Lines to test:** ~400 lines (enhanced)
**Focus:**

- Mock AudioContext and Web Audio API
- Test all 20+ sound effects
- Test volume control (setVolume, mute, unmute)
- Test settings integration
- Test audio context initialization
- Test sound queueing

```typescript
// Key scenarios to test:
- Audio context initialization
- All sound methods (playSuccess, playError, etc.)
- Volume controls (setVolume, mute, unmute, toggleMute)
- Master volume application
- Settings-based enable/disable
- Multiple simultaneous sounds
- Audio context resume on user interaction
```

**Verification:**

```bash
pnpm run test:unit -- use-audio
```

---

#### A4: Create Unit Tests for useStatistics

**File:** `tests/unit/use-statistics.spec.ts`
**Lines to test:** 225 lines
**Focus:**

- Test statistics calculation
- Test data aggregation
- Test performance metrics
- Test persistence

**Verification:**

```bash
pnpm run test:unit -- use-statistics
```

---

#### A5: Create Unit Tests for useErrorSync

**File:** `tests/unit/use-error-sync.spec.ts`
**Lines to test:** 230 lines
**Focus:**

- Test error tracking
- Test error reporting
- Test retry logic
- Test offline handling

**Verification:**

```bash
pnpm run test:unit -- use-error-sync
```

---

#### A6: Run Full Test Suite

```bash
pnpm run test:unit
pnpm run test:unit:coverage
```

**Success Criteria:**

- All tests pass ✅
- Coverage >75% ✅
- No flaky tests ✅

---

## 🔧 Workstream B: Code Refactoring (Medium Priority)

**Owner:** Agent B / Refactoring Specialist  
**Estimated Time:** 4-6 hours  
**Dependencies:** None (can start immediately)

### Tasks:

#### B1: Refactor useIndexedDB - Extract Store Operations

**File:** `composables/useIndexedDB.ts`
**Goal:** Reduce complexity by extracting store operations

**Refactoring Steps:**

1. Extract each store's operations into separate functions
2. Create a generic store interface
3. Add better error handling
4. Improve type safety

**Example Structure:**

```typescript
// composables/db/game-session-store.ts
export const createGameSessionStore = (db: IDBPDatabase) => ({
  async save(session: GameSession) { ... },
  async load() { ... },
  async delete(id: string) { ... },
})

// composables/db/statistics-store.ts
export const createStatisticsStore = (db: IDBPDatabase) => ({
  async save(stats: GameStatistics) { ... },
  async load() { ... },
  async update(updates: Partial<GameStatistics>) { ... },
})

// composables/useIndexedDB.ts (simplified)
export function useIndexedDB() {
  const db = await getDB()
  return {
    gameSession: createGameSessionStore(db),
    statistics: createStatisticsStore(db),
    // ... other stores
  }
}
```

**Verification:**

```bash
pnpm run typecheck
pnpm run test:unit -- use-indexed-db
```

---

#### B2: Refactor useWebSocket - Extract Reconnection Logic

**File:** `composables/useWebSocket.ts`
**Goal:** Simplify connection management

**Refactoring Steps:**

1. Extract reconnection logic to `useWebSocketReconnection.ts`
2. Extract event handling to `useWebSocketEvents.ts`
3. Simplify main composable
4. Add connection pool management

**Example Structure:**

```typescript
// composables/socket/reconnection.ts
export const useReconnection = (socket: Socket) => {
  const reconnect = () => { ... }
  const handleDisconnect = () => { ... }
  return { reconnect, handleDisconnect }
}

// composables/socket/events.ts
export const useSocketEvents = (socket: Socket) => {
  const on = (event: string, handler: Function) => { ... }
  const emit = (event: string, data: any) => { ... }
  return { on, emit }
}
```

**Verification:**

```bash
pnpm run typecheck
pnpm run test:unit -- use-websocket
```

---

#### B3: Optimize usePerformance - Reduce Bundle Size

**File:** `composables/usePerformance.ts`
**Goal:** Reduce 258 lines by removing unused code

**Actions:**

1. Remove unused performance metrics
2. Lazy load heavy performance monitoring
3. Tree-shake unused features
4. Add performance budget warnings

**Verification:**

```bash
pnpm run build
# Check bundle size
```

---

#### B4: Extract useGameActions Logic

**File:** `composables/useGameActions.ts`
**Goal:** Split into domain-specific composables

**Split into:**

- `useAnswerSubmission.ts` - Answer handling
- `useRoundManagement.ts` - Round transitions
- `useScoreCalculation.ts` - Scoring logic

**Verification:**

```bash
pnpm run typecheck
```

---

## 🎮 Workstream C: Manual Testing & Bug Discovery (High Priority)

**Owner:** Agent C / QA Engineer  
**Estimated Time:** 3-4 hours  
**Dependencies:** Working dev server

### Setup:

#### C1: Install Required Tools

```bash
# Install Playwright browsers
cd apps/game
pnpm exec playwright install

# Start dev server
pnpm run dev
```

---

### Manual Testing Scenarios:

#### C2: Test Game Flow (30 minutes)

**Steps:**

1. Open browser to http://localhost:3000
2. Create a new game
3. Play through 5 rounds
4. Submit correct and incorrect answers
5. Check score calculation
6. Complete the game
7. View results

**Look for:**

- ❌ UI glitches
- ❌ Score calculation errors
- ❌ Timer issues
- ❌ Animation problems
- ❌ State persistence bugs
- ❌ Navigation issues

**Document findings in:** `BUGS-FOUND.md`

---

#### C3: Test Audio System (20 minutes)

**Steps:**

1. Enable sound in settings
2. Play a game and listen for:
   - Success sound on correct answer
   - Error sound on wrong answer
   - New round fanfare
   - Round complete sound
   - Victory fanfare at end
3. Test new sounds:
   - Countdown timer (last 10 seconds)
   - Combo sounds (multiple correct in a row)
   - Achievement unlock sounds
4. Test volume controls:
   - Adjust volume slider
   - Mute/unmute
   - Verify sounds respect settings

**Look for:**

- ❌ Missing sounds
- ❌ Overlapping/clipping audio
- ❌ Volume not applying
- ❌ Sounds playing when muted
- ❌ Audio lag

---

#### C4: Test Offline Mode (20 minutes)

**Steps:**

1. Start a game online
2. Disconnect network (Chrome DevTools > Network > Offline)
3. Continue playing
4. Check that:
   - Game continues working
   - State saves locally
   - Offline indicator shows
5. Reconnect network
6. Verify sync happens

**Look for:**

- ❌ App crashes offline
- ❌ Data loss
- ❌ No offline indicator
- ❌ Sync failures

---

#### C5: Test PWA Installation (15 minutes)

**Steps:**

1. Open in Chrome/Edge
2. Install as PWA (A2HS prompt)
3. Open installed app
4. Test functionality
5. Check updates work

**Look for:**

- ❌ Install prompt not showing
- ❌ PWA doesn't work offline
- ❌ Updates not detected
- ❌ Icons incorrect

---

#### C6: Test Responsiveness (20 minutes)

**Test on:**

- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)
- Mobile landscape

**Look for:**

- ❌ Layout breaks
- ❌ Text overflow
- ❌ Buttons not tappable
- ❌ Content off-screen

---

#### C7: Test Accessibility (15 minutes)

**Use:**

- Screen reader (VoiceOver/NVDA)
- Keyboard navigation only
- High contrast mode

**Look for:**

- ❌ Missing labels
- ❌ Poor focus indicators
- ❌ Keyboard traps
- ❌ Unclear announcements

---

#### C8: Test Performance (15 minutes)

**Use Lighthouse:**

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

**Check:**

- Performance score >90
- Accessibility score >95
- Best Practices score >90
- SEO score >90

**Look for:**

- ❌ Slow load times
- ❌ Memory leaks
- ❌ Janky animations
- ❌ Large bundle sizes

---

#### C9: Test Edge Cases (30 minutes)

**Scenarios:**

1. Very long player names
2. Special characters in input
3. Rapid clicking/tapping
4. Network timeouts
5. Browser back button
6. Page refresh mid-game
7. Multiple tabs open
8. Low battery mode
9. Slow 3G network

**Look for:**

- ❌ Crashes
- ❌ Data corruption
- ❌ Race conditions
- ❌ Validation bypasses

---

#### C10: Create Bug Report

**File:** `BUGS-FOUND.md`

```markdown
# Bugs Found - Manual Testing Session

## Critical (Blocks Release)

1. [BUG-001] Description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos

## High (Should Fix Before Release)

...

## Medium (Can Fix in Patch)

...

## Low (Nice to Have)

...

## Observations (Not Bugs)

...
```

---

## 🏗️ Workstream D: Build & Infrastructure (Medium Priority)

**Owner:** Agent D / DevOps Engineer  
**Estimated Time:** 3-4 hours  
**Dependencies:** None (can start immediately)

### Tasks:

#### D1: Optimize Build Configuration

**File:** `apps/game/nuxt.config.ts`

**Actions:**

1. Review and optimize Vite config
2. Enable build optimizations
3. Configure bundle splitting
4. Add compression

```typescript
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'pinia'],
            socket: ['socket.io-client'],
            idb: ['idb'],
            lodash: ['lodash-es'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  },
})
```

**Verification:**

```bash
pnpm run build
pnpm run build --analyze
```

---

#### D2: Create Build Verification Script

**File:** `apps/game/scripts/verify-build.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Verifying production build..."

# Check critical files exist
test -f .output/public/index.html || exit 1
test -f .output/public/sw.js || exit 1

# Check bundle size
TOTAL_SIZE=$(du -sk .output/public | cut -f1)
MAX_SIZE=2048 # 2MB

if [ $TOTAL_SIZE -gt $MAX_SIZE ]; then
  echo "❌ Bundle too large: ${TOTAL_SIZE}KB (max: ${MAX_SIZE}KB)"
  exit 1
fi

echo "✅ Build verified: ${TOTAL_SIZE}KB"
```

**Verification:**

```bash
chmod +x scripts/verify-build.sh
./scripts/verify-build.sh
```

---

#### D3: Document Deployment Process

**File:** `DEPLOYMENT.md`

```markdown
# Deployment Guide - Riddle Rush Game

## Prerequisites

- AWS CLI configured
- Terraform installed
- Node.js 18+
- pnpm 10+

## Steps

1. Run tests
2. Build production bundle
3. Deploy infrastructure
4. Upload assets
5. Invalidate cache
6. Verify deployment

## Rollback Procedure

...
```

---

#### D4: Create Pre-deployment Checklist

**File:** `PRE-DEPLOY-CHECKLIST.md`

```markdown
# Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Test coverage >75%
- [ ] Bundle size <2MB
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] PWA manifest valid
- [ ] Service worker functional
- [ ] Offline mode working
- [ ] Audio system tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Performance optimized
```

---

#### D5: Setup Monitoring

**Actions:**

1. Configure CloudWatch alarms
2. Setup error tracking
3. Add performance monitoring
4. Create dashboard

---

## 📊 Progress Tracking

### Task Status Board

| Workstream | Task                    | Status     | Owner   | Time |
| ---------- | ----------------------- | ---------- | ------- | ---- |
| A          | useWebSocket tests      | ⏳ Pending | Agent A | 2h   |
| A          | useIndexedDB tests      | ⏳ Pending | Agent A | 2h   |
| A          | useAudio tests          | ⏳ Pending | Agent A | 1.5h |
| A          | useStatistics tests     | ⏳ Pending | Agent A | 1h   |
| A          | useErrorSync tests      | ⏳ Pending | Agent A | 1h   |
| B          | Refactor useIndexedDB   | ⏳ Pending | Agent B | 2h   |
| B          | Refactor useWebSocket   | ⏳ Pending | Agent B | 1.5h |
| B          | Optimize usePerformance | ⏳ Pending | Agent B | 1h   |
| B          | Extract useGameActions  | ⏳ Pending | Agent B | 1.5h |
| C          | Manual game testing     | ⏳ Pending | Agent C | 30m  |
| C          | Audio testing           | ⏳ Pending | Agent C | 20m  |
| C          | Offline testing         | ⏳ Pending | Agent C | 20m  |
| C          | PWA testing             | ⏳ Pending | Agent C | 15m  |
| C          | Responsive testing      | ⏳ Pending | Agent C | 20m  |
| C          | A11y testing            | ⏳ Pending | Agent C | 15m  |
| C          | Performance testing     | ⏳ Pending | Agent C | 15m  |
| C          | Edge case testing       | ⏳ Pending | Agent C | 30m  |
| C          | Bug report              | ⏳ Pending | Agent C | 30m  |
| D          | Build optimization      | ⏳ Pending | Agent D | 1h   |
| D          | Build verification      | ⏳ Pending | Agent D | 30m  |
| D          | Deployment docs         | ⏳ Pending | Agent D | 1h   |
| D          | Pre-deploy checklist    | ⏳ Pending | Agent D | 30m  |
| D          | Setup monitoring        | ⏳ Pending | Agent D | 1h   |

---

## 🚀 Execution Order

### Phase 1: Parallel Work (Can Run Simultaneously)

- **Workstream A**: Start all test creation (A1-A5)
- **Workstream B**: Start all refactoring (B1-B4)
- **Workstream C**: Start manual testing (C2-C9)
- **Workstream D**: Start build optimization (D1-D4)

**Estimated Time:** 4-8 hours (parallel)

---

### Phase 2: Integration & Verification (Sequential)

1. Run full test suite (A6)
2. Run build verification (D2)
3. Review bug reports (C10)
4. Fix critical bugs
5. Re-test
6. Final workspace check

**Estimated Time:** 2-3 hours

---

### Phase 3: Deployment (Sequential)

1. Final pre-deploy checklist
2. Build production bundle
3. Deploy infrastructure
4. Upload assets
5. Smoke tests
6. Tag release

**Estimated Time:** 1-2 hours

---

## 🎯 Success Criteria

### Code Quality

- ✅ All tests passing (100%)
- ✅ Test coverage >75%
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Bundle size <2MB

### Functionality

- ✅ All game flows working
- ✅ Audio system functional
- ✅ Offline mode working
- ✅ PWA installable
- ✅ No critical bugs

### Performance

- ✅ Lighthouse score >90
- ✅ Load time <2s
- ✅ Smooth animations (60fps)
- ✅ Memory usage stable

### Deployment

- ✅ Infrastructure deployed
- ✅ Assets uploaded
- ✅ Cache invalidated
- ✅ Smoke tests passed
- ✅ Git tag created

---

## 📝 Notes

- **Communication:** Use shared document for bug tracking
- **Conflicts:** Coordinate on shared files (nuxt.config.ts)
- **Testing:** Share test environment (localhost:3000)
- **Commits:** Each workstream commits independently

---

## 🔄 Daily Standup Template

**What I completed yesterday:**

- [ ] Task 1
- [ ] Task 2

**What I'm working on today:**

- [ ] Task 3
- [ ] Task 4

**Blockers:**

- None / [Describe blocker]

---

**Last Updated:** 2026-02-06  
**Version:** 1.0.3  
**Sprint:** Production Optimization
