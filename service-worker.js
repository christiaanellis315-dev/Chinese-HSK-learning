// Cache-first app shell service worker. The whole app is static (no external network calls —
// TTS runs on-device), so a simple versioned precache is all that's needed for full offline use.
// Bump CACHE_NAME whenever any precached file changes, so installed clients pick up the update.
const CACHE_NAME = 'chinese-study-v19';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './data/book-registry.js',
  './data/hsk1/lessons/lesson-01.js',
  './data/hsk1/lessons/lesson-02.js',
  './data/hsk1/lessons/lesson-03.js',
  './data/hsk1/lessons/lesson-04.js',
  './data/hsk1/lessons/lesson-05.js',
  './data/hsk1/lessons/lesson-06.js',
  './data/hsk1/lessons/lesson-07.js',
  './data/hsk1/lessons/lesson-08.js',
  './data/hsk1/lessons/lesson-09.js',
  './data/hsk1/lessons/lesson-10.js',
  './data/hsk1/lessons/lesson-11.js',
  './data/hsk1/lessons/lesson-12.js',
  './data/hsk1/lessons/lesson-13.js',
  './data/hsk1/lessons/lesson-14.js',
  './data/hsk1/lessons/lesson-15.js',
  './data/hsk1/grammar/lesson-03.js',
  './data/hsk1/grammar/lesson-04.js',
  './data/hsk1/grammar/lesson-05.js',
  './data/hsk1/grammar/lesson-06.js',
  './data/hsk1/grammar/lesson-07.js',
  './data/hsk1/grammar/lesson-08.js',
  './data/hsk1/grammar/lesson-09.js',
  './data/hsk1/grammar/lesson-10.js',
  './data/hsk1/grammar/lesson-11.js',
  './data/hsk1/grammar/lesson-12.js',
  './data/hsk1/grammar/lesson-13.js',
  './data/hsk1/grammar/lesson-14.js',
  './data/hsk1/grammar/lesson-15.js',
  './data/hsk2/lessons/lesson-01.js',
  './data/hsk2/lessons/lesson-02.js',
  './data/hsk2/lessons/lesson-03.js',
  './data/hsk2/lessons/lesson-04.js',
  './data/hsk2/lessons/lesson-05.js',
  './data/hsk2/lessons/lesson-06.js',
  './data/hsk2/lessons/lesson-07.js',
  './data/hsk2/lessons/lesson-08.js',
  './data/hsk2/lessons/lesson-09.js',
  './data/hsk2/lessons/lesson-10.js',
  './data/hsk2/lessons/lesson-11.js',
  './data/hsk2/lessons/lesson-12.js',
  './data/hsk2/lessons/lesson-13.js',
  './data/hsk2/lessons/lesson-14.js',
  './data/hsk2/lessons/lesson-15.js',
  './data/hsk2/grammar/lesson-01.js',
  './data/hsk2/grammar/lesson-02.js',
  './data/hsk2/grammar/lesson-03.js',
  './data/hsk2/grammar/lesson-04.js',
  './data/hsk2/grammar/lesson-05.js',
  './data/hsk2/grammar/lesson-06.js',
  './data/hsk2/grammar/lesson-07.js',
  './data/hsk2/grammar/lesson-08.js',
  './data/hsk2/grammar/lesson-09.js',
  './data/hsk2/grammar/lesson-10.js',
  './data/hsk2/grammar/lesson-11.js',
  './data/hsk2/grammar/lesson-12.js',
  './data/hsk2/grammar/lesson-13.js',
  './data/hsk2/grammar/lesson-14.js',
  './data/hsk2/grammar/lesson-15.js',
  './data/pinyin-data.js',
  './js/storage.js',
  './js/speech.js',
  './js/recorder.js',
  './js/lessons.js',
  './js/pinyin.js',
  './js/dashboard.js',
  './js/review.js',
  './js/numbers.js',
  './js/grammar.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
