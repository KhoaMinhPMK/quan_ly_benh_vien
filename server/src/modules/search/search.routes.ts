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

    const [patients] = await db.execute<RowDataPacket[]>(
      `SELECT id, patient_code, full_name, status FROM patients WHERE full_name LIKE ? OR patient_code LIKE ? LIMIT 10`,
      [like, like]
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
