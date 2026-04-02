import { Request, Response, NextFunction } from 'express';
import { getEffectiveAccess } from '../modules/access/access.resolver';
import type { EffectiveAccess } from '../../../shared/types/access';

// Extend Express Request to carry effective access
declare global {
  namespace Express {
    interface Request {
      access?: EffectiveAccess;
    }
  }
}

/**
 * Middleware that checks whether the user has a specific capability.
 * Also populates req.access for downstream use.
 *
 * Usage: router.post('/discharge', requireCapability('discharge.approve'), handler)
 */
export function requireCapability(capabilityKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Chưa xác thực' } });
      return;
    }

    try {
      // Load or use cached effective access
      if (!req.access) {
        req.access = await getEffectiveAccess(req.user.id);
      }

      // Check module first
      const moduleKey = capabilityKey.split('.')[0];
      if (req.access.modules[moduleKey] === false) {
        res.status(403).json({ success: false, error: { code: 'MODULE_DISABLED', message: `Module "${moduleKey}" chưa được bật` } });
        return;
      }

      // Check capability
      const cap = req.access.capabilities[capabilityKey];
      if (!cap || cap.effect !== 'allow') {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: `Bạn không có quyền: ${capabilityKey}` } });
        return;
      }

      next();
    } catch {
      res.status(500).json({ success: false, error: { code: 'ACCESS_ERROR', message: 'Lỗi kiểm tra quyền' } });
    }
  };
}

/**
 * Middleware that loads effective access onto req.access without blocking.
 * Useful for optional capability checks in handlers.
 */
export async function loadAccess(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (req.user && !req.access) {
    try {
      req.access = await getEffectiveAccess(req.user.id);
    } catch { /* non-blocking */ }
  }
  next();
}
