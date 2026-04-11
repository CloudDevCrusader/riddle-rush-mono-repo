import { _ as D } from './B-USiBHN.js'
import { _ as F } from './n5CIrt1D.js'
import { _ as V } from './DRhZBw8o.js'
import { _ as z } from './CwFWaBDG.js'
import { _ as L } from './D9TZGafa.js'
import { _ as R } from './BwE9VIQt.js'
import { u as E } from './CbjeSZOE.js'
import { u as H } from './CFwlYHw3.js'
import { u as P } from './QhPvbTN-.js'
import {
  d as I,
  z as O,
  V as T,
  A as s,
  Y as u,
  F as a,
  C as d,
  E as r,
  G as i,
  D as t,
  l as o,
  B as p,
  $ as A,
  a0 as K,
  O as Y,
  S as j,
  I as q,
  i as J,
  _ as M,
} from './BI8BVXPj.js'
import './Ufk1xTYU.js'
const Q = { class: 'leaderboard-page', 'data-testid': 'leaderboard-container' },
  U = { class: 'leaderboard-page__subtitle' },
  W = ['enter', 'data-testid'],
  X = ['data-testid'],
  Z = { class: 'leaderboard-page__actions' },
  ee = I({
    __name: 'leaderboard',
    setup(ae) {
      const { t: e, toast: f } = E(),
        { goHome: g, goToRoundStart: b } = H(),
        { gameStore: h, leaderboard: v, isGameCompleted: y } = P(),
        _ = J(!1),
        x = async () => {
          if (!_.value) {
            _.value = !0
            try {
              ;(await h.endGame(), await g())
            } catch (c) {
              ;(q().error('Error finishing game:', c),
                f.error(e('leaderboard.finish_error', 'Failed to finish game. Please try again.')),
                (_.value = !1))
            }
          }
        },
        k = async () => {
          await b()
        }
      return (
        O({
          title: e('leaderboard.title'),
          meta: [{ name: 'description', content: e('leaderboard.description') }],
        }),
        (c, G) => {
          const w = D,
            N = F,
            S = V,
            B = z,
            m = L,
            C = R,
            $ = T('motion')
          return (
            s(),
            u(C, null, {
              default: a(() => [
                d('div', Q, [
                  r(
                    w,
                    { variant: 'gold' },
                    { default: a(() => [i(t(o(e)('leaderboard.title', 'Leaderboard')), 1)]), _: 1 }
                  ),
                  r(
                    N,
                    { variant: 'blue', padding: 'sm' },
                    {
                      default: a(() => [d('h2', U, t(o(e)('leaderboard.ranking', 'Ranking')), 1)]),
                      _: 1,
                    }
                  ),
                  r(
                    B,
                    { 'show-ranks': !0, 'max-height': '500px' },
                    {
                      default: a(() => [
                        (s(!0),
                        p(
                          A,
                          null,
                          K(o(v), (l, n) =>
                            Y(
                              (s(),
                              p(
                                'div',
                                {
                                  key: l.id,
                                  initial: { opacity: 0, y: 20 },
                                  enter: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 300, delay: Number(n) * 80 },
                                  },
                                  class: 'leaderboard-row',
                                  'data-testid': `leaderboard-entry-${n}`,
                                },
                                [
                                  d(
                                    'span',
                                    {
                                      class: 'leaderboard-row__name',
                                      'data-testid': `leaderboard-player-name-${n}`,
                                    },
                                    t(l.name),
                                    9,
                                    X
                                  ),
                                  r(
                                    S,
                                    {
                                      size: 'md',
                                      glow: !1,
                                      'data-testid': `leaderboard-player-score-${n}`,
                                    },
                                    { default: a(() => [i(t(l.totalScore), 1)]), _: 2 },
                                    1032,
                                    ['data-testid']
                                  ),
                                ],
                                8,
                                W
                              )),
                              [[$]]
                            )
                          ),
                          128
                        )),
                      ]),
                      _: 1,
                    }
                  ),
                  d('div', Z, [
                    o(y)
                      ? j('', !0)
                      : (s(),
                        u(
                          m,
                          {
                            key: 0,
                            variant: 'primary',
                            size: 'lg',
                            'data-testid': 'leaderboard-next-round-button',
                            onClick: k,
                          },
                          {
                            default: a(() => [
                              i(t(o(e)('leaderboard.next_round', 'Next Round')), 1),
                            ]),
                            _: 1,
                          }
                        )),
                    r(
                      m,
                      {
                        variant: 'secondary',
                        size: 'lg',
                        'data-testid': 'leaderboard-finish-button',
                        onClick: x,
                      },
                      { default: a(() => [i(t(o(e)('leaderboard.finish', 'OK')), 1)]), _: 1 }
                    ),
                  ]),
                ]),
              ]),
              _: 1,
            })
          )
        }
      )
    },
  }),
  ue = M(ee, [['__scopeId', 'data-v-b517f0a8']])
export { ue as default }
