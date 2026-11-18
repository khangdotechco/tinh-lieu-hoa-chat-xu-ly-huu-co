// Service worker: cho app mở được khi mất mạng. Đổi VERSION mỗi lần cập nhật app.
const VERSION = 'tinhlieu-v1.6';
const FILES = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Ưu tiên mạng và luôn hỏi lại máy chủ (bỏ qua bộ nhớ đệm HTTP ~10 phút của GitHub Pages); mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(
    fetch(same ? new Request(e.request, {cache: 'no-cache'}) : e.request)
      .then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
