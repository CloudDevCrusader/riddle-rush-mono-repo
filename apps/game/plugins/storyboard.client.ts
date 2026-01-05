/**
 * Storyboard Plugin
 * Manages game workflow, state transitions, and flow visualization
 * Provides tracking, navigation helpers, and development tools
 */
import type { Router } from 'vue-router'

export interface StoryboardState {
  id: string
  name: string
  path: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface StoryboardFlow {
  currentState: StoryboardState | null
  history: StoryboardState[]
  totalTransitions: number
  sessionStartTime: number
}

export interface StoryboardConfig {
  enableDevOverlay: boolean
  enableTracking: boolean
  maxHistorySize: number
  persistFlow: boolean
}

const STORYBOARD_STORAGE_KEY = 'riddle-rush-storyboard-flow'
const DEFAULT_MAX_HISTORY = 50

// Define the game workflow states
export const WORKFLOW_STATES = {
  MAIN_MENU: { id: 'main_menu', name: 'Main Menu', path: '/' },
  LANGUAGE: { id: 'language', name: 'Language Selection', path: '/language' },
  SETTINGS: { id: 'settings', name: 'Settings', path: '/settings' },
  CREDITS: { id: 'credits', name: 'Credits', path: '/credits' },
  PLAYERS: { id: 'players', name: 'Player Setup', path: '/players' },
  ROUND_START: { id: 'round_start', name: 'Round Start', path: '/round-start' },
  GAME: { id: 'game', name: 'Game Play', path: '/game' },
  RESULTS: { id: 'results', name: 'Results', path: '/results' },
  LEADERBOARD: { id: 'leaderboard', name: 'Leaderboard', path: '/leaderboard' },
} as const

export type WorkflowStateId = (typeof WORKFLOW_STATES)[keyof typeof WORKFLOW_STATES]['id']

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter() as Router

  // Configuration
  const config = ref<StoryboardConfig>({
    enableDevOverlay: import.meta.dev,
    enableTracking: true,
    maxHistorySize: DEFAULT_MAX_HISTORY,
    persistFlow: true,
  })

  // Flow state
  const flow = ref<StoryboardFlow>({
    currentState: null,
    history: [],
    totalTransitions: 0,
    sessionStartTime: Date.now(),
  })

  // Dev overlay visibility
  const showDevOverlay = ref(false)

  /**
   * Load persisted flow from localStorage
   */
  const loadPersistedFlow = (): StoryboardFlow | null => {
    if (!config.value.persistFlow) {
      return null
    }

    try {
      const stored = localStorage.getItem(STORYBOARD_STORAGE_KEY)
      if (!stored) {
        return null
      }

      const parsed = JSON.parse(stored)
      return parsed as StoryboardFlow
    } catch {
      return null
    }
  }

  /**
   * Persist flow to localStorage
   */
  const persistFlow = () => {
    if (!config.value.persistFlow) {
      return
    }

    try {
      localStorage.setItem(STORYBOARD_STORAGE_KEY, JSON.stringify(flow.value))
    } catch {
      // Silent fail - not critical
    }
  }

  /**
   * Find workflow state by path
   */
  const findStateByPath = (
    path: string
  ): (typeof WORKFLOW_STATES)[keyof typeof WORKFLOW_STATES] | null => {
    return Object.values(WORKFLOW_STATES).find((state) => state.path === path) || null
  }

  /**
   * Record a state transition
   */
  const recordTransition = (stateId: WorkflowStateId, metadata?: Record<string, unknown>): void => {
    if (!config.value.enableTracking) {
      return
    }

    const workflowState = Object.values(WORKFLOW_STATES).find((s) => s.id === stateId)
    if (!workflowState) {
      return
    }

    const state: StoryboardState = {
      id: workflowState.id,
      name: workflowState.name,
      path: workflowState.path,
      timestamp: Date.now(),
      metadata,
    }

    flow.value.currentState = state
    flow.value.history.push(state)
    flow.value.totalTransitions += 1

    // Trim history if needed
    if (flow.value.history.length > config.value.maxHistorySize) {
      flow.value.history = flow.value.history.slice(-config.value.maxHistorySize)
    }

    persistFlow()

    // Emit event for tracking/analytics
    // @ts-expect-error - nuxt hooks type issue
    nuxtApp.callHook('storyboard:transition', state)
  }

  /**
   * Get the previous state in history
   */
  const getPreviousState = (): StoryboardState | null => {
    if (flow.value.history.length < 2) {
      return null
    }
    return flow.value.history[flow.value.history.length - 2] || null
  }

  /**
   * Check if user has visited a specific state
   */
  const hasVisitedState = (stateId: WorkflowStateId): boolean => {
    return flow.value.history.some((state) => state.id === stateId)
  }

  /**
   * Get state visit count
   */
  const getStateVisitCount = (stateId: WorkflowStateId): number => {
    return flow.value.history.filter((state) => state.id === stateId).length
  }

  /**
   * Get the typical game flow path
   */
  const getGameFlowPath = (): string[] => {
    return [
      WORKFLOW_STATES.MAIN_MENU.id,
      WORKFLOW_STATES.PLAYERS.id,
      WORKFLOW_STATES.ROUND_START.id,
      WORKFLOW_STATES.GAME.id,
      WORKFLOW_STATES.RESULTS.id,
    ]
  }

  /**
   * Check if user is following the typical game flow
   */
  const isFollowingGameFlow = (): boolean => {
    const gameFlow = getGameFlowPath()
    const recentHistory = flow.value.history.slice(-gameFlow.length).map((s) => s.id)

    return gameFlow.every((stateId, index) => recentHistory[index] === stateId)
  }

  /**
   * Get flow completion percentage
   */
  const getFlowCompletion = (): number => {
    const gameFlow = getGameFlowPath()
    const visitedStates = new Set(flow.value.history.map((s) => s.id))
    const completedStates = gameFlow.filter((stateId) => visitedStates.has(stateId))

    return Math.round((completedStates.length / gameFlow.length) * 100)
  }

  /**
   * Reset flow (e.g., when starting a new game session)
   */
  const resetFlow = () => {
    flow.value = {
      currentState: null,
      history: [],
      totalTransitions: 0,
      sessionStartTime: Date.now(),
    }
    persistFlow()
    // @ts-expect-error - nuxt hooks type issue
    nuxtApp.callHook('storyboard:reset')
  }

  /**
   * Toggle dev overlay
   */
  const toggleDevOverlay = () => {
    if (!config.value.enableDevOverlay) {
      return
    }
    showDevOverlay.value = !showDevOverlay.value
  }

  /**
   * Update configuration
   */
  const updateConfig = (newConfig: Partial<StoryboardConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  /**
   * Get session duration in seconds
   */
  const getSessionDuration = (): number => {
    return Math.floor((Date.now() - flow.value.sessionStartTime) / 1000)
  }

  /**
   * Get average time per state
   */
  const getAverageTimePerState = (): number => {
    if (flow.value.history.length < 2) {
      return 0
    }

    const durations: number[] = []
    for (let i = 1; i < flow.value.history.length; i++) {
      const prev = flow.value.history[i - 1]
      const current = flow.value.history[i]
      if (prev && current) {
        const duration = current.timestamp - prev.timestamp
        durations.push(duration)
      }
    }

    const total = durations.reduce((sum, d) => sum + d, 0)
    return Math.floor(total / durations.length / 1000) // Return in seconds
  }

  // Load persisted flow on initialization
  if (import.meta.client) {
    const persisted = loadPersistedFlow()
    if (persisted) {
      // Update session start time but keep history
      flow.value = {
        ...persisted,
        sessionStartTime: Date.now(),
      }
    }
  }

  // Track route changes
  router.afterEach((to) => {
    const state = findStateByPath(to.path)
    if (state) {
      recordTransition(state.id as WorkflowStateId, {
        query: to.query,
        params: to.params,
      })
    }
  })

  // Keyboard shortcut for dev overlay (Ctrl/Cmd + Shift + S)
  if (import.meta.client && config.value.enableDevOverlay) {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        toggleDevOverlay()
      }
    })
  }

  // Provide storyboard API
  const storyboard = {
    // State
    flow: readonly(flow),
    config: readonly(config),
    showDevOverlay: readonly(showDevOverlay),

    // Actions
    recordTransition,
    resetFlow,
    updateConfig,
    toggleDevOverlay,

    // Getters
    getPreviousState,
    hasVisitedState,
    getStateVisitCount,
    getGameFlowPath,
    isFollowingGameFlow,
    getFlowCompletion,
    getSessionDuration,
    getAverageTimePerState,

    // Constants
    WORKFLOW_STATES,
  }

  return {
    provide: {
      storyboard,
    },
  }
})
