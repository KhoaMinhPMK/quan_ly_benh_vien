import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();
router.use(authMiddleware);

// ── QR Code generation (#96) ──

router.get('/:entityType/:entityId', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    if (!['room', 'bed'].includes(entityType)) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Loại không hợp lệ' } });
      return;
    }

    // Check if QR exists
    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM qr_codes WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );

    if (existing.length > 0) {
      res.json({ success: true, data: existing[0] });
      return;
    }

    // Auto-create QR data
    const baseUrl = process.env.APP_URL || 'https://medboard.app';
    const qrData = `${baseUrl}/${entityType === 'room' ? 'rooms' : 'rooms'}/${entityId}`;

    await db.execute<ResultSetHeader>(
      'INSERT INTO qr_codes (entity_type, entity_id, qr_data) VALUES (?, ?, ?)',
      [entityType, Number(entityId), qrData]
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM qr_codes WHERE entity_type = ? AND entity_id = ?',
      [entityType, Number(entityId)]
    );

    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
});

// Batch generate QR codes for all rooms/beds
router.post('/batch/:entityType', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const baseUrl = process.env.APP_URL || 'https://medboard.app';

    if (entityType === 'room') {
      const [rooms] = await db.execute<RowDataPacket[]>('SELECT id, room_code FROM rooms WHERE status = "active"');
      for (const r of rooms) {
        const qrData = `${baseUrl}/rooms/${r.id}`;
        await db.execute(
          'INSERT INTO qr_codes (entity_type, entity_id, qr_data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qr_data = VALUES(qr_data)',
          ['room', r.id, qrData]
        );
      }
      res.json({ success: true, message: `Đã tạo QR cho ${rooms.length} phòng` });
    } else if (entityType === 'bed') {
      const [beds] = await db.execute<RowDataPacket[]>('SELECT b.id, b.bed_code, b.room_id FROM beds b JOIN rooms r ON b.room_id = r.id WHERE r.status = "active"');
      for (const b of beds) {
        const qrData = `${baseUrl}/rooms/${b.room_id}?bed=${b.id}`;
        await db.execute(
          'INSERT INTO qr_codes (entity_type, entity_id, qr_data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qr_data = VALUES(qr_data)',
          ['bed', b.id, qrData]
        );
      }
      res.json({ success: true, message: `Đã tạo QR cho ${beds.length} giường` });
    } else {
      res.status(400).json({ success: false, error: { message: 'Loại không hợp lệ' } });
    }
  } catch (e) { next(e); }
});

// ── Dashboard widget config (#69) ──

router.get('/dashboard-widgets', async (_req, res, next) => {
  try {
    const [widgets] = await db.execute<RowDataPacket[]>('SELECT * FROM dashboard_widgets ORDER BY default_order');
    res.json({ success: true, data: widgets });
  } catch (e) { next(e); }
});

router.get('/dashboard-widgets/user', async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 0;
    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT dw.*, COALESCE(dwc.is_visible, dw.default_enabled) AS is_visible,
        COALESCE(dwc.sort_order, dw.default_order) AS sort_order,
        dwc.settings
      FROM dashboard_widgets dw
      LEFT JOIN dashboard_widget_config dwc ON dwc.widget_id = dw.id AND dwc.user_id = ?
      ORDER BY sort_order
    `, [userId]);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.put('/dashboard-widgets/user/:widgetId', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const widgetId = Number(req.params.widgetId);
    const { is_visible, sort_order, settings } = req.body;

    await db.execute(`
      INSERT INTO dashboard_widget_config (widget_id, user_id, is_visible, sort_order, settings)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_visible = VALUES(is_visible), sort_order = VALUES(sort_order), settings = VALUES(settings)
    `, [widgetId, userId, is_visible !== false ? 1 : 0, sort_order || 0, settings ? JSON.stringify(settings) : null]);

    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
