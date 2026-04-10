import { u as R, aq as E } from './BI8BVXPj.js'
import { u as f } from './Ufk1xTYU.js'
const o = {
  HOME: '/',
  PLAYERS: '/players',
  ROUND_START: '/round-start',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  LANGUAGE: '/language',
  CREDITS: '/credits',
}
function w(a) {
  return `/game/${a}`
}
function S(a) {
  return `/results/${a}`
}
function h() {
  const a = R(),
    { showLoading: c, hideLoading: l, setProgress: r } = f(),
    { debounce: T } = E()
  let i = null,
    u = null
  const g = async (e, n = !1) => {
      try {
        ;(c(),
          n
            ? (r(30),
              await new Promise((s) => setTimeout(s, 300)),
              r(70),
              await new Promise((s) => setTimeout(s, 200)),
              await a.push(e),
              r(100),
              await new Promise((s) => setTimeout(s, 250)))
            : await a.push(e))
      } finally {
        l()
      }
    },
    d = async () => {
      i ||
        (u ||
          (u = T.then((e) => {
            i = e(
              (n, s = !1) => {
                g(n, s)
              },
              200,
              { leading: !0, trailing: !1 }
            )
          })),
        await u)
    },
    t = async (e, n = !1) => {
      try {
        if ((await d(), i)) {
          i(e, n)
          return
        }
      } catch {}
      await g(e, n)
    }
  return {
    goHome: () => t(o.HOME, !0),
    goToPlayers: () => t(o.PLAYERS, !0),
    goToRoundStart: () => t(o.ROUND_START, !0),
    goToGame: (e) => t(e ? w(e) : '/game', !0),
    goToResults: (e) => t(e ? S(e) : '/results', !0),
    goToLeaderboard: () => t(o.LEADERBOARD, !0),
    goToSettings: () => t(o.SETTINGS, !0),
    goToLanguage: () => t(o.LANGUAGE, !0),
    goToCredits: () => t(o.CREDITS, !0),
    goBack: () => {
      window.history.length > 1 ? a.back() : t(o.HOME, !0)
    },
  }
}
export { h as u }
