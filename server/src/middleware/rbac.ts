import { Request, Response, NextFunction } from 'express';

/**
 * RBAC Middleware — restricts access to users with specified roles.
 * Usage: router.get('/admin-only', rbacMiddleware(['admin']), handler);
 */
export function rbacMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chua xac thuc' } });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Ban khong co quyen thuc hien thao tac nay' } });
      return;
    }

    next();
  };
}
