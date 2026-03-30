import {
  a9 as v,
  aa as b,
  i as A,
  ab as R,
  u as q,
  W as E,
  I as P,
  ac as G,
  ad as N,
  ae as V,
  m as S,
} from './BRqkcXJS.js'
function C() {
  const e = v()
  return {
    submitPlayerAnswer: e.submitPlayerAnswer,
    assignPlayerScore: e.assignPlayerScore,
    updatePlayerAvatar: e.updatePlayerAvatar,
    completeRound: e.completeRound,
    startNextRound: e.startNextRound,
    resetPlayerSubmissions: e.resetPlayerSubmissions,
    getPlayerById: e.getPlayerById,
  }
}
let w = null
const _ = A(1),
  F = A(!1)
function I() {
  const e = () => {
      if (!w) {
        const r =
          (typeof window < 'u' ? window.AudioContext || window.webkitAudioContext : null) ||
          globalThis.AudioContext ||
          globalThis.webkitAudioContext ||
          null
        try {
          w = r ? new r() : null
        } catch {
          try {
            w = r ? r() : null
          } catch {
            w = null
          }
        }
      }
      return w
    },
    d = (r) => (F.value ? 0 : r * _.value),
    c = (r, o, n = 'sine', s = 0.3) => {
      const t = e()
      if (!t) throw new TypeError('AudioContext unavailable')
      const a = d(s)
      if (a === 0) return
      const l = t.createOscillator(),
        p = t.createGain()
      ;(l.connect(p),
        p.connect(t.destination),
        (l.frequency.value = r),
        (l.type = n),
        p.gain.setValueAtTime(a, t.currentTime),
        p.gain.exponentialRampToValueAtTime(0.01, t.currentTime + o),
        l.start(t.currentTime),
        l.stop(t.currentTime + o))
    },
    f = () => {
      if (!e()) throw new TypeError('AudioContext unavailable')
      ;([
        { freq: 523.25, delay: 0, duration: 0.25, vol: 0.25 },
        { freq: 659.25, delay: 50, duration: 0.25, vol: 0.25 },
        { freq: 783.99, delay: 100, duration: 0.35, vol: 0.3 },
        { freq: 1046.5, delay: 150, duration: 0.2, vol: 0.2 },
      ].forEach(({ freq: n, delay: s, duration: t, vol: a }) => {
        setTimeout(() => {
          ;(c(n, t, 'sine', a), c(n * 2, t * 0.5, 'sine', a * 0.3))
        }, s)
      }),
        setTimeout(() => {
          ;(c(1046.5, 0.1, 'triangle', 0.15),
            setTimeout(() => {
              c(1318.51, 0.1, 'triangle', 0.1)
            }, 50))
        }, 200))
    },
    u = () => {
      const r = e()
      if (!r) throw new TypeError('AudioContext unavailable')
      const o = r.currentTime,
        n = r.createOscillator(),
        s = r.createOscillator(),
        t = r.createGain(),
        a = r.createBiquadFilter()
      ;(n.connect(a),
        s.connect(a),
        a.connect(t),
        t.connect(r.destination),
        n.frequency.setValueAtTime(300, o),
        n.frequency.exponentialRampToValueAtTime(150, o + 0.25),
        (n.type = 'sawtooth'),
        s.frequency.setValueAtTime(310, o),
        s.frequency.exponentialRampToValueAtTime(155, o + 0.25),
        (s.type = 'sawtooth'),
        (a.type = 'lowpass'),
        a.frequency.setValueAtTime(500, o),
        a.frequency.exponentialRampToValueAtTime(200, o + 0.25),
        t.gain.setValueAtTime(0.25, o),
        t.gain.exponentialRampToValueAtTime(0.01, o + 0.25),
        n.start(o),
        s.start(o),
        n.stop(o + 0.25),
        s.stop(o + 0.25))
    },
    g = () => {
      const r = e()
      if (!r) throw new TypeError('AudioContext unavailable')
      const o = r.currentTime,
        n = r.createOscillator(),
        s = r.createGain()
      ;(n.connect(s),
        s.connect(r.destination),
        n.frequency.setValueAtTime(1200, o),
        n.frequency.exponentialRampToValueAtTime(800, o + 0.03),
        (n.type = 'square'),
        s.gain.setValueAtTime(0.15, o),
        s.gain.exponentialRampToValueAtTime(0.01, o + 0.03),
        n.start(o),
        n.stop(o + 0.03))
    },
    i = () => {
      if (!e()) throw new TypeError('AudioContext unavailable')
      ;([
        { freq: 261.63, delay: 0, duration: 0.12, vol: 0.2 },
        { freq: 329.63, delay: 60, duration: 0.12, vol: 0.2 },
        { freq: 392, delay: 120, duration: 0.12, vol: 0.2 },
        { freq: 523.25, delay: 180, duration: 0.2, vol: 0.25 },
      ].forEach(({ freq: n, delay: s, duration: t, vol: a }) => {
        setTimeout(() => {
          ;(c(n, t, 'triangle', a), c(n * 2, t * 0.6, 'sine', a * 0.4))
        }, s)
      }),
        setTimeout(() => {
          ;(c(523.25, 0.15, 'sine', 0.2),
            setTimeout(() => {
              ;(c(659.25, 0.15, 'sine', 0.2),
                setTimeout(() => {
                  c(783.99, 0.2, 'sine', 0.25)
                }, 50))
            }, 50))
        }, 250))
    },
    m = () => {
      if (!e()) throw new TypeError('AudioContext unavailable')
      ;[
        { freq: 392, delay: 0, duration: 0.15, vol: 0.2 },
        { freq: 493.88, delay: 80, duration: 0.15, vol: 0.2 },
        { freq: 523.25, delay: 160, duration: 0.15, vol: 0.2 },
        { freq: 659.25, delay: 240, duration: 0.2, vol: 0.25 },
        { freq: 783.99, delay: 320, duration: 0.3, vol: 0.3 },
      ].forEach(({ freq: n, delay: s, duration: t, vol: a }) => {
        setTimeout(() => {
          c(n, t, 'sine', a)
        }, s)
      })
    },
    T = () => {
      c(600, 0.02, 'sine', 0.05)
    },
    h = () => {
      if (!e()) return
      ;[523.25, 659.25, 783.99].forEach((n, s) => {
        setTimeout(() => {
          c(n, 0.08, 'triangle', 0.15)
        }, s * 40)
      })
    },
    x = async () => {
      const { getSettings: r } = b()
      return (await r()) || { enabledCategories: [], soundEnabled: !0 }
    },
    y = async (r) => {
      ;(await x()).soundEnabled && r()
    }
  return {
    playSuccess: () => y(f),
    playError: () => y(u),
    playClick: () => y(g),
    playNewRound: () => y(i),
    playRoundComplete: () => y(m),
    playButtonHover: () => y(T),
    playScoreIncrease: () => y(h),
  }
}
function M() {
  const e = v(),
    d = R(),
    c = C(),
    f = q(),
    u = G(),
    g = I(),
    { t: i } = E(),
    m = P()
  return {
    startNewGame: async () => {
      try {
        return (
          await d.startNewGame(),
          g.playNewRound(),
          u.success(i('game.new_round_started', 'New round started!')),
          !0
        )
      } catch (t) {
        return (
          m.error('Error starting new game:', t),
          u.error(i('game.error_starting', 'Failed to start game. Please try again.')),
          !1
        )
      }
    },
    resumeOrStartGame: async () => {
      const t = d.hasActiveSession.value
      try {
        return (
          await d.resumeOrStartNewGame(),
          t
            ? u.info(i('game.resumed', 'Game resumed!'))
            : (g.playNewRound(),
              u.info(i('game.welcome', 'Welcome! Guess a word from the category.'))),
          !0
        )
      } catch (a) {
        return (
          m.error('Error resuming game:', a),
          u.error(i('game.error_resuming', 'Failed to load game. Starting fresh.')),
          !1
        )
      }
    },
    endGame: async () => {
      try {
        return (
          await d.endGame(),
          u.success(i('game.game_ended', 'Game ended! Check your statistics.')),
          await f.push('/'),
          !0
        )
      } catch (t) {
        return (
          m.error('Error ending game:', t),
          u.error(i('game.error_ending', 'Failed to save game results')),
          !1
        )
      }
    },
    shareScore: async (t) => {
      const a = t ?? d.currentSession.value?.score ?? 0
      if (!navigator.share)
        return (u.info(i('share.not_supported', 'Sharing is not supported on this device')), !1)
      try {
        return (
          await navigator.share({
            title: i('share.score_title'),
            text: i('share.score_text', { score: a }),
            url: window.location.origin,
          }),
          u.success(i('share.success', 'Score shared successfully!')),
          !0
        )
      } catch (l) {
        return (
          l.name !== 'AbortError' &&
            (m.error('Error sharing:', l), u.error(i('share.error', 'Failed to share score'))),
          !1
        )
      }
    },
    setupMultiplayerGame: async (t, a, l) => {
      try {
        return (
          await d.setupPlayers(t, a, l),
          u.success(i('game.multiplayer_setup', [t.length])),
          !0
        )
      } catch (p) {
        return (
          m.error('Error setting up multiplayer game:', p),
          u.error(i('game.error_multiplayer', 'Failed to setup multiplayer game')),
          !1
        )
      }
    },
    startNextRound: async () => {
      try {
        return (
          await c.startNextRound(),
          g.playNewRound(),
          u.success(i('game.next_round', 'Next round started!')),
          !0
        )
      } catch (t) {
        return (
          m.error('Error starting next round:', t),
          u.error(i('game.error_next_round', 'Failed to start next round')),
          !1
        )
      }
    },
    startConfiguredRound: async (t, a) => {
      try {
        const l = await d.advanceToConfiguredRound(t, a)
        return l
          ? (g.playNewRound(), l)
          : (u.warning(i('players.need_players', 'Add at least one player to start')), null)
      } catch (l) {
        return (
          m.error('Error starting configured round:', l),
          u.error(i('game.error_starting', 'Failed to start game. Please try again.')),
          null
        )
      }
    },
    transitionToRoundComplete: () => {
      e.transitionToRoundComplete()
    },
  }
}
function k() {
  const e = R(),
    d = N(),
    c = V(),
    f = C(),
    u = M(),
    g = { ...e, ...c, ...f, ...u },
    i = g,
    m = e.currentCategory,
    T = e.currentLetter,
    h = e.currentRound,
    x = e.nextRoundNumber,
    y = e.gameMode,
    r = e.flowState,
    o = S(() =>
      !(e.players.value.length > 0) || e.allPlayersSubmitted.value
        ? !0
        : e.flowState.value === 'round-complete' || e.flowState.value === 'decision'
    ),
    n = S(() => e.flowState.value === 'round-complete')
  return {
    gameState: g,
    gameStore: i,
    settingsStore: d,
    currentCategory: m,
    currentLetter: T,
    currentRound: h,
    nextRoundNumber: x,
    gameMode: y,
    flowState: r,
    canProceedToResults: o,
    canConfirmRoundScores: n,
    isCurrentRoundCompleted: e.isCurrentRoundCompleted,
    postRoundDecisionPending: e.postRoundDecisionPending,
    players: e.players,
    currentPlayerTurn: e.currentPlayerTurn,
    allPlayersSubmitted: e.allPlayersSubmitted,
    isGameCompleted: e.isGameCompleted,
    leaderboard: e.leaderboard,
    hasActiveSession: e.hasActiveSession,
    gameStatus: e.gameStatus,
  }
}
export { M as a, I as b, k as u }
