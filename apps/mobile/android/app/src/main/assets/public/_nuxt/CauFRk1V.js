import {
  d as n,
  A as s,
  B as a,
  a4 as t,
  R as o,
  C as _,
  V as c,
  l as m,
  m as i,
  _ as h,
} from './BRqkcXJS.js'
const p = { key: 0, class: 'game-header__left' },
  u = { class: 'game-header__title' },
  f = { key: 1, class: 'game-header__right' },
  g = n({
    __name: 'GameHeader',
    props: { color: { default: 'white' } },
    setup(r) {
      const d = r,
        l = i(() => ['game-header', `game-header--${d.color}`])
      return (e, v) => (
        s(),
        a(
          'header',
          { class: c(m(l)) },
          [
            e.$slots.left ? (s(), a('div', p, [t(e.$slots, 'left', {}, void 0, !0)])) : o('', !0),
            _('h1', u, [t(e.$slots, 'default', {}, void 0, !0)]),
            e.$slots.right ? (s(), a('div', f, [t(e.$slots, 'right', {}, void 0, !0)])) : o('', !0),
          ],
          2
        )
      )
    },
  }),
  C = Object.assign(h(g, [['__scopeId', 'data-v-2d22ea50']]), { __name: 'GameHeader' })
export { C as _ }
