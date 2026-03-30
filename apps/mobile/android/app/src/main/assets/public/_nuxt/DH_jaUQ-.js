import { d as u, A as n, B as o, a4 as c, V as m, l as b, m as f, _ as r } from './BRqkcXJS.js'
const g = ['type', 'disabled', 'aria-busy'],
  p = { key: 0, class: 'game-button__spinner' },
  _ = u({
    __name: 'GameButton',
    props: {
      variant: { default: 'primary' },
      size: { default: 'md' },
      type: { default: 'button' },
      disabled: { type: Boolean, default: !1 },
      loading: { type: Boolean, default: !1 },
      fullWidth: { type: Boolean, default: !1 },
    },
    emits: ['click'],
    setup(t, { emit: l }) {
      const e = t,
        s = l,
        d = f(() => [
          'game-button',
          `game-button--${e.variant}`,
          `game-button--${e.size}`,
          {
            'game-button--disabled': e.disabled || e.loading,
            'game-button--loading': e.loading,
            'game-button--full-width': e.fullWidth,
          },
        ]),
        i = (a) => {
          !e.disabled && !e.loading && s('click', a)
        }
      return (a, y) => (
        n(),
        o(
          'button',
          {
            class: m(b(d)),
            type: t.type,
            disabled: t.disabled || t.loading,
            'aria-busy': t.loading,
            onClick: i,
          },
          [t.loading ? (n(), o('span', p)) : c(a.$slots, 'default', { key: 1 }, void 0, !0)],
          10,
          g
        )
      )
    },
  }),
  B = Object.assign(r(_, [['__scopeId', 'data-v-012278f8']]), { __name: 'GameButton' })
export { B as _ }
