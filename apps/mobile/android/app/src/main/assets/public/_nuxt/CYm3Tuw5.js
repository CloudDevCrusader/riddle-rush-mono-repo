import { _ as x } from './D9TZGafa.js'
import { _ as y } from './D3QXmhki.js'
import { u as b } from './CbjeSZOE.js'
import { u as h, b as G } from './QhPvbTN-.js'
import {
  d as q,
  A as B,
  Y as S,
  F as s,
  C as n,
  D as l,
  l as a,
  E as r,
  G as _,
  R as M,
  m as N,
  _ as A,
} from './BI8BVXPj.js'
const Q = { class: 'quit-content' },
  w = { class: 'quit-message' },
  D = { class: 'quit-actions' },
  R = q({
    __name: 'QuitModal',
    props: { modelValue: { type: Boolean } },
    emits: ['update:modelValue', 'confirm', 'cancel'],
    setup(p, { emit: f }) {
      const { t: o } = b(),
        { gameStore: c } = h(),
        i = G(),
        v = p,
        t = f,
        e = N({ get: () => v.modelValue, set: (m) => t('update:modelValue', m) }),
        V = () => {
          ;(i.playClick(), t('cancel'), (e.value = !1))
        },
        g = async () => {
          ;(i.playClick(),
            c.hasActiveSession.value && (await c.abandonGame()),
            t('confirm'),
            (e.value = !1))
        }
      return (m, u) => {
        const d = x,
          C = y
        return (
          B(),
          S(
            C,
            {
              modelValue: a(e),
              'onUpdate:modelValue': u[0] || (u[0] = (k) => (M(e) ? (e.value = k) : null)),
              variant: 'danger',
              title: a(o)('game.quitGame'),
              'close-on-backdrop': !1,
              'close-on-escape': !1,
            },
            {
              default: s(() => [
                n('div', Q, [
                  n('p', w, l(a(o)('game.quitConfirmation')), 1),
                  n('div', D, [
                    r(
                      d,
                      { variant: 'danger', onClick: V },
                      { default: s(() => [_(l(a(o)('common.no')), 1)]), _: 1 }
                    ),
                    r(
                      d,
                      { variant: 'primary', onClick: g },
                      { default: s(() => [_(l(a(o)('common.yes')), 1)]), _: 1 }
                    ),
                  ]),
                ]),
              ]),
              _: 1,
            },
            8,
            ['modelValue', 'title']
          )
        )
      }
    },
  }),
  O = Object.assign(A(R, [['__scopeId', 'data-v-6c7b1d1f']]), { __name: 'QuitModal' })
export { O as default }
