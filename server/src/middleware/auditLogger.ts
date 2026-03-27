import { db } from '../config/database';

/**
 * Ghi log hành động vào bảng audit_logs.
 * Chạy fire-and-forget (không block request).
 */
export function logAudit(
  userId: number | undefined,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: Record<string, unknown>
): void {
  db.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
    [userId || null, action, entityType, entityId, details ? JSON.stringify(details) : null]
  ).catch((err) => {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  });
}
