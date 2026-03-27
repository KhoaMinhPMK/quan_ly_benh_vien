import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) { res.json({ success: true, data: { patients: [], rooms: [], beds: [] } }); return; }
    const like = `%${q}%`;

    // Search patients by demographics + active admissions
    const [patients] = await db.execute<RowDataPacket[]>(
      `SELECT a.id, p.patient_code, p.full_name, a.admission_code, a.status
       FROM admissions a
       JOIN patients p ON a.patient_id = p.id
       WHERE (p.full_name LIKE ? OR p.patient_code LIKE ? OR a.admission_code LIKE ?)
       AND a.status IN ('admitted', 'treating', 'waiting_discharge')
       LIMIT 10`,
      [like, like, like]
    );
    const [rooms] = await db.execute<RowDataPacket[]>(
      `SELECT id, room_code, name FROM rooms WHERE name LIKE ? OR room_code LIKE ? LIMIT 10`,
      [like, like]
    );
    const [beds] = await db.execute<RowDataPacket[]>(
      `SELECT b.id, b.room_id, b.bed_code, r.room_code, r.name AS room_name FROM beds b JOIN rooms r ON b.room_id = r.id WHERE b.bed_code LIKE ? LIMIT 10`,
      [like]
    );

    res.json({ success: true, data: { patients, rooms, beds } });
  } catch (e) { next(e); }
});

export default router;
