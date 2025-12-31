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
