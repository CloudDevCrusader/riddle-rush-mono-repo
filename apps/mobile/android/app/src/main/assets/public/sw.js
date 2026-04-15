if (!self.define) {
  let n,
    e = {}
  const s = (s, l) => (
    (s = new URL(s + '.js', l).href),
    e[s] ||
      new Promise((e) => {
        if ('document' in self) {
          const n = document.createElement('script')
          ;((n.src = s), (n.onload = e), document.head.appendChild(n))
        } else ((n = s), importScripts(s), e())
      }).then(() => {
        let n = e[s]
        if (!n) throw new Error(`Module ${s} didn’t register its module`)
        return n
      })
  )
  self.define = (l, i) => {
    const u = n || ('document' in self ? document.currentScript.src : '') || location.href
    if (e[u]) return
    let r = {}
    const o = (n) => s(n, u),
      a = { module: { uri: u }, exports: r, require: o }
    e[u] = Promise.all(l.map((n) => a[n] || o(n))).then((n) => (i(...n), r))
  }
}
define(['./workbox-36e3bbf8'], function (n) {
  'use strict'
  ;(self.skipWaiting(),
    n.clientsClaim(),
    n.precacheAndRoute(
      [
        { url: 'pwa-icon-template.svg', revision: '5ed6ab891f2d74fb7e55cc462cf7289a' },
        { url: 'pwa-96x96.png', revision: 'b97ab83b85e944393fb3c021c54789c8' },
        { url: 'pwa-72x72.png', revision: '3321505f5b47af7a9c5a0ec29e484b0b' },
        { url: 'pwa-512x512.png', revision: '7af3d31c5b8811465a3988768b667b3a' },
        { url: 'pwa-512x512-maskable.png', revision: '368181baa81a03a0bde7d244dda795e1' },
        { url: 'pwa-384x384.png', revision: 'a6ff95cac6e796355a2ca1ee98564e67' },
        { url: 'pwa-192x192.png', revision: '9201c815948b26ef7f168a59dd9f1753' },
        { url: 'pwa-152x152.png', revision: '651de702ad278de576280cf8299e2fdf' },
        { url: 'pwa-144x144.png', revision: 'db32556bb7a5cd8490033eff46e10caa' },
        { url: 'pwa-128x128.png', revision: 'f0fa85c4aa1cadc57f4ec7d7f1c00316' },
        { url: '/', revision: '58b34ab6e1cca01e71186ffa783da861' },
        { url: 'icon.svg', revision: '1bc9b25ba955dc9896d37770146122e2' },
        { url: 'icon-maskable.svg', revision: 'f41d25759cede4d789e3508bc049475f' },
        { url: 'favicon.ico', revision: 'bdcfac49ce2537185b04e8951e03e4d1' },
        { url: 'favicon-32x32.png', revision: 'fdff40bbab1a416125c1bce5c1a703e5' },
        { url: 'favicon-16x16.png', revision: '565bd339f87400dba895a3c75520122e' },
        { url: 'apple-touch-icon.png', revision: '4ba7d95022bd1c1de11d64357bdcd433' },
        { url: '404', revision: '58b34ab6e1cca01e71186ffa783da861' },
        { url: '200', revision: 'c5a5171bcef4846be5d0478da94ddb70' },
        { url: 'data/offlineAnswers.json', revision: '750b085813beb33b65b3917adcc95756' },
        { url: 'data/categories.json', revision: '68c5ca1af19426293007c10e80f6b047' },
        { url: 'assets/splash/logo.png', revision: '4234e26d8cee5b8b34e8403eec0f4bf4' },
        { url: 'assets/splash/loading.png', revision: 'b07501d8d6691920d00290860da4d9d7' },
        { url: 'assets/splash/loading-top.png', revision: '69d72d7243c4161345fd4f523045d90f' },
        { url: 'assets/splash/loading-down.png', revision: 'b73b3cb79d1fe0e6e79c622cb8a5fc5d' },
        { url: 'assets/splash/background.png', revision: '732468cf8054068f4b5e1a6170ad969c' },
        { url: 'assets/settings/sound.png', revision: 'fc60c396da4ffb502a50e36fa071b12a' },
        { url: 'assets/settings/options.png', revision: 'd9cd376bef19cee97821eb3f72fb01b8' },
        { url: 'assets/settings/ok.png', revision: '83ef74471ab052809f9b51f442e9ffea' },
        { url: 'assets/settings/music.png', revision: '96791cfc8233bce825f7d259d4c95b45' },
        { url: 'assets/settings/background.png', revision: '515f926fefd8c2df42c066cacf6aee0e' },
        { url: 'assets/settings/back.png', revision: '8ddf7119771f115345d703d9cc6bc2e8' },
        { url: 'assets/players/back.png', revision: '69f2449a4074ad4511366a03bf28eea7' },
        { url: 'assets/main-menu/menu.png', revision: '2827dd4fe7d01ffbded11da819f50cfc' },
        { url: 'assets/alphabets/next.png', revision: '2e2b18e31b3f0025b3e4c3e88f681ea3' },
        { url: 'assets/alphabets/category.png', revision: '22847be0d863c35da307bc43285be533' },
        { url: 'assets/alphabets/background.png', revision: '515f926fefd8c2df42c066cacf6aee0e' },
        { url: 'assets/alphabets/back.png', revision: '69f2449a4074ad4511366a03bf28eea7' },
        { url: '_nuxt/splash.Cylrmc2i.css', revision: null },
        { url: '_nuxt/settings.Cq3Vk3gV.css', revision: null },
        { url: '_nuxt/round-start.C1YFnQ8u.css', revision: null },
        { url: '_nuxt/players.roEG_VaX.css', revision: null },
        { url: '_nuxt/nunito-vietnamese-wght-normal.U01xdrZh.woff2', revision: null },
        { url: '_nuxt/nunito-latin-wght-normal.BzFMHfZw.woff2', revision: null },
        { url: '_nuxt/nunito-latin-ext-wght-normal.CXYtwYOx.woff2', revision: null },
        { url: '_nuxt/nunito-cyrillic-wght-normal.CY6AOgYE.woff2', revision: null },
        { url: '_nuxt/nunito-cyrillic-ext-wght-normal.D4X5GqEv.woff2', revision: null },
        { url: '_nuxt/menu.C7w93Hz0.css', revision: null },
        { url: '_nuxt/leaderboard.D182hlXL.css', revision: null },
        { url: '_nuxt/language.BZFcOTHI.css', revision: null },
        { url: '_nuxt/index.BxV3FXXA.css', revision: null },
        { url: '_nuxt/fIdRqPPm.js', revision: null },
        { url: '_nuxt/error-500.C9_cEdXK.css', revision: null },
        { url: '_nuxt/error-404.Cek2Jvq5.css', revision: null },
        { url: '_nuxt/entry.Dq2w_ilG.css', revision: null },
        { url: '_nuxt/default.DoE0f9rh.css', revision: null },
        { url: '_nuxt/credits.D4-SnfVr.css', revision: null },
        { url: '_nuxt/baloo-2-vietnamese-wght-normal.C4ZonJY6.woff2', revision: null },
        { url: '_nuxt/baloo-2-latin-wght-normal.B_TVFhwJ.woff2', revision: null },
        { url: '_nuxt/baloo-2-latin-ext-wght-normal.Dz43yst_.woff2', revision: null },
        { url: '_nuxt/baloo-2-devanagari-wght-normal.B4j4n2PV.woff2', revision: null },
        { url: '_nuxt/_gameId_.Bv96_S_o.css', revision: null },
        { url: '_nuxt/_gameId_.BO0vTfxm.css', revision: null },
        { url: '_nuxt/Wf5ShDHP.js', revision: null },
        { url: '_nuxt/UG9OeS1m.js', revision: null },
        { url: '_nuxt/StoryboardDevOverlay.C1R0u9_j.css', revision: null },
        { url: '_nuxt/QuitModal.huL1kSeo.css', revision: null },
        { url: '_nuxt/QmAYvqSa.js', revision: null },
        { url: '_nuxt/PauseModal.EXI2GI4t.css', revision: null },
        { url: '_nuxt/Lq7e9j0K.js', revision: null },
        { url: '_nuxt/HVg-wgRd.js', revision: null },
        { url: '_nuxt/GameScrollList.BeCuGxX0.css', revision: null },
        { url: '_nuxt/GamePanel.BuBOgz_y.css', revision: null },
        { url: '_nuxt/GameModal.B95yIduL.css', revision: null },
        { url: '_nuxt/GameHeader.Bkqb05vw.css', revision: null },
        { url: '_nuxt/GameButton.DkTmBNjV.css', revision: null },
        { url: '_nuxt/GameBackground.YfF7XvDd.css', revision: null },
        { url: '_nuxt/Fpx_TPmi.js', revision: null },
        { url: '_nuxt/Dylazari.js', revision: null },
        { url: '_nuxt/DwPmJ3H1.js', revision: null },
        { url: '_nuxt/DwIbcF5R.js', revision: null },
        { url: '_nuxt/Dnj2Du2-.js', revision: null },
        { url: '_nuxt/DebugPanel.BxLdTN7x.css', revision: null },
        { url: '_nuxt/D_np6RmY.js', revision: null },
        { url: '_nuxt/DN_MwGm8.js', revision: null },
        { url: '_nuxt/CwR-Lax0.js', revision: null },
        { url: '_nuxt/CnTVgds1.js', revision: null },
        { url: '_nuxt/CjP97SPZ.js', revision: null },
        { url: '_nuxt/CZ-pJkKw.js', revision: null },
        { url: '_nuxt/CMK4OBsg.js', revision: null },
        { url: '_nuxt/CBKtub_l.js', revision: null },
        { url: '_nuxt/ButSxFDn.js', revision: null },
        { url: '_nuxt/Bt2clXZS.js', revision: null },
        { url: '_nuxt/BrzXT55b.js', revision: null },
        { url: '_nuxt/BlPzEc0T.js', revision: null },
        { url: '_nuxt/BjA8NwNK.js', revision: null },
        { url: '_nuxt/Bc1sEmEh.js', revision: null },
        { url: '_nuxt/BQwLk0vU.js', revision: null },
        { url: '_nuxt/BIl4cyR9.js', revision: null },
        { url: '_nuxt/BCsZbv56.js', revision: null },
        { url: '_nuxt/BAn_wJUa.js', revision: null },
        { url: '_nuxt/B4MYvHaN.js', revision: null },
        { url: '_nuxt/AqKrY_Yi.js', revision: null },
        { url: '_nuxt/2tceffRg.js', revision: null },
        { url: '_nuxt/-jshCCQH.js', revision: null },
        { url: '_nuxt/-GnX96Zh.js', revision: null },
        { url: '_nuxt/builds/latest.json', revision: '1c08288f016c27d8ac4c6dde2de5f5e0' },
        { url: '_nuxt/builds/meta/6ddd9eea-7f54-424f-8b57-ed9a7d6f71d9.json', revision: null },
        { url: 'manifest.webmanifest', revision: '45a939707c50423cd5ab8372ae0eddf7' },
      ],
      {}
    ),
    n.cleanupOutdatedCaches(),
    n.registerRoute(
      new n.NavigationRoute(n.createHandlerBoundToURL('/'), { allowlist: [/^\/(?!api\/)/] })
    ),
    n.registerRoute(
      /^\/$/,
      new n.NetworkFirst({ cacheName: 'start-url', networkTimeoutSeconds: 3, plugins: [] }),
      'GET'
    ),
    n.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      new n.CacheFirst({
        cacheName: 'images',
        plugins: [new n.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592e3 })],
      }),
      'GET'
    ),
    n.registerRoute(
      /\.(?:woff|woff2|ttf|otf|eot)$/,
      new n.CacheFirst({
        cacheName: 'fonts',
        plugins: [new n.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ))
})
