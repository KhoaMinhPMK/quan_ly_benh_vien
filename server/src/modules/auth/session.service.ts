import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: number, token: string, ip?: string, userAgent?: string) {
  const tokenHash = hashToken(token);
  const deviceInfo = userAgent ? userAgent.substring(0, 255) : null;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

  // Check max concurrent sessions
  const [configRows] = await db.execute<RowDataPacket[]>(
    "SELECT config_value FROM system_config WHERE config_key = 'max_concurrent_sessions'"
  );
  const maxSessions = configRows.length > 0 ? parseInt(configRows[0].config_value, 10) : 5;

  const [activeSessions] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM user_sessions WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW() ORDER BY created_at ASC',
    [userId]
  );

  // Remove oldest sessions if over limit
  if (activeSessions.length >= maxSessions) {
    const toRemove = activeSessions.slice(0, activeSessions.length - maxSessions + 1);
    for (const s of toRemove) {
      await db.execute('UPDATE user_sessions SET is_active = FALSE WHERE id = ?', [s.id]);
    }
  }

  await db.execute(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, device_info, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, tokenHash, ip || null, userAgent || null, deviceInfo, expiresAt]
  );
}

export async function validateSession(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM user_sessions WHERE token_hash = ? AND is_active = TRUE AND expires_at > NOW()',
    [tokenHash]
  );
  if (rows.length > 0) {
    await db.execute('UPDATE user_sessions SET last_active_at = NOW() WHERE id = ?', [rows[0].id]);
    return true;
  }
  return false;
}

export async function getUserSessions(userId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT id, ip_address, device_info, last_active_at, created_at, expires_at, is_active
     FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    [userId]
  );
  return rows;
}

export async function revokeSession(sessionId: number, userId: number) {
  await db.execute('UPDATE user_sessions SET is_active = FALSE WHERE id = ? AND user_id = ?', [sessionId, userId]);
}

export async function revokeAllSessions(userId: number, exceptToken?: string) {
  if (exceptToken) {
    const tokenHash = hashToken(exceptToken);
    await db.execute(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ? AND token_hash != ?',
      [userId, tokenHash]
    );
  } else {
    await db.execute('UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?', [userId]);
  }
}

export async function cleanupExpiredSessions() {
  await db.execute('DELETE FROM user_sessions WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)');
}
