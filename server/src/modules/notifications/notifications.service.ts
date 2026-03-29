import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { saveSubscription, deleteSubscription, sendPushNotification } from './push.service';

export async function getNotifications(userId: number, limit = 20) {
  const safeLimit = parseInt(String(limit), 10);
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT * FROM notifications 
     WHERE target_user_id = ? OR target_user_id IS NULL
     ORDER BY created_at DESC LIMIT ${safeLimit}`,
    [userId]
  );
  return rows;
}

export async function getUnreadCount(userId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM notifications 
     WHERE (target_user_id = ? OR target_user_id IS NULL) AND is_read = FALSE`,
    [userId]
  );
  return rows[0]?.count || 0;
}

export async function markAsRead(id: number) {
  await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
}

export async function markAllAsRead(userId: number) {
  await db.execute(
    'UPDATE notifications SET is_read = TRUE WHERE (target_user_id = ? OR target_user_id IS NULL) AND is_read = FALSE',
    [userId]
  );
}

export async function createNotification(data: {
  type: string; title: string; message?: string;
  target_user_id?: number; target_role?: string;
  reference_type?: string; reference_id?: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO notifications (type, title, message, target_user_id, target_role, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.type, data.title, data.message || null, data.target_user_id || null,
     data.target_role || null, data.reference_type || null, data.reference_id || null]
  );
  
  if (data.target_user_id) {
    // Fire and forget push notification
    sendPushNotification(data.target_user_id, {
      title: data.title,
      body: data.message || '',
      data: {
        url: '/',
        reference_type: data.reference_type,
        reference_id: data.reference_id
      }
    }).catch(err => console.error('Failed to send push notification', err));
  }

  return { id: result.insertId, ...data };
}

export async function registerPushSubscription(userId: number, subscription: any, userAgent: string) {
  return saveSubscription(userId, subscription, userAgent);
}

export async function unregisterPushSubscription(endpoint: string) {
  return deleteSubscription(endpoint);
}
