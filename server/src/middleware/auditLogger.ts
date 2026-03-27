import { Request } from 'express';
import { db } from '../config/database';

/**
 * Ghi log hành động vào bảng audit_logs.
 * Chạy fire-and-forget (không block request).
 */
export function logAudit(
  req: Request,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: Record<string, unknown>
): void {
  const userId = req.user?.id || null;
  const ipAddress = req.ip || req.socket?.remoteAddress?.toString() || null;
  const userAgent = req.headers['user-agent'] || null;

  db.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress, userAgent]
  ).catch((err) => {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  });
}
