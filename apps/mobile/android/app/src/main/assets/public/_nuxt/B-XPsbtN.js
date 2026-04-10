import {
  d as B,
  ar as i,
  A as n,
  B as a,
  l as t,
  S as o,
  C as r,
  a5 as p,
  E as y,
  F as M,
  Z as C,
  D as _,
  v as V,
  i as u,
  at as N,
  _ as S,
} from './BI8BVXPj.js'
const D = { class: 'menu-layout' },
  E = ['src'],
  I = { class: 'container' },
  $ = ['src'],
  w = { class: 'footer' },
  x = { key: 0, class: 'version-tag' },
  O = B({
    __name: 'menu',
    setup(U) {
      const c = V(),
        { baseUrl: g } = c.public,
        f = c.public.appVersion,
        d = c.public.environment,
        h = d === 'development',
        l = u(null),
        m = u(`${g}assets/main-menu/MENU.png`),
        v = u(!0),
        e = u(!1)
      ;(i('setBackground', (s) => {
        l.value = s
      }),
        i('setMenuButton', (s) => {
          ;(s.visible !== void 0 && (v.value = s.visible), s.image && (m.value = s.image))
        }),
        i('menuState', {
          isOpen: N(e),
          open: () => {
            e.value = !0
          },
          close: () => {
            e.value = !1
          },
          toggle: () => {
            e.value = !e.value
          },
        }))
      const b = () => {
          e.value = !e.value
        },
        k = () => {
          e.value = !1
        }
      return (s, A) => (
        n(),
        a('div', D, [
          t(l)
            ? (n(),
              a('img', { key: 0, src: t(l), alt: 'Background', class: 'page-bg' }, null, 8, E))
            : o('', !0),
          r('div', I, [p(s.$slots, 'default', {}, void 0, !0)]),
          t(v)
            ? (n(),
              a('button', { key: 1, class: 'menu-icon-btn tap-highlight no-select', onClick: b }, [
                r('img', { src: t(m), alt: 'Menu', class: 'menu-icon' }, null, 8, $),
              ]))
            : o('', !0),
          y(
            C,
            { name: 'menu-fade' },
            {
              default: M(() => [
                t(e) ? p(s.$slots, 'menu', { key: 0, closeMenu: k }, void 0, !0) : o('', !0),
              ]),
              _: 3,
            }
          ),
          r('div', w, [
            h ? (n(), a('div', x, 'v' + _(t(f)) + ' (' + _(t(d)) + ')', 1)) : o('', !0),
          ]),
        ])
      )
    },
  }),
  R = S(O, [['__scopeId', 'data-v-c47c3c4c']])
export { R as default }
