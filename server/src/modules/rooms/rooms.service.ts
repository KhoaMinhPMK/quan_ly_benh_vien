import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RoomRow extends RowDataPacket {
  id: number;
  room_code: string;
  name: string;
  department_id: number;
  department_name: string;
  room_type: string;
  max_beds: number;
  status: string;
  floor: number;
  notes: string;
  total_beds: number;
  occupied_beds: number;
  created_at: string;
}

export async function getAllRooms(filters: { department_id?: number; status?: string; search?: string }) {
  let sql = `
    SELECT r.*, d.name AS department_name,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id) AS total_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'occupied') AS occupied_beds
    FROM rooms r
    JOIN departments d ON r.department_id = d.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.department_id) {
    sql += ' AND r.department_id = ?';
    params.push(filters.department_id);
  }
  if (filters.status) {
    sql += ' AND r.status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    sql += ' AND (r.room_code LIKE ? OR r.name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY r.floor, r.room_code';
  const [rows] = await db.execute<RoomRow[]>(sql, params);
  return rows;
}

export async function getRoomById(id: number) {
  const [rows] = await db.execute<RoomRow[]>(
    `SELECT r.*, d.name AS department_name,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id) AS total_beds,
      (SELECT COUNT(*) FROM beds WHERE room_id = r.id AND status = 'occupied') AS occupied_beds
    FROM rooms r
    JOIN departments d ON r.department_id = d.id
    WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createRoom(data: { room_code: string; name: string; department_id: number; room_type?: string; max_beds?: number; floor?: number; notes?: string }) {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO rooms (room_code, name, department_id, room_type, max_beds, floor, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.room_code, data.name, data.department_id, data.room_type || 'normal', data.max_beds || 4, data.floor || 1, data.notes || null]
  );
  return getRoomById(result.insertId);
}

export async function updateRoom(id: number, data: { name?: string; room_type?: string; max_beds?: number; status?: string; floor?: number; notes?: string }) {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.room_type !== undefined) { fields.push('room_type = ?'); params.push(data.room_type); }
  if (data.max_beds !== undefined) { fields.push('max_beds = ?'); params.push(data.max_beds); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  if (data.floor !== undefined) { fields.push('floor = ?'); params.push(data.floor); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }

  if (fields.length === 0) return getRoomById(id);

  params.push(id);
  await db.execute(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, params);
  return getRoomById(id);
}

export async function getDepartments() {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM departments WHERE is_active = TRUE ORDER BY name');
  return rows;
}
