import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserInfo } from '../../../shared/types/auth';
import { db } from '../config/database';
import { RowDataPacket } from 'mysql2';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

const userCache = new Map<number, { isActive: boolean, role: string, exp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token không được cung cấp' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as UserInfo;
    const now = Date.now();
    
    let cacheStatus = userCache.get(decoded.id);
    if (!cacheStatus || cacheStatus.exp < now) {
      const [rows] = await db.execute<RowDataPacket[]>('SELECT is_active, role FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) {
        throw new Error('User not found');
      }
      cacheStatus = { isActive: Boolean(rows[0].is_active), role: rows[0].role, exp: now + CACHE_TTL };
      userCache.set(decoded.id, cacheStatus);
    }

    if (!cacheStatus.isActive) {
      res.status(403).json({ success: false, error: { code: 'USER_INACTIVE', message: 'Tài khoản đã bị vô hiệu hoá' } });
      return;
    }

    req.user = { ...decoded, role: cacheStatus.role as any }; // Update role with latest from DB
    next();
  } catch (err: any) {
    if (err.message === 'User not found') {
      res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Tài khoản không tồn tại' } });
    } else {
      res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Token không hợp lệ hoặc đã hết hạn' } });
    }
  }
}
