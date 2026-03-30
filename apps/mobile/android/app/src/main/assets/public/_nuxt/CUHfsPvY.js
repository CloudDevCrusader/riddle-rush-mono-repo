import { _ as z } from './DH_jaUQ-.js'
import { _ as B } from './ulm3v8Ys.js'
import {
  d as P,
  ag as D,
  J as L,
  o as A,
  z as E,
  U as M,
  A as i,
  B as p,
  E as d,
  F as n,
  C as u,
  l as t,
  N as r,
  X as m,
  G as o,
  D as l,
  ah as O,
  Y as V,
  R as b,
  i as I,
  _ as R,
} from './BRqkcXJS.js'
import { u as q } from './l4Qz3wUf.js'
import { u as U } from './DmZn1PRy.js'
import './KgXOTGdX.js'
const Y = { class: 'menu-page' },
  F = { class: 'container' },
  H = { class: 'logo-container' },
  J = ['src', 'alt'],
  X = { class: 'menu-buttons' },
  j = { key: 0, class: 'menu-panel' },
  K = P({
    __name: 'index',
    setup(Q) {
      const { router: g, toast: f, t: e } = q(),
        { goToPlayers: y, goToSettings: h, goToCredits: v, goToLanguage: w } = U(),
        { getAssetPath: C } = D(),
        k = L(),
        a = I(!1),
        T = () => {
          a.value = !a.value
        }
      A(() => {
        k.query.needsGame === 'true' &&
          (f.warning(e('game.no_active_session', 'Please start a game first')),
          g.replace({ query: {} }))
      })
      const x = () => {
          ;((a.value = !1), y())
        },
        _ = () => {
          ;((a.value = !1), h())
        },
        G = () => {
          ;((a.value = !1), v())
        },
        N = () => {
          ;((a.value = !1), w())
        }
      return (
        E({
          title: e('home.page_title'),
          meta: [{ name: 'description', content: e('app.description') }],
        }),
        (W, Z) => {
          const s = z,
            S = B,
            c = M('motion')
          return (
            i(),
            p('div', Y, [
              d(S, null, {
                default: n(() => [
                  u('div', F, [
                    u('div', H, [
                      u(
                        'img',
                        {
                          src: t(C)('assets/splash/LOGO.png'),
                          alt: t(e)('app.title'),
                          class: 'logo-image',
                          width: '512',
                          height: '512',
                        },
                        null,
                        8,
                        J
                      ),
                    ]),
                    r(
                      u(
                        'div',
                        X,
                        [
                          r(
                            (i(),
                            m(
                              s,
                              {
                                initial: { opacity: 0, y: 30 },
                                enter: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 300, delay: 0 },
                                },
                                variant: 'primary',
                                size: 'lg',
                                'full-width': '',
                                'data-testid': 'main-menu-play',
                                onClick: x,
                              },
                              { default: n(() => [o(l(t(e)('menu.play', 'PLAY')), 1)]), _: 1 }
                            )),
                            [[c]]
                          ),
                          r(
                            (i(),
                            m(
                              s,
                              {
                                initial: { opacity: 0, y: 30 },
                                enter: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 300, delay: 80 },
                                },
                                variant: 'secondary',
                                size: 'lg',
                                'full-width': '',
                                'data-testid': 'main-menu-menu',
                                onClick: T,
                              },
                              { default: n(() => [o(l(t(e)('menu.menu', 'MENU')), 1)]), _: 1 }
                            )),
                            [[c]]
                          ),
                          r(
                            (i(),
                            m(
                              s,
                              {
                                initial: { opacity: 0, y: 30 },
                                enter: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 300, delay: 160 },
                                },
                                variant: 'warning',
                                size: 'lg',
                                'full-width': '',
                                'data-testid': 'main-menu-options',
                                onClick: _,
                              },
                              { default: n(() => [o(l(t(e)('menu.options', 'OPTIONS')), 1)]), _: 1 }
                            )),
                            [[c]]
                          ),
                          r(
                            (i(),
                            m(
                              s,
                              {
                                initial: { opacity: 0, y: 30 },
                                enter: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 300, delay: 240 },
                                },
                                variant: 'warning',
                                size: 'lg',
                                'full-width': '',
                                'data-testid': 'main-menu-credits',
                                onClick: G,
                              },
                              { default: n(() => [o(l(t(e)('menu.credits', 'CREDITS')), 1)]), _: 1 }
                            )),
                            [[c]]
                          ),
                        ],
                        512
                      ),
                      [[O, !t(a)]]
                    ),
                    d(
                      V,
                      { name: 'menu-fade' },
                      {
                        default: n(() => [
                          t(a)
                            ? (i(),
                              p('div', j, [
                                d(
                                  s,
                                  {
                                    variant: 'secondary',
                                    size: 'md',
                                    'full-width': '',
                                    'data-testid': 'main-menu-language',
                                    onClick: N,
                                  },
                                  {
                                    default: n(() => [
                                      o(' 🌐 ' + l(t(e)('menu.language', 'Language')), 1),
                                    ]),
                                    _: 1,
                                  }
                                ),
                                d(
                                  s,
                                  {
                                    variant: 'secondary',
                                    size: 'md',
                                    'full-width': '',
                                    'data-testid': 'main-menu-settings',
                                    onClick: _,
                                  },
                                  {
                                    default: n(() => [
                                      o(' ⚙️ ' + l(t(e)('menu.settings', 'Settings')), 1),
                                    ]),
                                    _: 1,
                                  }
                                ),
                              ]))
                            : b('', !0),
                        ]),
                        _: 1,
                      }
                    ),
                  ]),
                ]),
                _: 1,
              }),
            ])
          )
        }
      )
    },
  }),
  ie = R(K, [['__scopeId', 'data-v-cb4c9bc7']])
export { ie as default }
