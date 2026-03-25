import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  full_name: string;
  role: string;
  department_id: number | null;
  department_name: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getUsers(filters?: { role?: string; is_active?: string; search?: string }) {
  let sql = `
    SELECT u.id, u.email, u.full_name, u.role, u.department_id,
      d.name AS department_name, u.is_active, u.created_at
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (filters?.role) { sql += ' AND u.role = ?'; params.push(filters.role); }
  if (filters?.is_active !== undefined) { sql += ' AND u.is_active = ?'; params.push(filters.is_active === 'true' ? 1 : 0); }
  if (filters?.search) { sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)'; params.push(`%${filters.search}%`, `%${filters.search}%`); }

  sql += ' ORDER BY u.created_at DESC';
  const [rows] = await db.execute<UserRow[]>(sql, params);
  return rows;
}

export async function getUserById(id: number) {
  const [rows] = await db.execute<UserRow[]>(
    `SELECT u.id, u.email, u.full_name, u.role, u.department_id,
      d.name AS department_name, u.is_active, u.created_at
     FROM users u LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function createUser(data: {
  email: string; password: string; full_name: string;
  role: string; department_id?: number;
}) {
  const hash = await bcrypt.hash(data.password, 10);
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, full_name, role, department_id) VALUES (?, ?, ?, ?, ?)',
    [data.email, hash, data.full_name, data.role, data.department_id || null]
  );
  return getUserById(result.insertId);
}

export async function updateUser(id: number, data: {
  full_name?: string; role?: string; department_id?: number | null; is_active?: boolean;
}) {
  const fields: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  if (data.full_name !== undefined) { fields.push('full_name = ?'); params.push(data.full_name); }
  if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
  if (data.department_id !== undefined) { fields.push('department_id = ?'); params.push(data.department_id); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }

  if (fields.length === 0) return getUserById(id);

  params.push(id);
  await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return getUserById(id);
}

export async function resetPassword(id: number, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT password_hash FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) throw Object.assign(new Error('Người dùng không tồn tại'), { statusCode: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) throw Object.assign(new Error('Mật khẩu hiện tại không đúng'), { statusCode: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
}

export async function deleteUser(id: number) {
  await db.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
}
