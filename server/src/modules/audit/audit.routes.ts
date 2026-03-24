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
    const { entity_type, user_id, from, to } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: (string | number)[] = [];

    if (entity_type) { sql += ' AND entity_type = ?'; params.push(entity_type as string); }
    if (user_id) { sql += ' AND user_id = ?'; params.push(Number(user_id)); }
    if (from) { sql += ' AND created_at >= ?'; params.push(from as string); }
    if (to) { sql += ' AND created_at <= ?'; params.push((to as string) + ' 23:59:59'); }

    sql += ' ORDER BY created_at DESC LIMIT 100';
    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

export default router;
