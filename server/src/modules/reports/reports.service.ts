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

// ── Trend data for charts (#60) ──

export async function getTrendData(days = 30, departmentId?: number) {
  const deptFilter = departmentId ? ' AND r.department_id = ?' : '';
  const params: (string | number)[] = [];
  params.push(days);
  if (departmentId) params.push(departmentId);

  // Try daily_stats first, fallback to computed
  const [snapshotRows] = await db.execute<RowDataPacket[]>(
    `SELECT stat_date, total_patients, new_admissions, discharges, occupied_beds, occupancy_rate
     FROM daily_stats
     WHERE stat_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ${departmentId ? 'AND department_id = ?' : 'AND department_id IS NULL'}
     ORDER BY stat_date`,
    params
  );

  if (snapshotRows.length > 0) return snapshotRows;

  // Fallback: compute from admissions data
  const computeParams: (string | number)[] = [days];
  if (departmentId) computeParams.push(departmentId);

  const [computed] = await db.execute<RowDataPacket[]>(
    `SELECT
      DATE(a.admitted_at) AS stat_date,
      COUNT(*) AS new_admissions,
      (SELECT COUNT(*) FROM admissions a2
       LEFT JOIN beds b2 ON a2.bed_id = b2.id
       LEFT JOIN rooms r2 ON b2.room_id = r2.id
       WHERE a2.status != 'discharged'
         AND DATE(a2.admitted_at) <= DATE(a.admitted_at)
         ${departmentId ? 'AND r2.department_id = ?' : ''}
      ) AS total_patients,
      (SELECT COUNT(*) FROM admissions a3
       LEFT JOIN beds b3 ON a3.bed_id = b3.id
       LEFT JOIN rooms r3 ON b3.room_id = r3.id
       WHERE a3.status = 'discharged'
         AND DATE(a3.discharged_at) = DATE(a.admitted_at)
         ${departmentId ? 'AND r3.department_id = ?' : ''}
      ) AS discharges
    FROM admissions a
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.admitted_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ${deptFilter}
    GROUP BY DATE(a.admitted_at)
    ORDER BY stat_date`,
    departmentId ? [departmentId, departmentId, days, departmentId] : [days]
  );

  return computed;
}

export async function snapshotDailyStats() {
  // Run at end of day to snapshot current stats
  await db.execute(`
    INSERT INTO daily_stats (stat_date, department_id, total_patients, new_admissions, discharges, total_beds, occupied_beds, waiting_queue, occupancy_rate)
    SELECT
      CURDATE(),
      NULL,
      (SELECT COUNT(*) FROM admissions WHERE status IN ('admitted','treating','waiting_discharge')),
      (SELECT COUNT(*) FROM admissions WHERE DATE(admitted_at) = CURDATE()),
      (SELECT COUNT(*) FROM admissions WHERE status = 'discharged' AND DATE(discharged_at) = CURDATE()),
      (SELECT COUNT(*) FROM beds),
      (SELECT COUNT(*) FROM beds WHERE status = 'occupied'),
      (SELECT COUNT(*) FROM admissions WHERE bed_id IS NULL AND status IN ('admitted','treating')),
      ROUND((SELECT COUNT(*) FROM beds WHERE status = 'occupied') * 100.0 / NULLIF((SELECT COUNT(*) FROM beds), 0), 2)
    ON DUPLICATE KEY UPDATE
      total_patients = VALUES(total_patients),
      new_admissions = VALUES(new_admissions),
      discharges = VALUES(discharges),
      total_beds = VALUES(total_beds),
      occupied_beds = VALUES(occupied_beds),
      waiting_queue = VALUES(waiting_queue),
      occupancy_rate = VALUES(occupancy_rate)
  `);
}

// ── Discharge history (#42) ──

export async function getDischargeHistory(filters: {
  from?: string; to?: string; doctor_name?: string;
  department_id?: number; room_id?: number; search?: string;
}) {
  let sql = `
    SELECT a.id, p.patient_code, p.full_name, a.admission_code, a.diagnosis, a.doctor_name,
      a.admitted_at, a.discharged_at,
      r.room_code, r.name AS room_name, b.bed_code,
      d.name AS department_name,
      TIMESTAMPDIFF(DAY, a.admitted_at, a.discharged_at) AS stay_days
    FROM admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN beds b ON a.bed_id = b.id
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    WHERE a.status = 'discharged'
  `;
  const params: (string | number)[] = [];

  if (filters.from) { sql += ' AND a.discharged_at >= ?'; params.push(filters.from); }
  if (filters.to) { sql += ' AND a.discharged_at <= ?'; params.push(filters.to + ' 23:59:59'); }
  if (filters.doctor_name) { sql += ' AND a.doctor_name LIKE ?'; params.push(`%${filters.doctor_name}%`); }
  if (filters.department_id) { sql += ' AND r.department_id = ?'; params.push(filters.department_id); }
  if (filters.room_id) { sql += ' AND b.room_id = ?'; params.push(filters.room_id); }
  if (filters.search) {
    sql += ' AND (p.patient_code LIKE ? OR p.full_name LIKE ? OR a.admission_code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY a.discharged_at DESC LIMIT 500';
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

// ── CSV Export helpers (#80) ──

export async function exportOccupancyCSV() {
  const data = await getOccupancyReport();
  const headers = ['Mã phòng', 'Tên phòng', 'Khoa', 'Tổng giường', 'Đang dùng', 'Trống', 'Tỷ lệ (%)'];
  const rows = data.map((r: RowDataPacket) =>
    [r.room_code, r.name, r.department_name, r.total_beds, r.occupied_beds, r.empty_beds, r.occupancy_rate]
  );
  return buildCSV(headers, rows);
}

export async function exportDischargeCSV(from?: string, to?: string) {
  const data = await getDischargeHistory({ from, to });
  const headers = ['Mã BN', 'Họ tên', 'Mã BA', 'Chẩn đoán', 'BS phụ trách', 'Nhập viện', 'Ra viện', 'Phòng', 'Số ngày'];
  const rows = data.map((r: RowDataPacket) =>
    [r.patient_code, r.full_name, r.admission_code, r.diagnosis, r.doctor_name,
     formatDate(r.admitted_at), formatDate(r.discharged_at), r.room_code, r.stay_days]
  );
  return buildCSV(headers, rows);
}

export async function exportMissingRecordsCSV() {
  const data = await getMissingRecordsReport();
  const headers = ['Mã BN', 'Họ tên', 'Mã BA', 'Trạng thái', 'BS phụ trách', 'Tổng mục', 'Đã xong', 'Còn thiếu'];
  const rows = data.map((r: RowDataPacket) =>
    [r.patient_code, r.full_name, r.admission_code, r.status, r.doctor_name, r.total_items, r.completed_items, r.missing_items]
  );
  return buildCSV(headers, rows);
}

export async function exportDepartmentCSV() {
  const data = await getDepartmentReport();
  const headers = ['Tên khoa', 'Mã khoa', 'Số phòng', 'Tổng giường', 'Đang dùng', 'BN đang điều trị'];
  const rows = data.map((r: RowDataPacket) =>
    [r.name, r.code, r.total_rooms, r.total_beds, r.occupied_beds, r.active_patients]
  );
  return buildCSV(headers, rows);
}

function buildCSV(headers: string[], rows: any[][]): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return BOM + lines.join('\r\n');
}

function formatDate(d: any): string {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
