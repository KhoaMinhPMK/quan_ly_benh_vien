import webpush from 'web-push';
import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

// Use env variables or generate ones for development
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BLA1y4B_H6mC2Q03hR_sU6JcEvN4b2Rz2L7Q4d8T_t7e7J4z1V0P9z_q5Q3C4W_l3L1u2k_h_m_C_Q_3_h_R_';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '2L7Q4d8T_t7e7J4z1V0P9z_q5Q3C4W_l3L1u2k_h_m_C_Q_3_h_R_';

export function initWebPush() {
  if (!process.env.VAPID_PUBLIC_KEY) {
    console.warn("WARNING: Using default VAPID keys. For production, please generate your own keys and set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env");
    // Generate a pair for development if not provided
    const vapidKeys = webpush.generateVAPIDKeys();
    console.log("Here is a newly generated VAPID Key pair for your .env:");
    console.log("VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
    console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
    
    webpush.setVapidDetails(
      'mailto:admin@medboard.vn',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } else {
    webpush.setVapidDetails(
      'mailto:admin@medboard.vn',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY || ''
    );
  }
}

export async function saveSubscription(userId: number, subscription: any, userAgent: string) {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new Error('Invalid subscription format');
  }

  // Check if exists
  const [existing] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM push_subscriptions WHERE endpoint = ?',
    [endpoint]
  );

  if (existing.length > 0) {
    await db.execute(
      'UPDATE push_subscriptions SET user_id = ?, keys_p256dh = ?, keys_auth = ?, user_agent = ? WHERE endpoint = ?',
      [userId, keys.p256dh, keys.auth, userAgent, endpoint]
    );
  } else {
    await db.execute(
      'INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth, user_agent) VALUES (?, ?, ?, ?, ?)',
      [userId, endpoint, keys.p256dh, keys.auth, userAgent]
    );
  }
}

export async function deleteSubscription(endpoint: string) {
  await db.execute('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
}

export async function sendPushNotification(userId: number, payload: { title: string; body: string; data?: any }) {
  // Get all active subscriptions for this user
  const [subscriptions] = await db.execute<RowDataPacket[]>(
    'SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );
  
  if (!subscriptions || subscriptions.length === 0) {
    return; // No devices registered for this user
  }

  const notificationPayload = JSON.stringify({
    notification: {
      title: payload.title,
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/icons.svg',
      data: payload.data,
      vibrate: [200, 100, 200, 100, 200, 100, 200],
    }
  });

  const promises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth
      }
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationPayload);
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        // The subscription has expired or is no longer valid
        console.log('Subscription has expired or is no longer valid, removing endpoint:', sub.endpoint);
        await deleteSubscription(sub.endpoint);
      } else {
        console.error('Error sending push notification:', error);
      }
    }
  });

  await Promise.allSettled(promises);
}
