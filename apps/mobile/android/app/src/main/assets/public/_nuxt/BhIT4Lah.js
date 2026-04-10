import { _ as N } from './B-USiBHN.js'
import { _ as V } from './n5CIrt1D.js'
import { _ as z } from './D9TZGafa.js'
import { _ as A } from './BwE9VIQt.js'
import {
  d as E,
  X as $,
  J as j,
  i as q,
  z as D,
  A as r,
  Y as H,
  F as o,
  C as e,
  l as t,
  E as c,
  G as _,
  D as i,
  W as d,
  Z as p,
  B as k,
  S as f,
  _ as I,
} from './BI8BVXPj.js'
import { u as P } from './CbjeSZOE.js'
import { u as T } from './QhPvbTN-.js'
const F = { class: 'language-page', 'data-testid': 'language-page' },
  J = ['aria-label'],
  Q = { class: 'language-options' },
  R = { class: 'language-name' },
  U = { key: 0, class: 'checkmark' },
  W = { class: 'language-name' },
  X = { key: 0, class: 'checkmark' },
  Y = E({
    __name: 'language',
    setup(Z) {
      const { goBack: u, router: v } = P(),
        { locale: b, setLocale: w, t: s } = $(),
        { settingsStore: y } = T(),
        x = j(),
        n = q(b.value),
        m = (l) => {
          n.value = l
        },
        h = async () => {
          try {
            ;(y.setLanguage(n.value),
              await w(n.value),
              await C(n.value),
              typeof window < 'u' && window.location.reload())
          } catch {
            u()
          }
        },
        C = async (l) => {
          if (typeof window > 'u') return
          const a = { ...x.query }
          ;((a.lang = l), await v.replace({ query: a }))
        }
      return (
        D({
          title: s('language.title'),
          meta: [{ name: 'description', content: s('language.description') }],
        }),
        (l, a) => {
          const B = N,
            G = V,
            L = z,
            S = A
          return (
            r(),
            H(S, null, {
              default: o(() => [
                e('div', F, [
                  e(
                    'button',
                    {
                      class: 'back-btn',
                      'aria-label': t(s)('common.back'),
                      'data-testid': 'language-back-button',
                      onClick: a[0] || (a[0] = (...g) => t(u) && t(u)(...g)),
                    },
                    [...(a[3] || (a[3] = [e('span', { class: 'back-icon' }, '←', -1)]))],
                    8,
                    J
                  ),
                  c(
                    B,
                    { color: 'gold' },
                    { default: o(() => [_(i(t(s)('language.title', 'LANGUAGE')), 1)]), _: 1 }
                  ),
                  c(
                    G,
                    { class: 'language-panel', 'data-testid': 'language-card' },
                    {
                      default: o(() => [
                        e('div', Q, [
                          e(
                            'button',
                            {
                              class: d(['language-row', { selected: t(n) === 'en' }]),
                              'data-testid': 'language-option-english',
                              onClick: a[1] || (a[1] = (g) => m('en')),
                            },
                            [
                              a[4] ||
                                (a[4] = e(
                                  'div',
                                  { class: 'flag-container', 'data-testid': 'language-flag-en' },
                                  [e('span', { class: 'flag-emoji' }, '🇬🇧')],
                                  -1
                                )),
                              e('span', R, i(t(s)('language.english')), 1),
                              e(
                                'div',
                                {
                                  class: d(['checkbox', { checked: t(n) === 'en' }]),
                                  'data-testid': 'language-checkmark-en',
                                },
                                [
                                  c(
                                    p,
                                    { name: 'checkmark' },
                                    {
                                      default: o(() => [
                                        t(n) === 'en' ? (r(), k('span', U, '✓')) : f('', !0),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                ],
                                2
                              ),
                            ],
                            2
                          ),
                          e(
                            'button',
                            {
                              class: d(['language-row', { selected: t(n) === 'de' }]),
                              'data-testid': 'language-option-german',
                              onClick: a[2] || (a[2] = (g) => m('de')),
                            },
                            [
                              a[5] ||
                                (a[5] = e(
                                  'div',
                                  { class: 'flag-container', 'data-testid': 'language-flag-de' },
                                  [e('span', { class: 'flag-emoji' }, '🇩🇪')],
                                  -1
                                )),
                              e('span', W, i(t(s)('language.german')), 1),
                              e(
                                'div',
                                {
                                  class: d(['checkbox', { checked: t(n) === 'de' }]),
                                  'data-testid': 'language-checkmark-de',
                                },
                                [
                                  c(
                                    p,
                                    { name: 'checkmark' },
                                    {
                                      default: o(() => [
                                        t(n) === 'de' ? (r(), k('span', X, '✓')) : f('', !0),
                                      ]),
                                      _: 1,
                                    }
                                  ),
                                ],
                                2
                              ),
                            ],
                            2
                          ),
                        ]),
                      ]),
                      _: 1,
                    }
                  ),
                  c(
                    L,
                    {
                      variant: 'primary',
                      size: 'lg',
                      'data-testid': 'language-ok-button',
                      onClick: h,
                    },
                    { default: o(() => [_(i(t(s)('common.ok')), 1)]), _: 1 }
                  ),
                ]),
              ]),
              _: 1,
            })
          )
        }
      )
    },
  }),
  sa = I(Y, [['__scopeId', 'data-v-e5eec3c8']])
export { sa as default }
