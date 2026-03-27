import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface BedRow extends RowDataPacket {
  id: number;
  bed_code: string;
  room_id: number;
  room_code: string;
  room_name: string;
  status: string;
  notes: string;
  patient_id: number | null; // This is now admission_id to frontend
  patient_name: string | null;
  patient_code: string | null;
  diagnosis: string | null;
  doctor_name: string | null;
  admitted_at: string | null;
  expected_discharge: string | null;
  patient_status: string | null;
  days_admitted: number | null;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
}

const BED_SELECT_SQL = `
  SELECT b.*, r.room_code, r.name AS room_name,
    a.id AS patient_id, p.full_name AS patient_name, p.patient_code,
    a.diagnosis, a.doctor_name, a.admitted_at, a.expected_discharge,
    a.status AS patient_status, p.date_of_birth, p.gender, p.phone,
    DATEDIFF(NOW(), a.admitted_at) AS days_admitted
  FROM beds b
  JOIN rooms r ON b.room_id = r.id
  LEFT JOIN admissions a ON a.bed_id = b.id AND a.status IN ('admitted', 'treating', 'waiting_discharge')
  LEFT JOIN patients p ON a.patient_id = p.id
`;

export async function getBedsByRoom(roomId: number) {
  const [rows] = await db.execute<BedRow[]>(
    `${BED_SELECT_SQL} WHERE b.room_id = ? ORDER BY b.bed_code`,
    [roomId]
  );
  return rows;
}

export async function getBedById(id: number) {
  const [rows] = await db.execute<BedRow[]>(
    `${BED_SELECT_SQL} WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createBed(data: { bed_code: string; room_id: number; notes?: string }) {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO beds (bed_code, room_id, notes) VALUES (?, ?, ?)',
    [data.bed_code, data.room_id, data.notes || null]
  );
  return getBedById(result.insertId);
}

export async function updateBedStatus(id: number, status: string, notes?: string) {
  await db.execute('UPDATE beds SET status = ?, notes = COALESCE(?, notes) WHERE id = ?', [status, notes || null, id]);
  return getBedById(id);
}

export async function assignBed(bedId: number, patientId: number /* maps to admission_id */, performedBy?: number) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the target bed row and verify it's still empty
    const [lockedBeds] = await conn.execute<RowDataPacket[]>(
      'SELECT id, status FROM beds WHERE id = ? FOR UPDATE',
      [bedId]
    );
    if (lockedBeds.length === 0) {
      throw Object.assign(new Error('Giường không tồn tại'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    if (lockedBeds[0].status !== 'empty') {
      throw Object.assign(new Error('Giường đã được sử dụng hoặc bị khoá'), { statusCode: 409, code: 'BED_OCCUPIED' });
    }

    // Release admission from current bed (if any)
    const [currentAdmission] = await conn.execute<RowDataPacket[]>(
      'SELECT bed_id FROM admissions WHERE id = ? FOR UPDATE',
      [patientId] // Here patientId variable actually holds admission_id
    );
    if (currentAdmission.length > 0 && currentAdmission[0].bed_id) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', currentAdmission[0].bed_id]);
    }

    // Assign new bed
    await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['occupied', bedId]);
    await conn.execute('UPDATE admissions SET bed_id = ? WHERE id = ?', [bedId, patientId]);

    // Log history
    await conn.execute(
      'INSERT INTO admission_bed_history (admission_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
      [patientId, bedId, 'assign', performedBy || null]
    );

    await conn.commit();
    return getBedById(bedId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function releaseBed(bedId: number, performedBy?: number) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock bed row
    await conn.execute<RowDataPacket[]>('SELECT id FROM beds WHERE id = ? FOR UPDATE', [bedId]);

    // Get admission on this bed (lock row too)
    const [admissions] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM admissions WHERE bed_id = ? AND status IN (?, ?, ?) FOR UPDATE',
      [bedId, 'admitted', 'treating', 'waiting_discharge']
    );

    if (admissions.length > 0) {
      const admissionId = admissions[0].id;
      await conn.execute('UPDATE admissions SET bed_id = NULL WHERE id = ?', [admissionId]);
      await conn.execute(
        'INSERT INTO admission_bed_history (admission_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
        [admissionId, bedId, 'release', performedBy || null]
      );
    }

    await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', bedId]);

    await conn.commit();
    return getBedById(bedId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
