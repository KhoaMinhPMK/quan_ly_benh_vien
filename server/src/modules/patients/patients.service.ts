import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PatientRow extends RowDataPacket {
  id: number; // This is now admission_id
  patient_id: number;
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

// ---- Auto-generate codes ----
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

async function generateAdmissionCode(): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const prefix = `BA-${dateStr}-`;

  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT admission_code FROM admissions WHERE admission_code LIKE ? ORDER BY admission_code DESC LIMIT 1',
    [`${prefix}%`]
  );

  let seq = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].admission_code as string;
    const lastSeq = parseInt(lastCode.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function getAllPatients(filters: { status?: string; search?: string; room_id?: number; doctor_name?: string; department_id?: number }) {
  let sql = `
    SELECT a.id, a.patient_id, p.patient_code, p.full_name, p.date_of_birth, p.gender, p.phone, p.id_number, p.insurance_number,
           a.admission_code, a.diagnosis, a.doctor_name, a.bed_id, a.status, a.admitted_at, a.expected_discharge, a.discharged_at, a.notes,
           b.bed_code, r.room_code, r.name AS room_name
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.status != 'discharged'
  `;
  const params: (string | number)[] = [];

  if (filters.status) { sql += ' AND a.status = ?'; params.push(filters.status); }
  if (filters.search) {
    sql += ' AND (p.patient_code LIKE ? OR p.full_name LIKE ? OR a.admission_code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.room_id) {
    sql += ' AND b.room_id = ?';
    params.push(filters.room_id);
  }
  if (filters.doctor_name) {
    sql += ' AND a.doctor_name LIKE ?';
    params.push(`%${filters.doctor_name}%`);
  }
  if (filters.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }

  sql += ' ORDER BY a.admitted_at DESC';
  const [rows] = await db.execute<PatientRow[]>(sql, params);
  return rows;
}

export async function getPatientById(id: number) {
  // get admission by id
  const [rows] = await db.execute<PatientRow[]>(
    `SELECT a.id, a.patient_id, p.patient_code, p.full_name, p.date_of_birth, p.gender, p.phone, p.id_number, p.insurance_number,
            a.admission_code, a.diagnosis, a.doctor_name, a.bed_id, a.status, a.admitted_at, a.expected_discharge, a.discharged_at, a.notes,
            b.bed_code, r.room_code, r.name AS room_name
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createPatient(data: {
  patient_id?: number; patient_code?: string; full_name: string; date_of_birth?: string; gender?: string;
  phone?: string; address?: string; id_number?: string; insurance_number?: string;
  diagnosis?: string; doctor_name?: string; bed_id?: number; expected_discharge?: string; notes?: string;
}) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let targetPatientId = data.patient_id;

    if (!targetPatientId) {
      // Create patient
      const patientCode = data.patient_code || await generatePatientCode();
      const [pRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, id_number, insurance_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [patientCode, data.full_name, data.date_of_birth || null, data.gender || 'male',
         data.phone || null, data.address || null, data.id_number || null, data.insurance_number || null]
      );
      targetPatientId = pRes.insertId;
    }

    // Create admission
    const admissionCode = await generateAdmissionCode();
    const [aRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO admissions (patient_id, admission_code, diagnosis, doctor_name, bed_id, expected_discharge, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetPatientId, admissionCode, data.diagnosis || null, data.doctor_name || null, data.bed_id || null, data.expected_discharge || null, data.notes || null]
    );
    const newAdmissionId = aRes.insertId;

    // If bed assigned, update bed status
    if (data.bed_id) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['occupied', data.bed_id]);
      await conn.execute(
        'INSERT INTO admission_bed_history (admission_id, bed_id, action) VALUES (?, ?, ?)',
        [newAdmissionId, data.bed_id, 'assign']
      );
    }

    await conn.commit();
    return getPatientById(newAdmissionId);
  } catch(e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function updatePatient(id: number, data: Record<string, string | number | null>) {
  // id here is admission_id
  const current = await getPatientById(id);
  if (!current) {
    throw Object.assign(new Error('Bệnh án không tồn tại'), { statusCode: 404, code: 'NOT_FOUND' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (data.status !== undefined) {
      if (data.status === 'discharged') {
        throw Object.assign(new Error('Vui lòng sử dụng chức năng Xuất viện'), { statusCode: 422, code: 'USE_DISCHARGE_ENDPOINT' });
      }
      validateStatusTransition(current.status, data.status as string);
    }

    // Update Patients table
    const pFields: string[] = [];
    const pParams: (string | number | null)[] = [];
    const pAllowed = ['full_name', 'date_of_birth', 'gender', 'phone', 'address', 'id_number', 'insurance_number'];
    for (const key of pAllowed) {
      if (data[key] !== undefined) {
        pFields.push(`${key} = ?`);
        pParams.push(data[key]);
      }
    }
    if (pFields.length > 0) {
      pParams.push(current.patient_id);
      await conn.execute(`UPDATE patients SET ${pFields.join(', ')} WHERE id = ?`, pParams);
    }

    // Update Admissions table
    const aFields: string[] = [];
    const aParams: (string | number | null)[] = [];
    const aAllowed = ['diagnosis', 'doctor_name', 'status', 'expected_discharge', 'notes'];
    for (const key of aAllowed) {
      if (data[key] !== undefined) {
        aFields.push(`${key} = ?`);
        aParams.push(data[key]);
      }
    }
    if (aFields.length > 0) {
      aParams.push(id); // admission_id
      await conn.execute(`UPDATE admissions SET ${aFields.join(', ')} WHERE id = ?`, aParams);
    }

    await conn.commit();
    return getPatientById(id);
  } catch(e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function dischargePatient(id: number, performedBy?: number) {
  // id here is admission_id
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock and verify admission status
    const [admissions] = await conn.execute<RowDataPacket[]>(
      'SELECT id, bed_id, status FROM admissions WHERE id = ? FOR UPDATE',
      [id]
    );
    if (admissions.length === 0) {
      throw Object.assign(new Error('Bệnh án không tồn tại'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    const admission = admissions[0];

    // Only allow discharge from treating or waiting_discharge
    if (!['treating', 'waiting_discharge'].includes(admission.status)) {
      throw Object.assign(
        new Error(`Không thể xuất viện bệnh án có trạng thái "${admission.status}". Chỉ chấp nhận "Đang điều trị" hoặc "Chờ xuất viện".`),
        { statusCode: 422, code: 'INVALID_STATUS_FOR_DISCHARGE' }
      );
    }

    // Verify checklist completion
    const [checklistStatus] = await conn.execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM checklist_templates WHERE is_active = TRUE) AS total_items,
        (SELECT COUNT(*) FROM admission_checklists ac
         JOIN checklist_templates ct ON ac.checklist_template_id = ct.id
         WHERE ac.admission_id = ? AND ac.is_completed = TRUE AND ct.is_active = TRUE) AS completed_items`,
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

    const bedId = admission.bed_id;

    // Update admission: set discharged, clear bed_id
    await conn.execute(
      'UPDATE admissions SET status = ?, discharged_at = NOW(), bed_id = NULL WHERE id = ?',
      ['discharged', id]
    );

    // Release bed
    if (bedId) {
      await conn.execute('UPDATE beds SET status = ? WHERE id = ?', ['empty', bedId]);
      await conn.execute(
        'INSERT INTO admission_bed_history (admission_id, bed_id, action, performed_by) VALUES (?, ?, ?, ?)',
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
    SELECT a.id, a.patient_id, p.patient_code, p.full_name, p.date_of_birth, p.gender, p.phone,
           a.admission_code, a.diagnosis, a.doctor_name, a.bed_id, a.status, a.admitted_at, a.expected_discharge, a.discharged_at, a.notes,
           b.bed_code, r.room_code, r.name AS room_name
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.status IN ('treating', 'waiting_discharge')
    AND a.expected_discharge IS NOT NULL
  `;
  const params: (string | number)[] = [];

  if (filters.date) {
    sql += ' AND a.expected_discharge = ?';
    params.push(filters.date);
  } else {
    sql += ' AND a.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)';
  }
  if (filters.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }

  sql += ' ORDER BY a.expected_discharge ASC';
  const [rows] = await db.execute<PatientRow[]>(sql, params);
  return rows;
}

export async function getPatientChecklists(admissionId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT ct.id AS template_id, ct.name, ct.description, ct.sort_order,
      COALESCE(ac.is_completed, FALSE) AS is_completed,
      ac.completed_at, ac.notes,
      u.full_name AS completed_by_name
    FROM checklist_templates ct
    LEFT JOIN admission_checklists ac ON ac.checklist_template_id = ct.id AND ac.admission_id = ?
    LEFT JOIN users u ON ac.completed_by = u.id
    WHERE ct.is_active = TRUE
    ORDER BY ct.sort_order`,
    [admissionId]
  );
  return rows;
}

export async function toggleChecklist(admissionId: number, templateId: number, completed: boolean, userId?: number) {
  // Upsert
  await db.execute(
    `INSERT INTO admission_checklists (admission_id, checklist_template_id, is_completed, completed_by, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE is_completed = ?, completed_by = ?, completed_at = ?`,
    [admissionId, templateId, completed, completed ? userId || null : null, completed ? new Date() : null,
     completed, completed ? userId || null : null, completed ? new Date() : null]
  );
  return getPatientChecklists(admissionId);
}
