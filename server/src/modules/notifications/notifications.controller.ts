import { Request, Response, NextFunction } from 'express';
import * as svc from './notifications.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await svc.getNotifications(req.user!.id, Number(req.query.limit) || 20);
    res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await svc.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (e) { next(e); }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.markAsRead(Number(req.params.id));
    res.json({ success: true });
  } catch (e) { next(e); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await svc.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (e) { next(e); }
}

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { subscription } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    if (!subscription) {
      res.status(400).json({ success: false, error: 'Subscription object missing' });
      return;
    }
    await svc.registerPushSubscription(req.user!.id, subscription, userAgent);
    res.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (e) { next(e); }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ success: false, error: 'Endpoint missing' });
      return;
    }
    await svc.unregisterPushSubscription(endpoint);
    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (e) { next(e); }
}

export async function getVapidPublicKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = process.env.VAPID_PUBLIC_KEY || 'BLA1y4B_H6mC2Q03hR_sU6JcEvN4b2Rz2L7Q4d8T_t7e7J4z1V0P9z_q5Q3C4W_l3L1u2k_h_m_C_Q_3_h_R_';
    res.json({ success: true, data: { publicKey: key } });
  } catch (e) { next(e); }
}
