import axios from 'axios';
import firebaseAdmin from 'firebase-admin';

const firebaseAdminCred = {
    type: process.env.FIREBASE_CRED_TYPE,
    project_id: process.env.FIREBASE_CRED_PRODUCT_ID,
    private_key_id: process.env.FIREBASE_CRED_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_CRED_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CRED_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CRED_CLIENT_ID,
    auth_uri: process.env.FIREBASE_CRED_AUTH_URI,
    token_uri: process.env.FIREBASE_CRED_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_CRED_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CRED_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_CRED_UNIVERSE_DOMAIN,
};

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseAdminCred as firebaseAdmin.ServiceAccount),
});

const db = firebaseAdmin.firestore();

let usersCollection = db.collection('users');

const sendNotification = async (params: {
    userId: string;
    notificationType: 'CHAT' | 'ORDER' | 'NOTIFY_WHEN_AVAL' | 'Reminder';
    notificationTitle: string;
    notificationBody: string;
    extraData?: Object;
}) => {
    const { extraData, userId, notificationType, notificationTitle, notificationBody } = params;
    const token = (await usersCollection.doc(userId).get()).get('token');
    const url = 'https://fcm.googleapis.com/fcm/send';

    const headers = {
        'Content-Type': 'application/json',
        Authorization: process.env.FIREBASE_STORE_AUTH_TOKEN,
    };

    const body = {
        to: token,
        notification: {
            title: notificationTitle,
            body: notificationBody,
        },
        data: {
            type: notificationType,
            extraData,
        },
    };

    await axios.post(url, body, { headers });
};

const notificationUtil = {
    sendNotification,
};

export default notificationUtil;
