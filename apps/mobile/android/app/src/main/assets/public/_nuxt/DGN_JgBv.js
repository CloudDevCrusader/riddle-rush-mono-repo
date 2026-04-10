import { _ as B } from './D9TZGafa.js'
import { _ as N } from './BwE9VIQt.js'
import {
  d as P,
  ao as D,
  J as L,
  o as O,
  z as V,
  V as A,
  A as i,
  B as _,
  E as d,
  F as n,
  C as u,
  l as t,
  O as r,
  Y as m,
  G as o,
  D as l,
  ap as E,
  Z as M,
  S as b,
  i as I,
  _ as q,
} from './BI8BVXPj.js'
import { u as R } from './CbjeSZOE.js'
import { u as Y } from './CFwlYHw3.js'
import './Ufk1xTYU.js'
const F = { class: 'menu-page' },
  H = { class: 'container' },
  J = { class: 'logo-container' },
  U = ['src', 'alt'],
  Z = { class: 'menu-buttons' },
  j = { key: 0, class: 'menu-panel' },
  K = P({
    __name: 'index',
    setup(Q) {
      const { router: g, toast: f, t: e } = R(),
        { goToPlayers: y, goToSettings: v, goToCredits: h, goToLanguage: w } = Y(),
        { getAssetPath: C } = D(),
        k = L(),
        a = I(!1),
        T = () => {
          a.value = !a.value
        }
      O(() => {
        k.query.needsGame === 'true' &&
          (f.warning(e('game.no_active_session', 'Please start a game first')),
          g.replace({ query: {} }))
      })
      const x = () => {
          ;((a.value = !1), y())
        },
        p = () => {
          ;((a.value = !1), v())
        },
        S = () => {
          ;((a.value = !1), h())
        },
        G = () => {
          ;((a.value = !1), w())
        }
      return (
        V({
          title: e('home.page_title'),
          meta: [{ name: 'description', content: e('app.description') }],
        }),
        (W, X) => {
          const s = B,
            z = N,
            c = A('motion')
          return (
            i(),
            _('div', F, [
              d(z, null, {
                default: n(() => [
                  u('div', H, [
                    u('div', J, [
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
                        U
                      ),
                    ]),
                    r(
                      u(
                        'div',
                        Z,
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
                                onClick: p,
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
                                onClick: S,
                              },
                              { default: n(() => [o(l(t(e)('menu.credits', 'CREDITS')), 1)]), _: 1 }
                            )),
                            [[c]]
                          ),
                        ],
                        512
                      ),
                      [[E, !t(a)]]
                    ),
                    d(
                      M,
                      { name: 'menu-fade' },
                      {
                        default: n(() => [
                          t(a)
                            ? (i(),
                              _('div', j, [
                                d(
                                  s,
                                  {
                                    variant: 'secondary',
                                    size: 'md',
                                    'full-width': '',
                                    'data-testid': 'main-menu-language',
                                    onClick: G,
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
                                    onClick: p,
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
  ie = q(K, [['__scopeId', 'data-v-cb4c9bc7']])
export { ie as default }
