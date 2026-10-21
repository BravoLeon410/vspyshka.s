self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

// Обработка пуша от сервера
self.addEventListener('push', function(event) {
    let data = { title: 'ВСПЫШКА', body: 'Новое сообщение' };
    if (event.data) {
        try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'https://bravoleon410.github.io/icon-192.png',
            badge: 'https://bravoleon410.github.io/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'vspishka-msg',
            renotify: true
        })
    );
});

// Клик по уведомлению
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
