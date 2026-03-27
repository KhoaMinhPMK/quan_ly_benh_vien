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

// ---- Status State Machine ----
const VALID_TRANSITIONS: Record<string, string[]> = {
  admitted: ['treating', 'waiting_discharge'],
  treating: ['waiting_discharge'],
  waiting_discharge: ['discharged'],
  discharged: [], // No reverse transitions allowed
};

function validateStatusTransition(currentStatus: string, newStatus: string): void {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    const error = new Error(`Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"`) as Error & { statusCode: number; code: string };
    error.statusCode = 422;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }
}

// ---- Auto-generate patient code ----
async function generatePatientCode(): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const prefix = `BN-${dateStr}-`;

  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT patient_code FROM patients WHERE patient_code LIKE ? ORDER BY patient_code DESC LIMIT 1',
    [`${prefix}%`]
  );

  let seq = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].patient_code as string;
    const lastSeq = parseInt(lastCode.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
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
  patient_code?: string; full_name: string; date_of_birth?: string; gender?: string;
  phone?: string; address?: string; id_number?: string; insurance_number?: string;
  diagnosis?: string; doctor_name?: string; bed_id?: number; expected_discharge?: string; notes?: string;
}) {
  // Auto-generate patient_code if not provided
  const patientCode = data.patient_code || await generatePatientCode();

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, id_number, insurance_number, diagnosis, doctor_name, bed_id, expected_discharge, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientCode, data.full_name, data.date_of_birth || null, data.gender || 'male',
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
  // If status is being changed, validate the transition
  if (data.status !== undefined) {
    const current = await getPatientById(id);
    if (!current) {
      throw Object.assign(new Error('Bệnh nhân không tồn tại'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    // 'discharged' status change is only allowed through the discharge endpoint
    if (data.status === 'discharged') {
      throw Object.assign(new Error('Vui lòng sử dụng chức năng Xuất viện'), { statusCode: 422, code: 'USE_DISCHARGE_ENDPOINT' });
    }
    validateStatusTransition(current.status, data.status as string);
  }

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

    // Lock and verify patient status
    const [patients] = await conn.execute<RowDataPacket[]>(
      'SELECT id, bed_id, status FROM patients WHERE id = ? FOR UPDATE',
      [id]
    );
    if (patients.length === 0) {
      throw Object.assign(new Error('Bệnh nhân không tồn tại'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    const patient = patients[0];

    // Only allow discharge from treating or waiting_discharge
    if (!['treating', 'waiting_discharge'].includes(patient.status)) {
      throw Object.assign(
        new Error(`Không thể xuất viện bệnh nhân có trạng thái "${patient.status}". Chỉ chấp nhận "Đang điều trị" hoặc "Chờ xuất viện".`),
        { statusCode: 422, code: 'INVALID_STATUS_FOR_DISCHARGE' }
      );
    }

    // Verify checklist completion
    const [checklistStatus] = await conn.execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM checklist_templates WHERE is_active = TRUE) AS total_items,
        (SELECT COUNT(*) FROM patient_checklists pc
         JOIN checklist_templates ct ON pc.checklist_template_id = ct.id
         WHERE pc.patient_id = ? AND pc.is_completed = TRUE AND ct.is_active = TRUE) AS completed_items`,
      [id]
    );
    const totalItems = Number(checklistStatus[0]?.total_items || 0);
    const completedItems = Number(checklistStatus[0]?.completed_items || 0);
    if (totalItems > 0 && completedItems < totalItems) {
      throw Object.assign(
        new Error(`Chưa hoàn thành checklist xuất viện (${completedItems}/${totalItems}). Vui lòng hoàn tất trước khi xuất viện.`),
        { statusCode: 422, code: 'CHECKLIST_INCOMPLETE' }
      );
    }

    const bedId = patient.bed_id;

    // Update patient: set discharged, clear bed_id
    await conn.execute(
      'UPDATE patients SET status = ?, discharged_at = NOW(), bed_id = NULL WHERE id = ?',
      ['discharged', id]
    );

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

