import { i as o, a as s, c as p, d as e } from './CA2VU3DF.js'
import { g as m } from './B39m6GhF.js'
import { i as f } from './2pf-zKNd.js'
import { i as n } from './Dxzbedgu.js'
import { i as a } from './Cqt4AUNF.js'
import './DBIYhhxi.js'
import './BLd32nMJ.js'
import './nLWjQ9zq.js'
import './CynwsF02.js'
import './J4-gmw-T.js'
import './C3e4t58V.js'
import './BoesD0Uv.js'
var y = '[object Map]',
  g = '[object Set]',
  c = Object.prototype,
  b = c.hasOwnProperty
function E(r) {
  if (r == null) return !0
  if (
    a(r) &&
    (n(r) || typeof r == 'string' || typeof r.splice == 'function' || o(r) || s(r) || f(r))
  )
    return !r.length
  var t = m(r)
  if (t == y || t == g) return !r.size
  if (p(r)) return !e(r).length
  for (var i in r) if (b.call(r, i)) return !1
  return !0
}
export { E as default }
