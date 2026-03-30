import { u as R, ai as E } from './BRqkcXJS.js'
import { u as f } from './KgXOTGdX.js'
const o = {
  HOME: '/',
  PLAYERS: '/players',
  ROUND_START: '/round-start',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  LANGUAGE: '/language',
  CREDITS: '/credits',
}
function S(a) {
  return `/game/${a}`
}
function A(a) {
  return `/results/${a}`
}
function N() {
  const a = R(),
    { showLoading: c, hideLoading: l, setProgress: u } = f(),
    { debounce: T } = E()
  let r = null,
    i = null
  const g = async (e, n = !1) => {
      try {
        ;(c(),
          n &&
            (u(30),
            await new Promise((s) => setTimeout(s, 300)),
            u(70),
            await new Promise((s) => setTimeout(s, 200))),
          await a.push(e))
      } finally {
        l()
      }
    },
    d = async () => {
      r ||
        (i ||
          (i = T.then((e) => {
            r = e(
              (n, s = !1) => {
                g(n, s)
              },
              200,
              { leading: !0, trailing: !1 }
            )
          })),
        await i)
    },
    t = async (e, n = !1) => {
      try {
        if ((await d(), r)) {
          r(e, n)
          return
        }
      } catch {}
      await g(e, n)
    }
  return {
    goHome: () => t(o.HOME, !0),
    goToPlayers: () => t(o.PLAYERS, !0),
    goToRoundStart: () => t(o.ROUND_START, !0),
    goToGame: (e) => t(e ? S(e) : '/game', !0),
    goToResults: (e) => t(e ? A(e) : '/results', !0),
    goToLeaderboard: () => t(o.LEADERBOARD, !0),
    goToSettings: () => t(o.SETTINGS, !0),
    goToLanguage: () => t(o.LANGUAGE, !0),
    goToCredits: () => t(o.CREDITS, !0),
    goBack: () => {
      window.history.length > 1 ? a.back() : t(o.HOME, !0)
    },
  }
}
export { N as u }
