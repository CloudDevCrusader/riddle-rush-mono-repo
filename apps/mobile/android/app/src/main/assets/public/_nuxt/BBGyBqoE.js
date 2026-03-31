import { i as m } from './2pf-zKNd.js'
import { i as h } from './Dxzbedgu.js'
import { i as g, a as u, d as y } from './CA2VU3DF.js'
import { i as A } from './CSKNA-QO.js'
import { i as b } from './Cqt4AUNF.js'
function d(r, e) {
  for (var i = -1, t = Array(r); ++i < r; ) t[i] = e(i)
  return t
}
var c = Object.prototype,
  x = c.hasOwnProperty
function O(r, e) {
  var i = h(r),
    t = !i && m(r),
    a = !i && !t && g(r),
    o = !i && !t && !a && u(r),
    f = i || t || a || o,
    n = f ? d(r.length, String) : [],
    p = n.length
  for (var s in r)
    (e || x.call(r, s)) &&
      !(
        f &&
        (s == 'length' ||
          (a && (s == 'offset' || s == 'parent')) ||
          (o && (s == 'buffer' || s == 'byteLength' || s == 'byteOffset')) ||
          A(s, p))
      ) &&
      n.push(s)
  return n
}
function B(r) {
  return b(r) ? O(r) : y(r)
}
export { O as a, B as k }
