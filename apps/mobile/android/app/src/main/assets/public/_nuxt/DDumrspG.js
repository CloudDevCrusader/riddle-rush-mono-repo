import { _ as W } from './B-USiBHN.js'
import { _ as X } from './CwFWaBDG.js'
import { _ as F } from './D9TZGafa.js'
import { _ as I } from './n5CIrt1D.js'
import { _ as H } from './BwE9VIQt.js'
import {
  K,
  m as k,
  a1 as j,
  s as Z,
  a6 as D,
  l,
  i as Y,
  d as q,
  z as J,
  V as Q,
  A as B,
  Y as ee,
  F as C,
  C as f,
  W as te,
  E as T,
  G as z,
  D as $,
  Z as ae,
  B as V,
  $ as oe,
  a0 as ne,
  O as A,
  P as se,
  v as le,
  _ as re,
} from './BI8BVXPj.js'
import { u as ie } from './CbjeSZOE.js'
import { u as ce } from './CFwlYHw3.js'
import { u as ue } from './QhPvbTN-.js'
import './Ufk1xTYU.js'
const pe = typeof window < 'u' && typeof document < 'u'
typeof WorkerGlobalScope < 'u' && globalThis instanceof WorkerGlobalScope
const de = Object.prototype.toString,
  me = (e) => de.call(e) === '[object Object]'
function R(e) {
  return Array.isArray(e) ? e : [e]
}
function _e(e, t, i) {
  return K(e, t, { ...i, immediate: !0 })
}
const fe = pe ? window : void 0
function ye(e) {
  var t
  const i = D(e)
  return (t = i?.$el) !== null && t !== void 0 ? t : i
}
function O(...e) {
  const t = (a, o, c, p) => (a.addEventListener(o, c, p), () => a.removeEventListener(o, c, p)),
    i = k(() => {
      const a = R(D(e[0])).filter((o) => o != null)
      return a.every((o) => typeof o != 'string') ? a : void 0
    })
  return _e(
    () => {
      var a, o
      return [
        (a = (o = i.value) === null || o === void 0 ? void 0 : o.map((c) => ye(c))) !== null &&
        a !== void 0
          ? a
          : [fe].filter((c) => c != null),
        R(D(i.value ? e[1] : e[0])),
        R(l(i.value ? e[2] : e[1])),
        D(i.value ? e[3] : e[2]),
      ]
    },
    ([a, o, c, p], d, r) => {
      if (!a?.length || !o?.length || !c?.length) return
      const m = me(p) ? { ...p } : p,
        _ = a.flatMap((S) => o.flatMap((v) => c.map((w) => t(S, v, w, m))))
      r(() => {
        _.forEach((S) => S())
      })
    },
    { flush: 'post' }
  )
}
function ve(e, t = {}) {
  const { threshold: i = 50, onSwipe: a, onSwipeEnd: o, onSwipeStart: c, passive: p = !0 } = t,
    d = j({ x: 0, y: 0 }),
    r = j({ x: 0, y: 0 }),
    m = k(() => d.x - r.x),
    _ = k(() => d.y - r.y),
    { max: S, abs: v } = Math,
    w = k(() => S(v(m.value), v(_.value)) >= i),
    h = Z(!1),
    E = k(() =>
      w.value
        ? v(m.value) > v(_.value)
          ? m.value > 0
            ? 'left'
            : 'right'
          : _.value > 0
            ? 'up'
            : 'down'
        : 'none'
    ),
    G = (s) => [s.touches[0].clientX, s.touches[0].clientY],
    M = (s, y) => {
      ;((d.x = s), (d.y = y))
    },
    u = (s, y) => {
      ;((r.x = s), (r.y = y))
    },
    n = { passive: p, capture: !p },
    g = (s) => {
      ;(h.value && o?.(s, E.value), (h.value = !1))
    },
    x = [
      O(
        e,
        'touchstart',
        (s) => {
          if (s.touches.length !== 1) return
          const [y, P] = G(s)
          ;(M(y, P), u(y, P), c?.(s))
        },
        n
      ),
      O(
        e,
        'touchmove',
        (s) => {
          if (s.touches.length !== 1) return
          const [y, P] = G(s)
          ;(u(y, P),
            n.capture && !n.passive && Math.abs(m.value) > Math.abs(_.value) && s.preventDefault(),
            !h.value && w.value && (h.value = !0),
            h.value && a?.(s))
        },
        n
      ),
      O(e, ['touchend', 'touchcancel'], g, n),
    ]
  return {
    isSwiping: h,
    direction: E,
    coordsStart: d,
    coordsEnd: r,
    lengthX: m,
    lengthY: _,
    stop: () => x.forEach((s) => s()),
  }
}
function he(e) {
  const t = Y(null),
    {
      isSwiping: i,
      direction: a,
      lengthX: o,
      lengthY: c,
    } = ve(t, {
      threshold: e?.threshold ?? 50,
      onSwipeEnd: (p, d) => {
        d === 'left' && e?.onSwipeLeft
          ? e.onSwipeLeft()
          : d === 'right' && e?.onSwipeRight
            ? e.onSwipeRight()
            : d === 'up' && e?.onSwipeUp
              ? e.onSwipeUp()
              : d === 'down' && e?.onSwipeDown && e.onSwipeDown()
      },
    })
  return { pageElement: t, isSwiping: i, direction: a, lengthX: o, lengthY: c }
}
const be = ['aria-label'],
  ge = { class: 'players-body' },
  Se = ['aria-label'],
  we = { class: 'stepper__pill' },
  xe = ['aria-label', 'disabled'],
  Ce = { class: 'stepper__count', 'aria-live': 'polite' },
  ke = { class: 'stepper__label' },
  Ee = { class: 'stepper__separator' },
  Pe = ['aria-label', 'disabled'],
  $e = ['enter'],
  Te = ['for'],
  Ge = ['id', 'onUpdate:modelValue', 'data-testid', 'placeholder'],
  Le = q({
    __name: 'players',
    setup(e) {
      const { t, goBack: i, toast: a } = ie(),
        { goToRoundStart: o } = ce(),
        { gameStore: c } = ue(),
        p = le(),
        d = p.public.minPlayers,
        r = Y(p.public.defaultPlayers),
        m = Y([]),
        _ = k(() => p.public.maxPlayers),
        S = k(() => p.public?.playersMockupStyle === 'legacy'),
        v = (u) => Math.min(_.value, Math.max(d, u)),
        w = (u) => {
          const n = v(u ?? r.value),
            g = m.value.slice(0, n)
          for (; g.length < n; ) g.push('')
          ;((r.value = n), (m.value = g))
        },
        h = (u) => {
          const n = v(r.value + u)
          if (n === r.value) {
            u > 0 && a.info(t('players.max_players', [_.value]))
            return
          }
          w(n)
        },
        E = (u) => t('players.placeholder', { number: u + 1 }) || `Player ${u + 1}`,
        G = () => {
          if (r.value < d) {
            a.warning(t('players.need_players'))
            return
          }
          const u = m.value.slice(0, r.value).map((x, L) => x.trim() || E(L))
          if (!u.length) {
            a.warning(t('players.need_players'))
            return
          }
          const n = u.map((x) => x.toLowerCase())
          if (new Set(n).size !== n.length) {
            a.warning(t('players.duplicate_name'))
            return
          }
          ;(c.setPendingPlayerNames(u), a.success(t('players.ready', { 0: u.length })), o())
        },
        { pageElement: M } = he({ onSwipeRight: () => i(), threshold: 80 })
      return (
        J({
          title: t('players.title'),
          meta: [
            {
              name: 'description',
              content: t('players.description', 'Select players for the game'),
            },
          ],
        }),
        w(r.value),
        (u, n) => {
          const g = W,
            x = X,
            L = F,
            s = I,
            y = H,
            P = Q('motion')
          return (
            B(),
            ee(y, null, {
              default: C(() => [
                f(
                  'div',
                  {
                    ref_key: 'pageElement',
                    ref: M,
                    class: te(['players-page', { 'players-page--legacy': l(S) }]),
                  },
                  [
                    T(
                      s,
                      { class: 'players-panel' },
                      {
                        default: C(() => [
                          T(
                            g,
                            { color: 'gold' },
                            {
                              left: C(() => [
                                f(
                                  'button',
                                  {
                                    class: 'back-button',
                                    type: 'button',
                                    'data-testid': 'players-back-button',
                                    'aria-label': l(t)('common.back', 'Back'),
                                    onClick: n[0] || (n[0] = (...N) => l(i) && l(i)(...N)),
                                  },
                                  ' ‹ ',
                                  8,
                                  be
                                ),
                              ]),
                              default: C(() => [z(' ' + $(l(t)('players.title')), 1)]),
                              _: 1,
                            }
                          ),
                          f('div', ge, [
                            f(
                              'div',
                              {
                                class: 'stepper',
                                role: 'group',
                                'aria-label': l(t)('players.count_label'),
                              },
                              [
                                f('div', we, [
                                  f(
                                    'button',
                                    {
                                      class: 'stepper__button stepper__button--minus',
                                      type: 'button',
                                      'data-testid': 'players-decrease-button',
                                      'aria-label': l(t)('players.decrease'),
                                      disabled: l(r) <= l(d),
                                      onClick: n[1] || (n[1] = (N) => h(-1)),
                                    },
                                    ' – ',
                                    8,
                                    xe
                                  ),
                                  f('div', Ce, [
                                    f('span', ke, $(l(t)('players.count_label')) + ':', 1),
                                    T(
                                      ae,
                                      { name: 'count-pop', mode: 'out-in' },
                                      {
                                        default: C(() => [
                                          (B(),
                                          V(
                                            'span',
                                            { key: l(r), class: 'stepper__number' },
                                            $(l(r)),
                                            1
                                          )),
                                        ]),
                                        _: 1,
                                      }
                                    ),
                                    f('span', Ee, '/ ' + $(l(_)), 1),
                                  ]),
                                  f(
                                    'button',
                                    {
                                      class: 'stepper__button stepper__button--plus',
                                      type: 'button',
                                      'data-testid': 'players-increase-button',
                                      'aria-label': l(t)('players.increase'),
                                      disabled: l(r) >= l(_),
                                      onClick: n[2] || (n[2] = (N) => h(1)),
                                    },
                                    ' + ',
                                    8,
                                    Pe
                                  ),
                                ]),
                              ],
                              8,
                              Se
                            ),
                            T(
                              x,
                              { class: 'players-list', 'max-height': '420px' },
                              {
                                default: C(() => [
                                  (B(!0),
                                  V(
                                    oe,
                                    null,
                                    ne(l(r), (N, b) =>
                                      A(
                                        (B(),
                                        V(
                                          'div',
                                          {
                                            key: `player-${b}`,
                                            initial: { opacity: 0, x: -20 },
                                            enter: {
                                              opacity: 1,
                                              x: 0,
                                              transition: { duration: 300, delay: Number(b) * 80 },
                                            },
                                            class: 'player-row',
                                          },
                                          [
                                            f(
                                              'label',
                                              { class: 'player-row__label', for: `player-${b}` },
                                              $(E(b)),
                                              9,
                                              Te
                                            ),
                                            A(
                                              f(
                                                'input',
                                                {
                                                  id: `player-${b}`,
                                                  'onUpdate:modelValue': (U) => (l(m)[b] = U),
                                                  type: 'text',
                                                  class: 'player-row__input',
                                                  'data-testid': `players-name-input-${b}`,
                                                  placeholder: E(b),
                                                  maxlength: '20',
                                                  autocomplete: 'off',
                                                  inputmode: 'search',
                                                },
                                                null,
                                                8,
                                                Ge
                                              ),
                                              [[se, l(m)[b]]]
                                            ),
                                          ],
                                          8,
                                          $e
                                        )),
                                        [[P]]
                                      )
                                    ),
                                    128
                                  )),
                                ]),
                                _: 1,
                              }
                            ),
                            T(
                              L,
                              {
                                class: 'start-button',
                                variant: 'primary',
                                size: 'lg',
                                'full-width': '',
                                'data-testid': 'players-start-button',
                                onClick: G,
                              },
                              { default: C(() => [z($(l(t)('players.start')), 1)]), _: 1 }
                            ),
                          ]),
                        ]),
                        _: 1,
                      }
                    ),
                  ],
                  2
                ),
              ]),
              _: 1,
            })
          )
        }
      )
    },
  }),
  Ae = re(Le, [['__scopeId', 'data-v-14f320fa']])
export { Ae as default }
