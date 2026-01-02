import { useGameStore } from '~/stores/game'
import { useLogger } from './useLogger'

/**
 * Composable for common game actions with error handling and user feedback
 */
export function useGameActions() {
  const gameStore = useGameStore()
  const router = useRouter()
  const toast = useToast()
  const audio = useAudio()
  const { t } = useI18n()
  const logger = useLogger()

  /**
   * Start a new game session
   */
  const startNewGame = async () => {
    try {
      await gameStore.startNewGame()
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
    const hadSession = gameStore.hasActiveSession

    try {
      await gameStore.resumeOrStartNewGame()

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
      await gameStore.endGame()
      toast.success(t('game.game_ended', 'Game ended! Check your statistics.'))
      router.push('/')
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
    const finalScore = score ?? gameStore.currentScore

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
  const setupMultiplayerGame = async (playerNames: string[], gameName?: string, customLetter?: string) => {
    try {
      await gameStore.setupPlayers(playerNames, gameName, customLetter)
      toast.success(t('game.multiplayer_setup', `Game started with ${playerNames.length} players!`))
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
      await gameStore.startNextRound()
      audio.playNewRound()
      toast.success(t('game.next_round', 'Next round started!'))
      return true
    } catch (error) {
      logger.error('Error starting next round:', error)
      toast.error(t('game.error_next_round', 'Failed to start next round'))
      return false
    }
  }

  return {
    startNewGame,
    resumeOrStartGame,
    endGame,
    shareScore,
    setupMultiplayerGame,
    startNextRound,
  }
}
