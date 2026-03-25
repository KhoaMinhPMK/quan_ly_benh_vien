import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ---- Transfer bed (same room or cross-room) ----
export async function transferBed(
  patientId: number,
  targetBedId: number,
  performedBy?: number,
  notes?: string
) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check target bed is empty
    const [targetRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id, status, room_id FROM beds WHERE id = ?',
      [targetBedId]
    );
    if (targetRows.length === 0) throw Object.assign(new Error('Giường đích không tồn tại'), { statusCode: 404 });
    if (targetRows[0].status !== 'empty') throw Object.assign(new Error('Giường đích đang sử dụng hoặc bị khoá'), { statusCode: 409 });

    // Get current bed
    const [patientRows] = await conn.execute<RowDataPacket[]>(
      'SELECT bed_id FROM patients WHERE id = ? AND status IN (?, ?, ?)',
      [patientId, 'admitted', 'treating', 'waiting_discharge']
    );
    if (patientRows.length === 0) throw Object.assign(new Error('Bệnh nhân không tồn tại hoặc đã ra viện'), { statusCode: 404 });

    const oldBedId = patientRows[0].bed_id;

    // Release old bed
    if (oldBedId) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', oldBedId]);
      await conn.execute(
        'INSERT INTO bed_history (patient_id, bed_id, action, performed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [patientId, oldBedId, 'release', performedBy || null, notes || 'Chuyển giường']
      );
    }

    // Assign new bed
    await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['occupied', targetBedId]);
    await conn.execute('UPDATE patients SET bed_id = ? WHERE id = ?', [targetBedId, patientId]);
    await conn.execute(
      'INSERT INTO bed_history (patient_id, bed_id, action, performed_by, notes) VALUES (?, ?, ?, ?, ?)',
      [patientId, targetBedId, 'transfer', performedBy || null, notes || null]
    );

    await conn.commit();
    return { success: true, old_bed_id: oldBedId, new_bed_id: targetBedId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// ---- Get available (empty) beds ----
export async function getAvailableBeds(filters?: { department_id?: number; room_id?: number }) {
  let sql = `
    SELECT b.id, b.bed_code, b.room_id, r.room_code, r.name AS room_name, r.floor, d.name AS department_name
    FROM beds b
    JOIN rooms r ON b.room_id = r.id
    JOIN departments d ON r.department_id = d.id
    WHERE b.status = 'empty' AND r.status = 'active'
  `;
  const params: (string | number)[] = [];

  if (filters?.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }
  if (filters?.room_id) {
    sql += ' AND b.room_id = ?';
    params.push(filters.room_id);
  }

  sql += ' ORDER BY d.name, r.room_code, b.bed_code';

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

// ---- Get bed history ----
export async function getBedHistory(bedId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT bh.*, p.full_name AS patient_name, p.patient_code,
       b.bed_code, u.full_name AS performed_by_name
     FROM bed_history bh
     JOIN patients p ON bh.patient_id = p.id
     JOIN beds b ON bh.bed_id = b.id
     LEFT JOIN users u ON bh.performed_by = u.id
     WHERE bh.bed_id = ?
     ORDER BY bh.created_at DESC
     LIMIT 50`,
    [bedId]
  );
  return rows;
}

// ---- Get patient move history ----
export async function getPatientHistory(patientId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT bh.*, b.bed_code, r.room_code, r.name AS room_name,
       u.full_name AS performed_by_name
     FROM bed_history bh
     JOIN beds b ON bh.bed_id = b.id
     JOIN rooms r ON b.room_id = r.id
     LEFT JOIN users u ON bh.performed_by = u.id
     WHERE bh.patient_id = ?
     ORDER BY bh.created_at DESC`,
    [patientId]
  );
  return rows;
}
