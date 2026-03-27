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
  patient_id: number | null;
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
    p.id AS patient_id, p.full_name AS patient_name, p.patient_code,
    p.diagnosis, p.doctor_name, p.admitted_at, p.expected_discharge,
    p.status AS patient_status, p.date_of_birth, p.gender, p.phone,
    DATEDIFF(NOW(), p.admitted_at) AS days_admitted
  FROM beds b
  JOIN rooms r ON b.room_id = r.id
  LEFT JOIN patients p ON p.bed_id = b.id AND p.status IN ('admitted', 'treating', 'waiting_discharge')
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

export async function assignBed(bedId: number, patientId: number, performedBy?: number) {
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

    // Release patient from current bed (if any)
    const [currentPatient] = await conn.execute<RowDataPacket[]>(
      'SELECT bed_id FROM patients WHERE id = ? FOR UPDATE',
      [patientId]
    );
    if (currentPatient.length > 0 && currentPatient[0].bed_id) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', currentPatient[0].bed_id]);
    }

    // Assign new bed
    await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['occupied', bedId]);
    await conn.execute('UPDATE patients SET bed_id = ? WHERE id = ?', [bedId, patientId]);

    // Log history
    await conn.execute(
      'INSERT INTO bed_history (patient_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
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

    // Get patient on this bed (lock patient row too)
    const [patients] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM patients WHERE bed_id = ? AND status IN (?, ?, ?) FOR UPDATE',
      [bedId, 'admitted', 'treating', 'waiting_discharge']
    );

    if (patients.length > 0) {
      const patientId = patients[0].id;
      await conn.execute('UPDATE patients SET bed_id = NULL WHERE id = ?', [patientId]);
      await conn.execute(
        'INSERT INTO bed_history (patient_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
        [patientId, bedId, 'release', performedBy || null]
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
