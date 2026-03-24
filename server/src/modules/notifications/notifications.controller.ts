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
