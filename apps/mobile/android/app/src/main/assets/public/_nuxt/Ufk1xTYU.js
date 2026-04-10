import { L as r, ah as t, m as o } from './BI8BVXPj.js'
function n() {
  const s = r(),
    e = t()
  return {
    isLoading: o(() => s.isLoading),
    progress: o(() => s.progress),
    showProgress: o(() => s.showProgress),
    showLoading: s.showLoading,
    hideLoading: s.hideLoading,
    setProgress: s.setProgress,
    setOnlineStatus: e.setOnlineStatus,
  }
}
export { n as u }
