import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface WardRow extends RowDataPacket {
  id: number;
  name: string;
  code: string;
  description: string | null;
  floor_start: number;
  floor_end: number;
  is_active: boolean;
  room_count: number;
  bed_count: number;
}

export async function getAllWards(filters: { is_active?: boolean; search?: string } = {}) {
  let sql = `
    SELECT w.*,
      (SELECT COUNT(*) FROM rooms WHERE ward_id = w.id) AS room_count,
      (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.id WHERE r.ward_id = w.id) AS bed_count
    FROM wards w WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters.is_active !== undefined) {
    sql += ' AND w.is_active = ?';
    params.push(filters.is_active ? 1 : 0);
  }
  if (filters.search) {
    sql += ' AND (w.name LIKE ? OR w.code LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY w.code';
  const [rows] = await db.execute<WardRow[]>(sql, params);
  return rows;
}

export async function getWardById(id: number) {
  const [rows] = await db.execute<WardRow[]>(
    `SELECT w.*,
      (SELECT COUNT(*) FROM rooms WHERE ward_id = w.id) AS room_count,
      (SELECT COUNT(*) FROM beds b JOIN rooms r ON b.room_id = r.id WHERE r.ward_id = w.id) AS bed_count
    FROM wards w WHERE w.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createWard(data: {
  name: string; code: string; description?: string;
  floor_start?: number; floor_end?: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO wards (name, code, description, floor_start, floor_end) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.code, data.description || null, data.floor_start || 1, data.floor_end || 1]
  );
  return getWardById(result.insertId);
}

export async function updateWard(id: number, data: {
  name?: string; code?: string; description?: string;
  floor_start?: number; floor_end?: number; is_active?: boolean;
}) {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.code !== undefined) { fields.push('code = ?'); params.push(data.code); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.floor_start !== undefined) { fields.push('floor_start = ?'); params.push(data.floor_start); }
  if (data.floor_end !== undefined) { fields.push('floor_end = ?'); params.push(data.floor_end); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }

  if (fields.length === 0) return getWardById(id);

  params.push(id);
  await db.execute(`UPDATE wards SET ${fields.join(', ')} WHERE id = ?`, params);
  return getWardById(id);
}

export async function deleteWard(id: number) {
  // Unlink rooms first
  await db.execute('UPDATE rooms SET ward_id = NULL WHERE ward_id = ?', [id]);
  await db.execute('DELETE FROM wards WHERE id = ?', [id]);
}
