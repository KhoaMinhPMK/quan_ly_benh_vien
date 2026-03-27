import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export async function getOccupancyReport(from?: string, to?: string) {
  const sql = `
    SELECT r.id, r.room_code, r.name, d.name AS department_name, r.max_beds,
      COUNT(b.id) AS total_beds,
      SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_beds,
      SUM(CASE WHEN b.status = 'empty' THEN 1 ELSE 0 END) AS empty_beds,
      ROUND(SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(b.id), 0), 1) AS occupancy_rate
    FROM rooms r
    JOIN departments d ON r.department_id = d.id
    LEFT JOIN beds b ON b.room_id = r.id
    WHERE r.status = 'active'
    GROUP BY r.id
    ORDER BY occupancy_rate DESC
  `;
  const [rows] = await db.execute<RowDataPacket[]>(sql);
  return rows;
}

export async function getDischargeReport(from?: string, to?: string) {
  let sql = `
    SELECT a.id, p.patient_code, p.full_name, a.admission_code, a.diagnosis, a.doctor_name,
      a.admitted_at, a.discharged_at, a.status,
      r.room_code, r.name AS room_name, b.bed_code
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.status = 'discharged'
  `;
  const params: string[] = [];
  if (from) { sql += ' AND a.discharged_at >= ?'; params.push(from); }
  if (to) { sql += ' AND a.discharged_at <= ?'; params.push(to + ' 23:59:59'); }
  sql += ' ORDER BY a.discharged_at DESC LIMIT 200';
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

export async function getMissingRecordsReport() {
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT a.id, p.patient_code, p.full_name, a.admission_code, a.status, a.doctor_name,
      COUNT(ct.id) AS total_items,
      SUM(CASE WHEN ac.is_completed = TRUE THEN 1 ELSE 0 END) AS completed_items,
      COUNT(ct.id) - SUM(CASE WHEN ac.is_completed = TRUE THEN 1 ELSE 0 END) AS missing_items
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    CROSS JOIN checklist_templates ct
    LEFT JOIN admission_checklists ac ON ac.admission_id = a.id AND ac.checklist_template_id = ct.id
    WHERE a.status IN ('admitted', 'treating', 'waiting_discharge') AND ct.is_active = TRUE
    GROUP BY a.id
    HAVING missing_items > 0
    ORDER BY missing_items DESC
  `);
  return rows;
}

export async function getDepartmentReport() {
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT d.id, d.name, d.code,
      COUNT(DISTINCT r.id) AS total_rooms,
      COUNT(DISTINCT b.id) AS total_beds,
      SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_beds,
      COUNT(DISTINCT CASE WHEN a.status IN ('admitted','treating','waiting_discharge') THEN a.id END) AS active_patients
    FROM departments d
    LEFT JOIN rooms r ON r.department_id = d.id
    LEFT JOIN beds b ON b.room_id = r.id
    LEFT JOIN admissions a ON a.bed_id = b.id AND a.status IN ('admitted','treating','waiting_discharge')
    WHERE d.is_active = TRUE
    GROUP BY d.id
    ORDER BY d.name
  `);
  return rows;
}
