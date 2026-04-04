import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export async function getDashboardStats(departmentId?: number) {
  const deptFilter = departmentId ? ' AND r.department_id = ?' : '';
  const deptParam = departmentId ? [departmentId] : [];

  // Total in-admissions (scoped by department through rooms)
  const [patientRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM admissions a
     LEFT JOIN beds b ON a.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE a.status IN ('admitted', 'treating', 'waiting_discharge')${deptFilter}`,
    deptParam
  );

  // Bed stats (scoped by department)
  const [bedRows] = await db.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_beds,
      SUM(CASE WHEN b.status = 'empty' THEN 1 ELSE 0 END) AS empty_beds,
      SUM(CASE WHEN b.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_beds,
      SUM(CASE WHEN b.status = 'locked' THEN 1 ELSE 0 END) AS locked_beds,
      SUM(CASE WHEN b.status = 'cleaning' THEN 1 ELSE 0 END) AS cleaning_beds
    FROM beds b
    JOIN rooms r ON b.room_id = r.id
    WHERE 1=1${deptFilter}`,
    deptParam
  );

  // Discharge today/tomorrow
  const [dischargeRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM admissions a
     LEFT JOIN beds b ON a.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE a.status IN ('treating', 'waiting_discharge')
     AND a.expected_discharge IS NOT NULL
     AND a.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)${deptFilter}`,
    deptParam
  );

  // Incomplete checklists
  const [checklistRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT a.id) AS total FROM admissions a
     LEFT JOIN beds b ON a.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     INNER JOIN checklist_templates ct ON ct.is_active = TRUE
     LEFT JOIN admission_checklists ac ON ac.admission_id = a.id AND ac.checklist_template_id = ct.id AND ac.is_completed = TRUE
     WHERE a.status IN ('treating', 'waiting_discharge')
     AND a.expected_discharge IS NOT NULL
     AND a.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
     AND ac.id IS NULL${deptFilter}`,
    deptParam
  );

  // Room occupancy (scoped)
  const [roomRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.room_code, r.name, r.max_beds,
      d.name AS department_name,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id) AS total_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'empty') AS empty_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'occupied') AS occupied_beds
    FROM rooms r
    LEFT JOIN departments d ON d.id = r.department_id
    WHERE r.status = 'active'${departmentId ? ' AND r.department_id = ?' : ''}
    ORDER BY r.room_code`,
    deptParam
  );

  return {
    total_patients: Number(patientRows[0]?.total) || 0,
    beds: {
      total_beds: Number(bedRows[0]?.total_beds) || 0,
      empty_beds: Number(bedRows[0]?.empty_beds) || 0,
      occupied_beds: Number(bedRows[0]?.occupied_beds) || 0,
      locked_beds: Number(bedRows[0]?.locked_beds) || 0,
      cleaning_beds: Number(bedRows[0]?.cleaning_beds) || 0,
    },
    discharge_pending: Number(dischargeRows[0]?.total) || 0,
    patients_missing_checklist: Number(checklistRows[0]?.total) || 0,
    rooms: (roomRows as RowDataPacket[]).map(r => ({
      ...r,
      total_beds: Number(r.total_beds) || 0,
      empty_beds: Number(r.empty_beds) ?? 0,
      occupied_beds: Number(r.occupied_beds) || 0,
    })),
    ...await getWarnings(departmentId),
  };
}

async function getWarnings(departmentId?: number) {
  const deptFilter = departmentId ? ' AND r.department_id = ?' : '';
  const deptParam = departmentId ? [departmentId] : [];

  // Waiting queue count (#62)
  const [waitingRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM admissions
     WHERE bed_id IS NULL AND status IN ('admitted', 'treating')`
  );

  // Overdue records (#63) — admissions with expected_discharge in the past and not discharged
  const [overdueRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM admissions a
     LEFT JOIN beds b ON a.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE a.status IN ('admitted', 'treating', 'waiting_discharge')
       AND a.expected_discharge IS NOT NULL
       AND a.expected_discharge < CURDATE()${deptFilter}`,
    deptParam
  );

  // Near-full rooms (#15) — rooms where empty_beds <= 1 and total_beds > 0
  const [nearFullRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.room_code, r.name, d.name AS department_name,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id) AS total_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'empty') AS empty_beds
    FROM rooms r
    LEFT JOIN departments d ON d.id = r.department_id
    WHERE r.status = 'active'${departmentId ? ' AND r.department_id = ?' : ''}
    HAVING total_beds > 0 AND empty_beds <= 1
    ORDER BY empty_beds ASC`,
    deptParam
  );

  return {
    waiting_bed_count: Number(waitingRows[0]?.total) || 0,
    overdue_records_count: Number(overdueRows[0]?.total) || 0,
    near_full_rooms: nearFullRows,
  };
}
