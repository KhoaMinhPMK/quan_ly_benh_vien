import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { UserInfo, LoginResponse } from '../../../../shared/types/auth';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  department_id: number | null;
  is_active: boolean;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  // Find user by email
  const [rows] = await db.execute<UserRow[]>(
    'SELECT id, email, password_hash, full_name, role, department_id, is_active FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    const error = new Error('Email hoặc mật khẩu không đúng') as Error & { statusCode: number; code: string };
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = rows[0];

  // Check if user is active
  if (!user.is_active) {
    const error = new Error('Tài khoản đã bị khóa') as Error & { statusCode: number; code: string };
    error.statusCode = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    const error = new Error('Email hoặc mật khẩu không đúng') as Error & { statusCode: number; code: string };
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Build user info
  const userInfo: UserInfo = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role as UserInfo['role'],
    departmentId: user.department_id,
    isActive: user.is_active,
  };

  // Generate JWT
  const token = jwt.sign(userInfo, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);

  return { token, user: userInfo };
}
