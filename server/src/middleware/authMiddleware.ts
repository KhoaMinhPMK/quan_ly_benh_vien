import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserInfo } from '../../../shared/types/auth';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token không được cung cấp',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as UserInfo;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Token không hợp lệ hoặc đã hết hạn',
      },
    });
  }
}
