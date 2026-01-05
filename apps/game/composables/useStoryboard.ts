/**
 * Composable for accessing storyboard functionality
 * Provides easy access to workflow tracking and navigation helpers
 */
import {
  WORKFLOW_STATES,
  type StoryboardState,
  type StoryboardFlow,
  type StoryboardConfig,
  type WorkflowStateId,
} from '../plugins/storyboard.client'

export const useStoryboard = () => {
  const { $storyboard } = useNuxtApp()

  return {
    // State
    flow: $storyboard.flow,
    config: $storyboard.config,
    showDevOverlay: $storyboard.showDevOverlay,

    // Actions
    recordTransition: $storyboard.recordTransition,
    resetFlow: $storyboard.resetFlow,
    updateConfig: $storyboard.updateConfig,
    toggleDevOverlay: $storyboard.toggleDevOverlay,

    // Getters
    getPreviousState: $storyboard.getPreviousState,
    hasVisitedState: $storyboard.hasVisitedState,
    getStateVisitCount: $storyboard.getStateVisitCount,
    getGameFlowPath: $storyboard.getGameFlowPath,
    isFollowingGameFlow: $storyboard.isFollowingGameFlow,
    getFlowCompletion: $storyboard.getFlowCompletion,
    getSessionDuration: $storyboard.getSessionDuration,
    getAverageTimePerState: $storyboard.getAverageTimePerState,

    // Constants
    WORKFLOW_STATES: $storyboard.WORKFLOW_STATES,
  }
}

// Re-export types for convenience
export type { StoryboardState, StoryboardFlow, StoryboardConfig, WorkflowStateId }
export { WORKFLOW_STATES }
