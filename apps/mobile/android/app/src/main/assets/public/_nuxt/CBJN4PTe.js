import {
  d as B,
  aj as i,
  A as n,
  B as a,
  l as t,
  R as o,
  C as r,
  a4 as p,
  E as y,
  F as M,
  Y as C,
  D as _,
  v as V,
  i as u,
  am as N,
  _ as D,
} from './BRqkcXJS.js'
const E = { class: 'menu-layout' },
  I = ['src'],
  S = { class: 'container' },
  $ = ['src'],
  w = { class: 'footer' },
  x = { key: 0, class: 'version-tag' },
  O = B({
    __name: 'menu',
    setup(R) {
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
      return (s, U) => (
        n(),
        a('div', E, [
          t(l)
            ? (n(),
              a('img', { key: 0, src: t(l), alt: 'Background', class: 'page-bg' }, null, 8, I))
            : o('', !0),
          r('div', S, [p(s.$slots, 'default', {}, void 0, !0)]),
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
  A = D(O, [['__scopeId', 'data-v-c47c3c4c']])
export { A as default }
