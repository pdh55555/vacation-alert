// ============================================================
// Service Worker — 휴가 알림 웹앱
// 역할: 백그라운드 웹푸시 수신 + 알림 클릭 시 딥링크 이동
// ============================================================

var CACHE_NAME = 'vacation-alert-v1';
var DEEP_LINK  = 'https://m.site.naver.com/25PFE';

// ── 설치: 핵심 파일 캐시 ──
self.addEventListener('install', function(e) {
  console.log('[SW] 설치');
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(['/', '/index.html', '/manifest.json', '/icons/icon-192.png']);
    })
  );
  self.skipWaiting();
});

// ── 활성화: 이전 캐시 정리 ──
self.addEventListener('activate', function(e) {
  console.log('[SW] 활성���');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// ── 네트워크 요청: 캐시 우선 ──
self.addEventListener('fetch', function(e) {
  // GAS API 호출은 캐시 제외 (항상 최신 데이터)
  if (e.request.url.indexOf('script.google.com') !== -1) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() { return cached; });
    })
  );
});

// ── 푸시 수신: 백그라운드 알림 표시 ──
self.addEventListener('push', function(e) {
  console.log('[SW] 푸시 수신');

  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (err) {
    data = { title: '휴가 알림', body: e.data ? e.data.text() : '' };
  }

  var title   = data.notification ? data.notification.title : (data.title || '휴가 알림');
  var body    = data.notification ? data.notification.body  : (data.body  || '');
  var url     = (data.data && data.data.url) ? data.data.url : DEEP_LINK;

  var options = {
    body: body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: url },
    requireInteraction: false,
    // Android 진동 패턴
    vibrate: [200, 100, 200]
  };

  console.log('[SW] 알림 표시:', title, body);
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── 알림 클릭: 딥링크 이동 ──
self.addEventListener('notificationclick', function(e) {
  console.log('[SW] 알림 클릭');
  e.notification.close();

  var targetUrl = (e.notification.data && e.notification.data.url) ? e.notification.data.url : DEEP_LINK;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // 이미 열린 창이 있으면 포커스
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
