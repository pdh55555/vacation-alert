// firebase-messaging-sw.js  — 백그라운드 푸시 수신용 (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBSk1iZF22x4XVibZYAZ1xaHQyehqIoHDM",
  authDomain: "dhu-leave-notify-db94c.firebaseapp.com",
  projectId: "dhu-leave-notify-db94c",
  storageBucket: "dhu-leave-notify-db94c.firebasestorage.app",
  messagingSenderId: "257549200977",
  appId: "1:257549200977:web:98074d868fab2d89af5270"
});

var messaging = firebase.messaging();

// 데이터 전용 메시지일 때 알림 표시
messaging.onBackgroundMessage(function(payload) {
  var n = (payload && payload.notification) || {};
  var data = (payload && payload.data) || {};
  var title = n.title || data.title || '휴가 알림';
  var options = {
    body: n.body || data.body || '새 결재 알림이 있습니다.',
    icon: '/vacation-alert/icons/icon-192.png',
    badge: '/vacation-alert/icons/icon-96.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: data
  };
  self.registration.showNotification(title, options);
});

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || 'https://pdh55555.github.io/vacation-alert/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) { if (list[i].url.indexOf('vacation-alert') > -1 && 'focus' in list[i]) return list[i].focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
