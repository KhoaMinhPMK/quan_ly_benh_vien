import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(authMiddleware);

// Get audit logs (admin only)
router.get('/', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { entity_type, user_id, from, to, action } = req.query;
    let sql = `SELECT al.*, u.full_name AS user_name
               FROM audit_logs al
               LEFT JOIN users u ON al.user_id = u.id
               WHERE 1=1`;
    const params: (string | number)[] = [];

    if (entity_type) { sql += ' AND al.entity_type = ?'; params.push(entity_type as string); }
    if (user_id) { sql += ' AND al.user_id = ?'; params.push(Number(user_id)); }
    if (action) { sql += ' AND al.action = ?'; params.push(action as string); }
    if (from) { sql += ' AND al.created_at >= ?'; params.push(from as string); }
    if (to) { sql += ' AND al.created_at <= ?'; params.push((to as string) + ' 23:59:59'); }

    sql += ' ORDER BY al.created_at DESC LIMIT 200';
    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// Audit summary/stats (#100)
router.get('/summary', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const [byAction] = await db.execute<RowDataPacket[]>(`
      SELECT action, COUNT(*) AS count
      FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY action ORDER BY count DESC
    `, [days]);

    const [byEntity] = await db.execute<RowDataPacket[]>(`
      SELECT entity_type, COUNT(*) AS count
      FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY entity_type ORDER BY count DESC
    `, [days]);

    const [byUser] = await db.execute<RowDataPacket[]>(`
      SELECT al.user_id, u.full_name, COUNT(*) AS count
      FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
      WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY al.user_id ORDER BY count DESC LIMIT 10
    `, [days]);

    const [byDay] = await db.execute<RowDataPacket[]>(`
      SELECT DATE(created_at) AS log_date, COUNT(*) AS count
      FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at) ORDER BY log_date
    `, [days]);

    res.json({ success: true, data: { by_action: byAction, by_entity: byEntity, by_user: byUser, by_day: byDay } });
  } catch (e) { next(e); }
});

export default router;
