self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Обработка пуш-уведомлений (если придут с сервера)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Обработка сообщений из самого приложения (наш случай)
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const options = {
            body: event.data.body,
            icon: event.data.icon || 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200],
            data: { url: self.location.origin }
        };
        event.waitUntil(
            self.registration.showNotification(event.data.title, options)
        );
    }
});

// Клик по уведомлению (открывает приложение)
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});