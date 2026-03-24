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
}

export async function getBedsByRoom(roomId: number) {
  const [rows] = await db.execute<BedRow[]>(
    `SELECT b.*, r.room_code, r.name AS room_name,
      p.id AS patient_id, p.full_name AS patient_name, p.patient_code
    FROM beds b
    JOIN rooms r ON b.room_id = r.id
    LEFT JOIN patients p ON p.bed_id = b.id AND p.status IN ('admitted', 'treating', 'waiting_discharge')
    WHERE b.room_id = ?
    ORDER BY b.bed_code`,
    [roomId]
  );
  return rows;
}

export async function getBedById(id: number) {
  const [rows] = await db.execute<BedRow[]>(
    `SELECT b.*, r.room_code, r.name AS room_name,
      p.id AS patient_id, p.full_name AS patient_name, p.patient_code
    FROM beds b
    JOIN rooms r ON b.room_id = r.id
    LEFT JOIN patients p ON p.bed_id = b.id AND p.status IN ('admitted', 'treating', 'waiting_discharge')
    WHERE b.id = ?`,
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

    // Release patient from current bed
    await conn.execute('UPDATE beds SET status = ? WHERE id IN (SELECT bed_id FROM patients WHERE id = ? AND bed_id IS NOT NULL)', ['empty', patientId]);

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

    // Get patient on this bed
    const [patients] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM patients WHERE bed_id = ? AND status IN (?, ?, ?)',
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
