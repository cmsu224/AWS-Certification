// ============================================================
//  AWS Cert Study — Service worker
//  shell: precached · navigations + js/*: network-first with a 3s timeout
//  (then the cached copy; the fetch keeps going to refresh the cache)
//  icons: cache-first · audio: 'aws-audio' cache (Range → 206) else network
//  Bump CACHE_NAME whenever shell assets change.
// ============================================================
const CACHE_NAME = 'aws-study-v2-2026-09-26d';
const NET_TIMEOUT_MS = 3000; // weak signal: fall back to the cached copy after this
const AUDIO_CACHE = 'aws-audio';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/course.js',
  './js/data.js',
  './js/data-saa.js',
  './js/util.js',
  './js/model.js',
  './js/session.js',
  './js/speech.js',
  './js/listen.js',
  './js/today.js',
  './js/views.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  // Add one by one so a missing optional file (e.g. an icon) never breaks install.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    Promise.all(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))));
  // No skipWaiting here: the page shows "Update available" and sends SKIP_WAITING.
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function cachedCopy(request, fallbackUrl) {
  return caches.open(CACHE_NAME)
    .then((c) => c.match(fallbackUrl || request, { ignoreSearch: true })
      .then((hit) => hit || c.match(request, { ignoreSearch: true })))
    .catch(() => undefined);
}

/**
 * Network-first, but never wait more than NET_TIMEOUT_MS when a cached copy exists:
 * on a one-bar signal the app opens from cache and the fetch finishes in the
 * background (kept alive with waitUntil) to refresh the cache for next time.
 */
function networkFirst(event, fallbackUrl) {
  const request = event.request;
  const net = fetch(request).then((res) => {
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      return caches.open(CACHE_NAME).then((c) => c.put(fallbackUrl || request, copy)).catch(() => {}).then(() => res);
    }
    return res;
  });
  event.waitUntil(net.catch(() => {}));
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (!done && r) { done = true; resolve(r); } };
    net.then(finish, () => cachedCopy(request, fallbackUrl).then((hit) =>
      finish(hit || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))));
    setTimeout(() => { if (!done) cachedCopy(request, fallbackUrl).then(finish); }, NET_TIMEOUT_MS);
  });
}

function cacheFirst(request) {
  return caches.match(request, { ignoreSearch: true }).then((hit) => hit || fetch(request).then((res) => {
    if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(request, copy)); }
    return res;
  }));
}

/** Serve a saved audio pack, slicing for Range requests (needed for seeking / iOS). */
function audioResponse(request) {
  return caches.open(AUDIO_CACHE).then((c) => c.match(request.url)).then((hit) => {
    if (!hit) return fetch(request);
    const range = request.headers.get('range');
    if (!range) return hit;
    return hit.arrayBuffer().then((buf) => {
      const size = buf.byteLength;
      const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
      let start = m[1] ? parseInt(m[1], 10) : NaN;
      let end = m[2] ? parseInt(m[2], 10) : NaN;
      if (isNaN(start)) { start = Math.max(0, size - (isNaN(end) ? size : end)); end = size - 1; }
      if (isNaN(end) || end >= size) end = size - 1;
      if (start >= size || start > end) {
        return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
      }
      return new Response(buf.slice(start, end + 1), {
        status: 206, statusText: 'Partial Content',
        headers: {
          'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg',
          'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
          'Content-Length': String(end - start + 1),
          'Accept-Ranges': 'bytes',
        },
      });
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // app makes no cross-origin calls

  const scope = new URL(self.registration.scope);
  const path = url.pathname.slice(scope.pathname.length); // path relative to the app root

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(event, './index.html'));
    return;
  }
  if (/^audio\/.+\.mp3$/i.test(path)) {
    event.respondWith(audioResponse(req));
    return;
  }
  if (path === 'audio/index.json') {
    event.respondWith(networkFirst(event));
    return;
  }
  if (/^icons\//.test(path)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (/^js\//.test(path) || path === 'manifest.webmanifest' || /^css\//.test(path)) {
    event.respondWith(networkFirst(event));
    return;
  }
  event.respondWith(cacheFirst(req));
});
