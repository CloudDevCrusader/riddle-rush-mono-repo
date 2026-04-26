if (!self.define) {
  let n,
    e = {};
  const s = (s, l) => (
    (s = new URL(s + '.js', l).href),
    e[s] ||
      new Promise((e) => {
        if ('document' in self) {
          const n = document.createElement('script');
          ((n.src = s), (n.onload = e), document.head.appendChild(n));
        } else ((n = s), importScripts(s), e());
      }).then(() => {
        let n = e[s];
        if (!n) throw new Error(`Module ${s} didn’t register its module`);
        return n;
      })
  );
  self.define = (l, i) => {
    const u = n || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[u]) return;
    let r = {};
    const a = (n) => s(n, u),
      o = { module: { uri: u }, exports: r, require: a };
    e[u] = Promise.all(l.map((n) => o[n] || a(n))).then((n) => (i(...n), r));
  };
}
define(['./workbox-36e3bbf8'], function (n) {
  'use strict';
  (self.skipWaiting(),
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
        { url: '/', revision: '0bfcfb57de8aece337b163f49f228099' },
        { url: 'icon.svg', revision: '1bc9b25ba955dc9896d37770146122e2' },
        { url: 'icon-maskable.svg', revision: 'f41d25759cede4d789e3508bc049475f' },
        { url: 'favicon.ico', revision: 'bdcfac49ce2537185b04e8951e03e4d1' },
        { url: 'favicon-32x32.png', revision: 'fdff40bbab1a416125c1bce5c1a703e5' },
        { url: 'favicon-16x16.png', revision: '565bd339f87400dba895a3c75520122e' },
        { url: 'apple-touch-icon.png', revision: '4ba7d95022bd1c1de11d64357bdcd433' },
        { url: '404', revision: '0bfcfb57de8aece337b163f49f228099' },
        { url: '200', revision: '0bfcfb57de8aece337b163f49f228099' },
        { url: 'splash', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'settings', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'round-start', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'players', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'leaderboard', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'language', revision: '4a17b69259c5fd0caa130b081a38d374' },
        { url: 'data/offlineAnswers.json', revision: '750b085813beb33b65b3917adcc95756' },
        { url: 'data/categories.json', revision: '68c5ca1af19426293007c10e80f6b047' },
        { url: 'credits', revision: '26aa5272fbdda9fbd3991c795bd201cf' },
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
        { url: '_nuxt/x5n4Ge0j.js', revision: null },
        { url: '_nuxt/syR-JwGV.js', revision: null },
        { url: '_nuxt/splash.CgaCP32X.css', revision: null },
        { url: '_nuxt/settings.CswLgp8-.css', revision: null },
        { url: '_nuxt/round-start.BaGkuPa0.css', revision: null },
        { url: '_nuxt/players.BGRTDmBf.css', revision: null },
        { url: '_nuxt/pMSXBvMr.js', revision: null },
        { url: '_nuxt/nunito-vietnamese-wght-normal.U01xdrZh.woff2', revision: null },
        { url: '_nuxt/nunito-latin-wght-normal.BzFMHfZw.woff2', revision: null },
        { url: '_nuxt/nunito-latin-ext-wght-normal.CXYtwYOx.woff2', revision: null },
        { url: '_nuxt/nunito-cyrillic-wght-normal.CY6AOgYE.woff2', revision: null },
        { url: '_nuxt/nunito-cyrillic-ext-wght-normal.D4X5GqEv.woff2', revision: null },
        { url: '_nuxt/menu.C1jX5nck.css', revision: null },
        { url: '_nuxt/mc0hm5Lr.js', revision: null },
        { url: '_nuxt/leaderboard.BhyFPOcT.css', revision: null },
        { url: '_nuxt/language.g7O3AWJy.css', revision: null },
        { url: '_nuxt/lWKYTbvB.js', revision: null },
        { url: '_nuxt/index.CXhaGT47.css', revision: null },
        { url: '_nuxt/entry.DFk86X_R.css', revision: null },
        { url: '_nuxt/ekmAB-RP.js', revision: null },
        { url: '_nuxt/default.B6NWv1l2.css', revision: null },
        { url: '_nuxt/credits.BcBWtL88.css', revision: null },
        { url: '_nuxt/baloo-2-vietnamese-wght-normal.C4ZonJY6.woff2', revision: null },
        { url: '_nuxt/baloo-2-latin-wght-normal.B_TVFhwJ.woff2', revision: null },
        { url: '_nuxt/baloo-2-latin-ext-wght-normal.Dz43yst_.woff2', revision: null },
        { url: '_nuxt/baloo-2-devanagari-wght-normal.B4j4n2PV.woff2', revision: null },
        { url: '_nuxt/axOvBr6b.js', revision: null },
        { url: '_nuxt/_j7_Vpgi.js', revision: null },
        { url: '_nuxt/_gameId_.CxjHK6vu.css', revision: null },
        { url: '_nuxt/_gameId_.BBcpagal.css', revision: null },
        { url: '_nuxt/StoryboardDevOverlay.Dl_nEfHa.css', revision: null },
        { url: '_nuxt/SmMOJfit.js', revision: null },
        { url: '_nuxt/QuitModal.C_koQo7F.css', revision: null },
        { url: '_nuxt/PmVUKlQ_.js', revision: null },
        { url: '_nuxt/PauseModal.DJpZ1vmy.css', revision: null },
        { url: '_nuxt/GameSessionTopBar.JcVfQngW.css', revision: null },
        { url: '_nuxt/GameScrollList.DOAVn29o.css', revision: null },
        { url: '_nuxt/GamePanel.BuBOgz_y.css', revision: null },
        { url: '_nuxt/GameModal.DfHjQfcb.css', revision: null },
        { url: '_nuxt/GameHeader.tD8y4dXi.css', revision: null },
        { url: '_nuxt/GameButtonGroup.DRYo6T2C.css', revision: null },
        { url: '_nuxt/GameButton.BW9l_Xvi.css', revision: null },
        { url: '_nuxt/GameBackground.YfF7XvDd.css', revision: null },
        { url: '_nuxt/DyFADPTo.js', revision: null },
        { url: '_nuxt/Dv2lu3E-.js', revision: null },
        { url: '_nuxt/DebugPanel.CJNkmvVi.css', revision: null },
        { url: '_nuxt/Db0WZDCX.js', revision: null },
        { url: '_nuxt/DW7iTPZT.js', revision: null },
        { url: '_nuxt/DT-snbbC.js', revision: null },
        { url: '_nuxt/DFwuH21e.js', revision: null },
        { url: '_nuxt/DA04Kq5m.js', revision: null },
        { url: '_nuxt/D7XNNiGS.js', revision: null },
        { url: '_nuxt/Cok66Hgq.js', revision: null },
        { url: '_nuxt/Cm1rSxGM.js', revision: null },
        { url: '_nuxt/CDrS6YM9.js', revision: null },
        { url: '_nuxt/CAuQw1Zk.js', revision: null },
        { url: '_nuxt/C2RNYpZC.js', revision: null },
        { url: '_nuxt/BytTiFCX.js', revision: null },
        { url: '_nuxt/BmfxnMuG.js', revision: null },
        { url: '_nuxt/BeXZiC6T.js', revision: null },
        { url: '_nuxt/BNRuPOSd.js', revision: null },
        { url: '_nuxt/BIl4cyR9.js', revision: null },
        { url: '_nuxt/BAhoGBnc.js', revision: null },
        { url: '_nuxt/B32Wciw1.js', revision: null },
        { url: '_nuxt/B29ViHSK.js', revision: null },
        { url: '_nuxt/3xa2kWO1.js', revision: null },
        { url: '_nuxt/3_Ub1HKp.js', revision: null },
        { url: '_nuxt/2jV_5muz.js', revision: null },
        { url: '_nuxt/builds/latest.json', revision: '3519c2389f62f8635a719abd87fa22c7' },
        { url: '_nuxt/builds/meta/3edd56e6-56ad-47dc-a8d7-9258b334a762.json', revision: null },
        { url: 'manifest.webmanifest', revision: '45a939707c50423cd5ab8372ae0eddf7' },
      ],
      {}
    ),
    n.cleanupOutdatedCaches(),
    n.registerRoute(
      new n.NavigationRoute(n.createHandlerBoundToURL('/'), {
        denylist: [/^\/_nuxt\//, /\.(?:js|mjs|css|map)$/],
      })
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
    ));
});
