import { Request, Response, NextFunction } from 'express';

/**
 * RBAC Middleware — restricts access to users with specified roles.
 * Usage: router.get('/admin-only', rbacMiddleware(['admin']), handler);
 */
export function rbacMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này' } });
      return;
    }

    next();
  };
}
