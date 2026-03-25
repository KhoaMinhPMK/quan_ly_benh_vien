import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PatientRow extends RowDataPacket {
  id: number;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  diagnosis: string;
  doctor_name: string;
  bed_id: number | null;
  bed_code: string | null;
  room_code: string | null;
  room_name: string | null;
  status: string;
  admitted_at: string;
  expected_discharge: string;
}

export async function getAllPatients(filters: { status?: string; search?: string; room_id?: number; doctor_name?: string; department_id?: number }) {
  let sql = `
    SELECT p.*, b.bed_code, r.room_code, r.name AS room_name
    FROM patients p
    LEFT JOIN beds b ON p.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE p.status != 'discharged'
  `;
  const params: (string | number)[] = [];

  if (filters.status) { sql += ' AND p.status = ?'; params.push(filters.status); }
  if (filters.search) {
    sql += ' AND (p.patient_code LIKE ? OR p.full_name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.room_id) {
    sql += ' AND b.room_id = ?';
    params.push(filters.room_id);
  }
  if (filters.doctor_name) {
    sql += ' AND p.doctor_name LIKE ?';
    params.push(`%${filters.doctor_name}%`);
  }
  if (filters.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }

  sql += ' ORDER BY p.admitted_at DESC';
  const [rows] = await db.execute<PatientRow[]>(sql, params);
  return rows;
}

export async function getPatientById(id: number) {
  const [rows] = await db.execute<PatientRow[]>(
    `SELECT p.*, b.bed_code, r.room_code, r.name AS room_name
    FROM patients p
    LEFT JOIN beds b ON p.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createPatient(data: {
  patient_code: string; full_name: string; date_of_birth?: string; gender?: string;
  phone?: string; address?: string; id_number?: string; insurance_number?: string;
  diagnosis?: string; doctor_name?: string; bed_id?: number; expected_discharge?: string; notes?: string;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, id_number, insurance_number, diagnosis, doctor_name, bed_id, expected_discharge, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.patient_code, data.full_name, data.date_of_birth || null, data.gender || 'male',
     data.phone || null, data.address || null, data.id_number || null, data.insurance_number || null,
     data.diagnosis || null, data.doctor_name || null, data.bed_id || null, data.expected_discharge || null, data.notes || null]
  );

  // If bed assigned, update bed status
  if (data.bed_id) {
    await db.execute('UPDATE beds SET status = ? WHERE id = ?', ['occupied', data.bed_id]);
    await db.execute(
      'INSERT INTO bed_history (patient_id, bed_id, action) VALUES (?, ?, ?)',
      [result.insertId, data.bed_id, 'assign']
    );
  }

  return getPatientById(result.insertId);
}

export async function updatePatient(id: number, data: Record<string, string | number | null>) {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];
  const allowed = ['full_name', 'date_of_birth', 'gender', 'phone', 'address', 'id_number',
    'insurance_number', 'diagnosis', 'doctor_name', 'status', 'expected_discharge', 'notes'];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return getPatientById(id);
  params.push(id);
  await db.execute(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, params);
  return getPatientById(id);
}

export async function dischargePatient(id: number, performedBy?: number) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get patient bed
    const [patients] = await conn.execute<RowDataPacket[]>('SELECT bed_id FROM patients WHERE id = ?', [id]);
    const bedId = patients[0]?.bed_id;

    // Update patient status
    await conn.execute('UPDATE patients SET status = ?, discharged_at = NOW() WHERE id = ?', ['discharged', id]);

    // Release bed
    if (bedId) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', bedId]);
      await conn.execute(
        'INSERT INTO bed_history (patient_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
        [id, bedId, 'release', performedBy || null]
      );
    }

    await conn.commit();
    return getPatientById(id);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getDischargeList(filters: { date?: string; department_id?: number }) {
  let sql = `
    SELECT p.*, b.bed_code, r.room_code, r.name AS room_name
    FROM patients p
    LEFT JOIN beds b ON p.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE p.status IN ('treating', 'waiting_discharge')
    AND p.expected_discharge IS NOT NULL
  `;
  const params: (string | number)[] = [];

  if (filters.date) {
    sql += ' AND p.expected_discharge = ?';
    params.push(filters.date);
  } else {
    sql += ' AND p.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)';
  }
  if (filters.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }

  sql += ' ORDER BY p.expected_discharge ASC';
  const [rows] = await db.execute<PatientRow[]>(sql, params);
  return rows;
}

export async function getPatientChecklists(patientId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT ct.id AS template_id, ct.name, ct.description, ct.sort_order,
      COALESCE(pc.is_completed, FALSE) AS is_completed,
      pc.completed_at, pc.notes,
      u.full_name AS completed_by_name
    FROM checklist_templates ct
    LEFT JOIN patient_checklists pc ON pc.checklist_template_id = ct.id AND pc.patient_id = ?
    LEFT JOIN users u ON pc.completed_by = u.id
    WHERE ct.is_active = TRUE
    ORDER BY ct.sort_order`,
    [patientId]
  );
  return rows;
}

export async function toggleChecklist(patientId: number, templateId: number, completed: boolean, userId?: number) {
  // Upsert
  await db.execute(
    `INSERT INTO patient_checklists (patient_id, checklist_template_id, is_completed, completed_by, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE is_completed = ?, completed_by = ?, completed_at = ?`,
    [patientId, templateId, completed, completed ? userId || null : null, completed ? new Date() : null,
     completed, completed ? userId || null : null, completed ? new Date() : null]
  );
  return getPatientChecklists(patientId);
}
