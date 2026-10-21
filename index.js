const sdk = require('node-appwrite');
const webpush = require('web-push');

module.exports = async function (context) {
    console.log("=== НАЧАЛО РАБОТЫ ФУНКЦИИ ===");
    
    // Инициализация
    const client = new sdk.Client();
    client
        .setEndpoint('https://fra.cloud.appwrite.io/v1')
        .setProject('6a0ad8400006365730b5')
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    webpush.setVapidDetails(
        'mailto:admin@vspyshka.ru',
        process.env.VAPID_PUBLIC,
        process.env.VAPID_PRIVATE
    );

    // Получаем данные (Appwrite передает их по-разному в зависимости от типа запроса)
    const body = context.req.bodyRaw || context.req.body || "{}";
    console.log("Получены данные:", body);
    
    let data;
    try {
        data = JSON.parse(body);
    } catch (e) {
        data = context.req.body || {};
    }

    const receiverId = data.receiver_id;
    console.log("ID получателя:", receiverId);

    if (!receiverId) {
        console.log("ОШИБКА: ID получателя не найден");
        return context.res.json({ success: false, error: 'No receiver' });
    }

    try {
        console.log("Ищем пользователя в базе...");
        const userDoc = await databases.getDocument('6a0adb260034b853e4b8', 'users', receiverId);
        console.log("Пользователь найден. Подписка:", userDoc.push_subscription ? "ЕСТЬ" : "ПУСТАЯ");
        
        if (!userDoc || !userDoc.push_subscription) {
            return context.res.json({ success: false, error: 'User has no subscription' });
        }

        const subscription = JSON.parse(userDoc.push_subscription);
        const payload = JSON.stringify({
            title: `ВСПЫШКА: ${data.sender_name || 'Новое сообщение'}`,
            body: data.text,
            icon: 'https://bravoleon410.github.io/icon-192.png'
        });

        console.log("Отправляем пуш...");
        await webpush.sendNotification(subscription, payload);
        console.log("Пуш успешно отправлен!");
        return context.res.json({ success: true });

    } catch (error) {
        console.error("ОШИБКА ОТПРАВКИ:", error);
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log("Подписка устарела, удаляем...");
            await databases.updateDocument('6a0adb260034b853e4b8', 'users', receiverId, { push_subscription: null });
        }
        return context.res.json({ success: false, error: error.message });
    }
};
