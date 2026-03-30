import { _ as x } from './DH_jaUQ-.js'
import { _ as y } from './CnCHzusH.js'
import { u as h } from './l4Qz3wUf.js'
import { u as G, b } from './DQggSIYX.js'
import {
  d as q,
  A as B,
  X as S,
  F as s,
  C as n,
  D as l,
  l as a,
  E as r,
  G as _,
  Q as M,
  m as N,
  _ as Q,
} from './BRqkcXJS.js'
const A = { class: 'quit-content' },
  w = { class: 'quit-message' },
  D = { class: 'quit-actions' },
  j = q({
    __name: 'QuitModal',
    props: { modelValue: { type: Boolean } },
    emits: ['update:modelValue', 'confirm', 'cancel'],
    setup(p, { emit: f }) {
      const { t: o } = h(),
        { gameStore: c } = G(),
        i = b(),
        V = p,
        t = f,
        e = N({ get: () => V.modelValue, set: (m) => t('update:modelValue', m) }),
        g = () => {
          ;(i.playClick(), t('cancel'), (e.value = !1))
        },
        v = async () => {
          ;(i.playClick(),
            c.hasActiveSession() && (await c.abandonGame()),
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
                n('div', A, [
                  n('p', w, l(a(o)('game.quitConfirmation')), 1),
                  n('div', D, [
                    r(
                      d,
                      { variant: 'danger', onClick: g },
                      { default: s(() => [_(l(a(o)('common.no')), 1)]), _: 1 }
                    ),
                    r(
                      d,
                      { variant: 'primary', onClick: v },
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
  R = Object.assign(Q(j, [['__scopeId', 'data-v-7f6ae97c']]), { __name: 'QuitModal' })
export { R as default }
