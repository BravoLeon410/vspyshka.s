const webpush = require('web-push');

module.exports = async function (context) {
    webpush.setVapidDetails(
        'mailto:admin@vspyshka.ru',
        process.env.VAPID_PUBLIC,
        process.env.VAPID_PRIVATE
    );

    let body = context.req.bodyRaw || context.req.body || "{}";
    let data;
    try { data = JSON.parse(body); } catch (e) { data = context.req.body || {}; }

    const subscription = data.subscription;
    if (!subscription) {
        return context.res.json({ success: false, error: 'No subscription' });
    }

    try {
        const payload = JSON.stringify({
            title: `ВСПЫШКА: ${data.sender_name || 'Новое сообщение'}`,
            body: data.text,
            icon: 'https://bravoleon410.github.io/icon-192.png'
        });

        await webpush.sendNotification(JSON.parse(subscription), payload);
        return context.res.json({ success: true });
    } catch (error) {
        console.error("Ошибка пуша:", error);
        return context.res.json({ success: false, error: error.message });
    }
};
