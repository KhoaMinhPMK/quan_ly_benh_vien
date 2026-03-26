import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export async function getDashboardStats(departmentId?: number) {
  const deptFilter = departmentId ? ' AND r.department_id = ?' : '';
  const deptParam = departmentId ? [departmentId] : [];

  // Total inpatients (scoped by department through rooms)
  const [patientRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM patients p
     LEFT JOIN beds b ON p.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE p.status IN ('admitted', 'treating', 'waiting_discharge')${deptFilter}`,
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
    `SELECT COUNT(*) AS total FROM patients p
     LEFT JOIN beds b ON p.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE p.status IN ('treating', 'waiting_discharge')
     AND p.expected_discharge IS NOT NULL
     AND p.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)${deptFilter}`,
    deptParam
  );

  // Incomplete checklists
  const [checklistRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT p.id) AS total FROM patients p
     LEFT JOIN beds b ON p.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     INNER JOIN checklist_templates ct ON ct.is_active = TRUE
     LEFT JOIN patient_checklists pc ON pc.patient_id = p.id AND pc.checklist_template_id = ct.id AND pc.is_completed = TRUE
     WHERE p.status IN ('treating', 'waiting_discharge')
     AND p.expected_discharge IS NOT NULL
     AND p.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
     AND pc.id IS NULL${deptFilter}`,
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
  };
}
