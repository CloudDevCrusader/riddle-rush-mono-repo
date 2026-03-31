import { c as f, t } from './U51DJ_Qi.js'
import { i as u } from './2pf-zKNd.js'
import { i as h } from './Dxzbedgu.js'
import { i as e } from './CSKNA-QO.js'
import { i as g } from './BLd32nMJ.js'
function A(r, s, l) {
  s = f(s, r)
  for (var a = -1, i = s.length, n = !1; ++a < i; ) {
    var m = t(s[a])
    if (!(n = r != null && l(r, m))) break
    r = r[m]
  }
  return n || ++a != i
    ? n
    : ((i = r == null ? 0 : r.length), !!i && g(i) && e(m, i) && (h(r) || u(r)))
}
export { A as h }
