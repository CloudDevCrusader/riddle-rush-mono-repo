/**
 * Animation Constants
 *
 * Centralized location for animation timing values used across pages and components.
 * These replace magic numbers to improve code readability and maintainability.
 *
 * Note: Some constants (WHEEL_FADE_DELAY_MS, RESULTS_DISPLAY_DURATION_MS, NAVIGATION_DELAY_MS)
 * are already defined in @riddle-rush/shared/constants and should be imported from there.
 */

// ============================================================================
// Fortune Wheel Animation
// ============================================================================

/** Duration of the wheel spin animation in milliseconds */
export const WHEEL_SPIN_DURATION_MS = 1800

/** Delay before emitting spin-complete event after wheel stops (ms) */
export const WHEEL_SPIN_COMPLETE_DELAY_MS = 1500

// ============================================================================
// Splash Screen
// ============================================================================

/** Total duration of the splash screen loading simulation (ms) */
export const SPLASH_LOADING_DURATION_MS = 2500

/** Interval for updating splash screen progress bar (ms) */
export const SPLASH_PROGRESS_INTERVAL_MS = 20

/** Delay showing 100% before starting fade-out (ms) */
export const SPLASH_COMPLETE_DELAY_MS = 300

/** Duration of splash screen fade-out animation (ms) */
export const SPLASH_FADE_OUT_DURATION_MS = 500

// ============================================================================
// Page Transitions & Navigation
// ============================================================================

/** Initial progress percentage shown during simulated loading */
export const LOADING_INITIAL_PROGRESS = 30

/** Secondary progress percentage shown during simulated loading */
export const LOADING_SECONDARY_PROGRESS = 70

/** Delay for first loading progress step (ms) */
export const LOADING_STEP_DELAY_MS = 300

/** Delay for second loading progress step (ms) */
export const LOADING_STEP_SECONDARY_DELAY_MS = 200

/** Debounce delay for navigation actions (ms) */
export const NAVIGATION_DEBOUNCE_MS = 200

// ============================================================================
// Modal & Component Transitions
// ============================================================================

/** Delay before clearing modal data after close (ms) */
export const MODAL_CLOSE_DATA_CLEAR_DELAY_MS = 300

/** Duration of wheel spin auto-start delay (ms) */
export const WHEEL_AUTO_SPIN_DELAY_MS = 100

// ============================================================================
// CSS Transition Durations (for reference when matching JS timing)
// ============================================================================

/**
 * Standard page transition duration (ms)
 * Matches CSS transition timing in PageTransition.vue
 */
export const PAGE_TRANSITION_DURATION_MS = 800

/**
 * Scale-in animation duration (ms)
 * Matches .animate-scale-in keyframe animation
 */
export const SCALE_IN_ANIMATION_MS = 600

/**
 * Fade-in animation duration (ms)
 * Matches .animate-fade-in keyframe animation
 */
export const FADE_IN_ANIMATION_MS = 800
