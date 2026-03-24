import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';

export async function getDashboardStats() {
  // Total inpatients
  const [patientRows] = await db.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM patients WHERE status IN ('admitted', 'treating', 'waiting_discharge')"
  );

  // Bed stats
  const [bedRows] = await db.execute<RowDataPacket[]>(
    `SELECT
      COUNT(*) AS total_beds,
      SUM(CASE WHEN status = 'empty' THEN 1 ELSE 0 END) AS empty_beds,
      SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied_beds,
      SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) AS locked_beds,
      SUM(CASE WHEN status = 'cleaning' THEN 1 ELSE 0 END) AS cleaning_beds
    FROM beds`
  );

  // Discharge today/tomorrow
  const [dischargeRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM patients
     WHERE status IN ('treating', 'waiting_discharge')
     AND expected_discharge IS NOT NULL
     AND expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
  );

  // Incomplete checklists (for patients expecting discharge soon)
  const [checklistRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT p.id) AS total FROM patients p
     INNER JOIN checklist_templates ct ON ct.is_active = TRUE
     LEFT JOIN patient_checklists pc ON pc.patient_id = p.id AND pc.checklist_template_id = ct.id AND pc.is_completed = TRUE
     WHERE p.status IN ('treating', 'waiting_discharge')
     AND p.expected_discharge IS NOT NULL
     AND p.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
     AND pc.id IS NULL`
  );

  // Room occupancy
  const [roomRows] = await db.execute<RowDataPacket[]>(
    `SELECT r.id, r.room_code, r.name, r.max_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id) AS total_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'occupied') AS occupied_beds
    FROM rooms r WHERE r.status = 'active'
    ORDER BY r.room_code`
  );

  return {
    total_patients: patientRows[0]?.total || 0,
    beds: bedRows[0] || { total_beds: 0, empty_beds: 0, occupied_beds: 0, locked_beds: 0, cleaning_beds: 0 },
    discharge_pending: dischargeRows[0]?.total || 0,
    patients_missing_checklist: checklistRows[0]?.total || 0,
    rooms: roomRows,
  };
}
