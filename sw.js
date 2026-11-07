/**
 * East Times (이스트타임즈) PWA Service Worker
 * 버전: v1.1.0
 */

const CACHE_NAME = 'easttimes-cache-v1.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './article.html',
  './admin.html',
  './css/newspaper.css',
  './css/article.css',
  './css/admin.css',
  './data/newsData.js',
  './data/shopData.js',
  './data/users.js',
  './js/newsApp.js',
  './js/articleApp.js',
  './js/shopApp.js',
  './js/adminApp.js',
  './js/weatherTideService.js',
  './assets/icons/icon.svg',
  './manifest.json'
];

// 서비스 워커 설치 시 정적 에셋 사전 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static app assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Service Worker] Non-critical cache addAll issue:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 활성화 및 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 네트워크 우선 (Network First with Cache Fallback)
// 최신 기사 콘텐츠를 우선 가져오고 오프라인일 때 캐시 제공
self.addEventListener('fetch', (event) => {
  // GET 요청만 캐싱 처리
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 외부 API나 CDN 리소스 또는 로컬 리소스
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 성공적인 응답일 때 캐시 업데이트
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // 오프라인이거나 네트워크 오류 시 캐시된 리소스 반환
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // HTML 탐색 요청인 경우 메인 index.html 반환
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});
