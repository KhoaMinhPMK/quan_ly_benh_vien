import { Request, Response, NextFunction } from 'express';

/**
 * Data-scope middleware — injects `req.dataScope` based on the authenticated user.
 * Admin users see all data (departmentId = undefined).
 * Other roles are scoped to their own department.
 */
export interface DataScope {
  departmentId: number | undefined;
  userId: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      dataScope?: DataScope;
    }
  }
}

export function dataScopeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next();
    return;
  }

  const isAdmin = req.user.role === 'admin';

  req.dataScope = {
    departmentId: isAdmin ? undefined : (req.user.departmentId ?? undefined),
    userId: req.user.id,
    role: req.user.role,
  };

  next();
}
