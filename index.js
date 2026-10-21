const sdk = require('node-appwrite');
const webpush = require('web-push');

module.exports = async function (context) {
    const client = new sdk.Client();
    client
        .setEndpoint('https://fra.cloud.appwrite.io/v1')
        .setProject('6a0ad8400006365730b5')
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    webpush.setVapidDetails(
        'mailto:admin@vspyshka.ru', // Можете поменять на свой email
        process.env.VAPID_PUBLIC,
        process.env.VAPID_PRIVATE
    );

    const message = context.req.body; 
    const receiverId = message.receiver_id;

    if (!receiverId) return context.res.json({ success: false, error: 'No receiver' });

    try {
        const userDoc = await databases.getDocument('6a0adb260034b853e4b8', 'users', receiverId);
        
        if (!userDoc || !userDoc.push_subscription) {
            return context.res.json({ success: false, error: 'User has no subscription' });
        }

        const subscription = JSON.parse(userDoc.push_subscription);
        const payload = JSON.stringify({
            title: `ВСПЫШКА: ${message.sender_name || 'Новое сообщение'}`,
            body: message.text,
            icon: 'https://bravoleon410.github.io/icon-192.png'
        });

        await webpush.sendNotification(subscription, payload);
        return context.res.json({ success: true });

    } catch (error) {
        console.error(error);
        if (error.statusCode === 410 || error.statusCode === 404) {
            await databases.updateDocument('6a0adb260034b853e4b8', 'users', receiverId, { push_subscription: null });
        }
        return context.res.json({ success: false, error: error.message });
    }
};
