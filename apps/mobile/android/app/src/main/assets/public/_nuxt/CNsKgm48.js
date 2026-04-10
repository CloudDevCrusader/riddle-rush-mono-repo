import { e as s } from './DPGIUuQ3.js'
import { i as o } from './Cqt4AUNF.js'
import { i as e } from './CSKNA-QO.js'
import { i as m } from './C3e4t58V.js'
import { t as p } from './CiGF-E6V.js'
function E(r, t, i) {
  if (!m(i)) return !1
  var n = typeof t
  return (n == 'number' ? o(i) && e(t, i.length) : n == 'string' && t in i) ? s(i[t], r) : !1
}
var f = 1 / 0,
  a = 17976931348623157e292
function I(r) {
  if (!r) return r === 0 ? r : 0
  if (((r = p(r)), r === f || r === -f)) {
    var t = r < 0 ? -1 : 1
    return t * a
  }
  return r === r ? r : 0
}
function F(r) {
  var t = I(r),
    i = t % 1
  return t === t ? (i ? t - i : t) : 0
}
export { E as i, F as t }
