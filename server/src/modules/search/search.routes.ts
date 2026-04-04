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

    // Search patients — active admissions + recently discharged
    const [patients] = await db.execute<RowDataPacket[]>(
      `SELECT a.id, p.id AS patient_id, p.patient_code, p.full_name,
              a.admission_code, a.status, a.doctor_name,
              b.bed_code, r.room_code, r.name AS room_name
       FROM admissions a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN beds b ON a.bed_id = b.id
       LEFT JOIN rooms r ON b.room_id = r.id
       WHERE (p.full_name LIKE ? OR p.patient_code LIKE ? OR a.admission_code LIKE ? OR p.phone LIKE ?)
       ORDER BY FIELD(a.status, 'treating', 'admitted', 'waiting_discharge', 'discharged'), a.admitted_at DESC
       LIMIT 15`,
      [like, like, like, like]
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

// Search for readmission — includes discharged patients, returns patient-level data
router.get('/readmission', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) { res.json({ success: true, data: [] }); return; }
    const like = `%${q}%`;

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id AS patient_id, p.patient_code, p.full_name, p.date_of_birth,
              p.gender, p.phone, p.address, p.id_number, p.insurance_number,
              COUNT(a.id) AS total_admissions,
              MAX(a.discharged_at) AS last_discharged_at,
              (SELECT diagnosis FROM admissions WHERE patient_id = p.id ORDER BY id DESC LIMIT 1) AS last_diagnosis
       FROM patients p
       LEFT JOIN admissions a ON a.patient_id = p.id
       WHERE p.full_name LIKE ? OR p.patient_code LIKE ? OR p.phone LIKE ? OR p.id_number LIKE ?
       GROUP BY p.id
       ORDER BY MAX(a.admitted_at) DESC
       LIMIT 15`,
      [like, like, like, like]
    );

    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

export default router;
