import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { rbacMiddleware } from '../../middleware/rbac';
import { dataScopeMiddleware } from '../../middleware/dataScope';
import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import * as ctrl from './patients.controller';

const router = Router();
router.use(authMiddleware);
router.use(dataScopeMiddleware);

router.get('/', ctrl.list);
router.get('/discharge-list', ctrl.dischargeList);
router.get('/waiting-queue', ctrl.waitingQueue);
router.get('/:id', ctrl.getById);
router.post('/', rbacMiddleware(['admin', 'doctor', 'nurse']), ctrl.create);
router.put('/:id', rbacMiddleware(['admin', 'doctor', 'nurse']), ctrl.update);
router.post('/:id/discharge', rbacMiddleware(['admin', 'doctor']), ctrl.discharge);
router.get('/:id/checklists', ctrl.getChecklists);
router.post('/:id/checklists/toggle', ctrl.toggleChecklist);

// ── Patient/Admission Notes (#36) ──
router.get('/:id/notes', async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT pn.*, u.full_name AS created_by_name
       FROM patient_notes pn
       LEFT JOIN users u ON pn.created_by = u.id
       WHERE pn.admission_id = ?
       ORDER BY pn.created_at DESC`,
      [admissionId]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/:id/notes', async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);
    const { content, note_type } = req.body;
    if (!content) { res.status(422).json({ success: false, error: { message: 'Nội dung ghi chú bắt buộc' } }); return; }
    await db.execute<ResultSetHeader>(
      'INSERT INTO patient_notes (admission_id, content, note_type, created_by) VALUES (?, ?, ?, ?)',
      [admissionId, content, note_type || 'general', req.user?.id || null]
    );
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT pn.*, u.full_name AS created_by_name FROM patient_notes pn LEFT JOIN users u ON pn.created_by = u.id WHERE pn.admission_id = ? ORDER BY pn.created_at DESC`,
      [admissionId]
    );
    res.status(201).json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// ── Checklist review history (#48) ──
router.get('/:id/checklist-history', async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT crh.*, ct.name AS checklist_name, u.full_name AS reviewed_by_name
       FROM checklist_review_history crh
       JOIN checklist_templates ct ON crh.checklist_template_id = ct.id
       JOIN users u ON crh.reviewed_by = u.id
       WHERE crh.admission_id = ?
       ORDER BY crh.created_at DESC`,
      [admissionId]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// ── Transfer/movement history (#34) ──
router.get('/:id/transfer-history', async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT abh.*, b.bed_code, r.room_code, r.name AS room_name,
         u.full_name AS performed_by_name
       FROM admission_bed_history abh
       JOIN beds b ON abh.bed_id = b.id
       JOIN rooms r ON b.room_id = r.id
       LEFT JOIN users u ON abh.performed_by = u.id
       WHERE abh.admission_id = ?
       ORDER BY abh.created_at DESC`,
      [admissionId]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

export default router;
