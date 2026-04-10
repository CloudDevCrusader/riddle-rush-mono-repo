import {
  d as o,
  A as l,
  Y as n,
  a4 as p,
  W as c,
  l as m,
  F as d,
  a5 as r,
  m as i,
  _,
} from './BI8BVXPj.js'
const u = o({
    __name: 'GameDisplay',
    props: {
      size: { default: 'md' },
      glow: { type: Boolean, default: !0 },
      tag: { default: 'span' },
    },
    setup(a) {
      const s = a,
        e = i(() => ['game-display', `game-display--${s.size}`, s.glow && 'game-display--glow'])
      return (t, f) => (
        l(),
        n(
          p(a.tag),
          { class: c(m(e)) },
          { default: d(() => [r(t.$slots, 'default', {}, void 0, !0)]), _: 3 },
          8,
          ['class']
        )
      )
    },
  }),
  y = Object.assign(_(u, [['__scopeId', 'data-v-554132a9']]), { __name: 'GameDisplay' })
export { y as _ }
