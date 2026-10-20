self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

// Слушатель push (чтобы Android не "убивал" воркер)
self.addEventListener('push', function(event) {
    let data = { title: 'ВСПЫШКА', body: 'Новое сообщение' };
    if (event.data) {
        try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
    }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'vspishka-msg',
            renotify: true
        })
    );
});

// Обработка сообщений от основного приложения
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, {
                body: body,
                icon: icon || 'icon-192.png',
                badge: 'icon-192.png',
                vibrate: [200, 100, 200],
                tag: 'vspishka-msg',
                renotify: true,
                requireInteraction: false
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('./');
        })
    );
});