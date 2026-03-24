import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();
router.use(authMiddleware);

// Get all config
router.get('/', rbacMiddleware(['admin']), async (_req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM system_config ORDER BY config_key');
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// Update config
router.put('/:key', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { value } = req.body;
    await db.execute('UPDATE system_config SET config_value = ? WHERE config_key = ?', [value, req.params.key]);
    res.json({ success: true, message: 'Da cap nhat cau hinh' });
  } catch (e) { next(e); }
});

// Get departments (for admin management)
router.get('/departments', async (_req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM departments WHERE is_active = TRUE ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// CRUD departments
router.post('/departments', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Ten va ma khoa bat buoc' } }); return; }
    const [result] = await db.execute<ResultSetHeader>('INSERT INTO departments (name, code, description) VALUES (?, ?, ?)', [name, code, description || null]);
    res.status(201).json({ success: true, data: { id: result.insertId, name, code } });
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') { res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Ma khoa da ton tai' } }); return; }
    next(e);
  }
});

router.put('/departments/:id', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;
    const fields: string[] = [];
    const params: (string | number | boolean)[] = [];
    if (name) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (fields.length === 0) { res.json({ success: true }); return; }
    params.push(Number(req.params.id));
    await db.execute(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Da cap nhat' });
  } catch (e) { next(e); }
});

// Get checklist templates (for config)
router.get('/checklist-templates', async (_req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM checklist_templates ORDER BY sort_order');
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/checklist-templates', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { name, description, sort_order } = req.body;
    if (!name) { res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Ten muc bat buoc' } }); return; }
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO checklist_templates (name, description, sort_order) VALUES (?, ?, ?)',
      [name, description || null, sort_order || 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name } });
  } catch (e) { next(e); }
});

router.put('/checklist-templates/:id', rbacMiddleware(['admin']), async (req, res, next) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    const fields: string[] = [];
    const params: (string | number | boolean)[] = [];
    if (name) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); params.push(sort_order); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (fields.length === 0) { res.json({ success: true }); return; }
    params.push(Number(req.params.id));
    await db.execute(`UPDATE checklist_templates SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Da cap nhat' });
  } catch (e) { next(e); }
});

export default router;
