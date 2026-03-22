import { useGameSession } from '../stores/hooks/useGameSession'
import { useLogger } from './useLogger'

/**
 * Composable for common game actions with error handling and user feedback
 */
export function useGameActions() {
  const gameSession = useGameSession()
  const playerActions = usePlayerActions()
  const router = useRouter()
  const toast = useToast()
  const audio = useAudio()
  const { t } = useI18n()
  const logger = useLogger()

  const getFlowState = () =>
    (
      gameSession as {
        flowState?: {
          value?: 'setup' | 'in-round' | 'round-complete' | 'decision' | 'completed'
        }
      }
    ).flowState?.value ?? 'setup'

  /**
   * Start a new game session
   */
  const startNewGame = async () => {
    try {
      await gameSession.startNewGame()
      audio.playNewRound()
      toast.success(t('game.new_round_started', 'New round started!'))
      return true
    } catch (error) {
      logger.error('Error starting new game:', error)
      toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
      return false
    }
  }

  /**
   * Resume existing game or start new one
   */
  const resumeOrStartGame = async () => {
    const hadSession = gameSession.hasActiveSession.value

    try {
      await gameSession.resumeOrStartNewGame()

      if (!hadSession) {
        audio.playNewRound()
        toast.info(t('game.welcome', 'Welcome! Guess a word from the category.'))
      } else {
        toast.info(t('game.resumed', 'Game resumed!'))
      }

      return true
    } catch (error) {
      logger.error('Error resuming game:', error)
      toast.error(t('game.error_resuming', 'Failed to load game. Starting fresh.'))
      return false
    }
  }

  /**
   * End current game session
   */
  const endGame = async () => {
    try {
      await gameSession.endGame()
      toast.success(t('game.game_ended', 'Game ended! Check your statistics.'))
      await router.push('/')
      return true
    } catch (error) {
      logger.error('Error ending game:', error)
      toast.error(t('game.error_ending', 'Failed to save game results'))
      return false
    }
  }

  /**
   * Share game score using Web Share API
   */
  const shareScore = async (score?: number) => {
    const finalScore = score ?? gameSession.currentSession.value?.score ?? 0

    if (!navigator.share) {
      toast.info(t('share.not_supported', 'Sharing is not supported on this device'))
      return false
    }

    try {
      await navigator.share({
        title: t('share.score_title'),
        text: t('share.score_text', { score: finalScore }),
        url: window.location.origin,
      })
      toast.success(t('share.success', 'Score shared successfully!'))
      return true
    } catch (error) {
      // Don't show error for user cancellation
      if ((error as Error).name !== 'AbortError') {
        logger.error('Error sharing:', error)
        toast.error(t('share.error', 'Failed to share score'))
      }
      return false
    }
  }

  /**
   * Setup multiplayer game with players
   */
  const setupMultiplayerGame = async (
    playerNames: string[],
    gameName?: string,
    customLetter?: string
  ) => {
    try {
      await gameSession.setupPlayers(playerNames, gameName, customLetter)
      toast.success(t('game.multiplayer_setup', [playerNames.length]))
      return true
    } catch (error) {
      logger.error('Error setting up multiplayer game:', error)
      toast.error(t('game.error_multiplayer', 'Failed to setup multiplayer game'))
      return false
    }
  }

  /**
   * Start next round in multiplayer mode
   */
  const startNextRound = async () => {
    try {
      await playerActions.startNextRound()
      audio.playNewRound()
      toast.success(t('game.next_round', 'Next round started!'))
      return true
    } catch (error) {
      logger.error('Error starting next round:', error)
      toast.error(t('game.error_next_round', 'Failed to start next round'))
      return false
    }
  }

  /**
   * Start or resume a configured round context from round-start page selections.
   * Uses store flow contract to decide whether to bootstrap, advance, or refresh.
   */
  const startConfiguredRound = async (
    category: import('@riddle-rush/types/game').Category,
    letter: string
  ) => {
    try {
      const session = await gameSession.advanceToConfiguredRound(category, letter)
      if (!session) {
        toast.warning(t('players.need_players', 'Add at least one player to start'))
        return null
      }

      audio.playNewRound()
      return session
    } catch (error) {
      logger.error('Error starting configured round:', error)
      toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
      return null
    }
  }

  const canConfirmRoundScores = () => getFlowState() === 'in-round'

  const canProceedToResults = () => {
    const flow = getFlowState()
    return flow === 'round-complete' || flow === 'decision'
  }

  return {
    startNewGame,
    resumeOrStartGame,
    endGame,
    shareScore,
    setupMultiplayerGame,
    startNextRound,
    startConfiguredRound,
    canConfirmRoundScores,
    canProceedToResults,
  }
}
