import {
  d as h,
  u as f,
  ar as p,
  A as a,
  B as t,
  l as s,
  S as r,
  C as i,
  a5 as y,
  D as v,
  v as C,
  i as o,
  _ as V,
} from './BI8BVXPj.js'
const D = { class: 'game-layout' },
  I = ['src'],
  S = ['src'],
  x = { class: 'container' },
  N = { class: 'footer' },
  R = { key: 0, class: 'version-tag' },
  $ = h({
    __name: 'game',
    setup(w) {
      const n = C(),
        { baseUrl: k } = n.public,
        m = f(),
        g = n.public.appVersion,
        u = n.public.environment,
        B = u === 'development',
        c = o(null),
        d = o(`${k}assets/players/back.png`),
        _ = o(!0),
        l = o(null)
      ;(p('setBackground', (e) => {
        c.value = e
      }),
        p('setBackButton', (e) => {
          ;(e.visible !== void 0 && (_.value = e.visible),
            e.image && (d.value = e.image),
            e.onBack && (l.value = e.onBack))
        }))
      const b = () => {
        l.value ? l.value() : m.back()
      }
      return (e, A) => (
        a(),
        t('div', D, [
          s(c)
            ? (a(),
              t('img', { key: 0, src: s(c), alt: 'Background', class: 'page-bg' }, null, 8, I))
            : r('', !0),
          s(_)
            ? (a(),
              t('button', { key: 1, class: 'back-btn tap-highlight no-select', onClick: b }, [
                i('img', { src: s(d), alt: 'Back' }, null, 8, S),
              ]))
            : r('', !0),
          i('div', x, [y(e.$slots, 'default', {}, void 0, !0)]),
          i('div', N, [
            B ? (a(), t('div', R, 'v' + v(s(g)) + ' (' + v(s(u)) + ')', 1)) : r('', !0),
          ]),
        ])
      )
    },
  }),
  U = V($, [['__scopeId', 'data-v-cd900ec4']])
export { U as default }
