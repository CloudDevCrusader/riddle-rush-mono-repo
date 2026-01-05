/**
 * Storyboard Composable
 * Interface for interacting with the storyboard plugin
 */
export const useStoryboard = () => {
  const nuxtApp = useNuxtApp()
  // Use any to avoid type issues with provide/inject
  const storyboard = (nuxtApp as any).$storyboard || (nuxtApp as any)._provided?.storyboard

  if (!storyboard) {
    // Return a mock object if storyboard is not available to avoid crashes
    return {
      flow: ref({ currentState: null, history: [], totalTransitions: 0, sessionStartTime: 0 }),
      config: ref({
        enableDevOverlay: false,
        enableTracking: false,
        maxHistorySize: 50,
        persistFlow: false,
      }),
      showDevOverlay: ref(false),
      recordTransition: () => {},
      resetFlow: () => {},
      updateConfig: () => {},
      toggleDevOverlay: () => {},
      getPreviousState: () => null,
      hasVisitedState: () => false,
      getStateVisitCount: () => 0,
      getGameFlowPath: () => [],
      isFollowingGameFlow: () => false,
      getFlowCompletion: () => 0,
      getSessionDuration: () => 0,
      getAverageTimePerState: () => 0,
      WORKFLOW_STATES: {},
    }
  }

  return {
    flow: storyboard.flow,
    config: storyboard.config,
    showDevOverlay: storyboard.showDevOverlay,

    // Actions
    recordTransition: storyboard.recordTransition,
    resetFlow: storyboard.resetFlow,
    updateConfig: storyboard.updateConfig,
    toggleDevOverlay: storyboard.toggleDevOverlay,

    // Getters
    getPreviousState: storyboard.getPreviousState,
    hasVisitedState: storyboard.hasVisitedState,
    getStateVisitCount: storyboard.getStateVisitCount,
    getGameFlowPath: storyboard.getGameFlowPath,
    isFollowingGameFlow: storyboard.isFollowingGameFlow,
    getFlowCompletion: storyboard.getFlowCompletion,
    getSessionDuration: storyboard.getSessionDuration,
    getAverageTimePerState: storyboard.getAverageTimePerState,

    // Constants
    WORKFLOW_STATES: storyboard.WORKFLOW_STATES,
  }
}
