import { _ as g } from './BwE9VIQt.js'
import { _ as k } from './B-USiBHN.js'
import { u as x } from './CFwlYHw3.js'
import {
  d as b,
  X as T,
  o as B,
  an as I,
  c as M,
  z as N,
  A as S,
  B as y,
  E as _,
  C as t,
  F as C,
  G,
  D as u,
  l as i,
  a7 as H,
  i as c,
  _ as V,
} from './BI8BVXPj.js'
import './Ufk1xTYU.js'
const w = { class: 'splash-container' },
  z = { class: 'splash-loading' },
  D = { class: 'loading-bar' },
  E = { class: 'loading-bar__track' },
  $ = { class: 'loading-text' },
  A = b({
    __name: 'splash',
    setup(F) {
      const { goHome: r } = x(),
        { t: a } = T(),
        s = c(0),
        p = c(!1),
        o = c(!1)
      let e = null,
        n = null,
        l = null
      const d = () => {
        !p.value || o.value || ((o.value = !0), r())
      }
      return (
        B(() => {
          ;((e = I(() => {
            ;((s.value = Math.min(100, s.value + 2.5)),
              s.value >= 100 &&
                (e && (clearInterval(e), (e = null)),
                o.value ||
                  ((o.value = !0),
                  (n = setTimeout(() => {
                    r()
                  }, 300)))))
          }, 50)),
            (l = setTimeout(() => {
              p.value = !0
            }, 1e3)))
        }),
        M(() => {
          ;(e && clearInterval(e), n && clearTimeout(n), l && clearTimeout(l))
        }),
        N({
          title: a('app.title'),
          meta: [{ name: 'description', content: a('app.description') }],
        }),
        (m, v) => {
          const f = g,
            h = k
          return (
            S(),
            y(
              'button',
              {
                class: 'splash-page',
                type: 'button',
                'aria-label': 'Skip splash screen',
                onClick: d,
              },
              [
                _(f),
                t('div', w, [
                  _(
                    h,
                    { color: 'gold', class: 'splash-title' },
                    { default: C(() => [G(u(i(a)('app.title')), 1)]), _: 1 }
                  ),
                  t('div', z, [
                    t('div', D, [
                      t('div', E, [
                        t(
                          'div',
                          { class: 'loading-bar__fill', style: H({ width: `${i(s)}%` }) },
                          null,
                          4
                        ),
                      ]),
                    ]),
                    t('p', $, u(i(a)('common.loading')), 1),
                  ]),
                ]),
              ]
            )
          )
        }
      )
    },
  }),
  K = V(A, [['__scopeId', 'data-v-7ecc53eb']])
export { K as default }
