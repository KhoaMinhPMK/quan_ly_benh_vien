import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { invalidateAccessCache } from './access.resolver';

// ============================================================
// Catalog
// ============================================================
export async function getModuleCatalog() {
  const [modules] = await db.execute<RowDataPacket[]>('SELECT * FROM feature_modules ORDER BY sort_order');
  const [capabilities] = await db.execute<RowDataPacket[]>(
    `SELECT c.*, fm.module_key FROM capabilities c JOIN feature_modules fm ON fm.id = c.module_id ORDER BY fm.sort_order, c.capability_key`
  );
  const [roleTemplates] = await db.execute<RowDataPacket[]>(
    `SELECT rt.*, GROUP_CONCAT(rtc.capability_key) as cap_keys
     FROM role_templates rt LEFT JOIN role_template_capabilities rtc ON rtc.role_template_id = rt.id
     GROUP BY rt.id ORDER BY rt.code`
  );
  return {
    modules,
    capabilities,
    roleTemplates: roleTemplates.map(rt => ({ ...rt, capabilities: rt.cap_keys ? rt.cap_keys.split(',') : [] })),
  };
}

// ============================================================
// Module Entitlements
// ============================================================
export async function getModuleEntitlements(subjectType: string, subjectId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM module_entitlements WHERE subject_type = ? AND subject_id = ? ORDER BY module_key',
    [subjectType, subjectId]
  );
  return rows;
}

export async function setModuleEntitlement(
  subjectType: string, subjectId: number, moduleKey: string,
  effect: string, reason: string | null, updatedBy: number | null
) {
  if (effect === 'inherit') {
    await db.execute(
      'DELETE FROM module_entitlements WHERE subject_type = ? AND subject_id = ? AND module_key = ?',
      [subjectType, subjectId, moduleKey]
    );
  } else {
    await db.execute(
      `INSERT INTO module_entitlements (subject_type, subject_id, module_key, effect, reason, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE effect = VALUES(effect), reason = VALUES(reason), updated_by = VALUES(updated_by)`,
      [subjectType, subjectId, moduleKey, effect, reason, updatedBy]
    );
  }
  await invalidateAccessCache();
}

// ============================================================
// Policy Assignments (capabilities)
// ============================================================
export async function getPolicies(subjectType: string, subjectId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM policy_assignments WHERE subject_type = ? AND subject_id = ? ORDER BY capability_key',
    [subjectType, subjectId]
  );
  return rows;
}

export async function setPolicy(
  subjectType: string, subjectId: number, capabilityKey: string,
  effect: string, scopeJson: unknown, conditionsJson: unknown,
  source: string, updatedBy: number | null
) {
  if (effect === 'inherit') {
    await db.execute(
      'DELETE FROM policy_assignments WHERE subject_type = ? AND subject_id = ? AND capability_key = ?',
      [subjectType, subjectId, capabilityKey]
    );
  } else {
    await db.execute(
      `INSERT INTO policy_assignments (subject_type, subject_id, capability_key, effect, scope_json, conditions_json, source, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE effect = VALUES(effect), scope_json = VALUES(scope_json),
         conditions_json = VALUES(conditions_json), source = VALUES(source), updated_by = VALUES(updated_by)`,
      [subjectType, subjectId, capabilityKey, effect,
       scopeJson ? JSON.stringify(scopeJson) : null,
       conditionsJson ? JSON.stringify(conditionsJson) : null,
       source, updatedBy]
    );
  }
  await invalidateAccessCache();
}

export async function bulkSetPolicies(
  subjectType: string, subjectId: number,
  policies: Array<{ capability_key: string; effect: string; scope_json?: unknown; conditions_json?: unknown }>,
  source: string, updatedBy: number | null
) {
  for (const p of policies) {
    await setPolicy(subjectType, subjectId, p.capability_key, p.effect, p.scope_json, p.conditions_json, source, updatedBy);
  }
}

// ============================================================
// User Groups
// ============================================================
export async function getGroups(tenantId?: number) {
  let sql = `SELECT ug.*, (SELECT COUNT(*) FROM group_memberships gm WHERE gm.group_id = ug.id AND (gm.ends_at IS NULL OR gm.ends_at > NOW())) as member_count
             FROM user_groups ug WHERE 1=1`;
  const params: (string | number | boolean | null)[] = [];
  if (tenantId) { sql += ' AND ug.tenant_id = ?'; params.push(tenantId); }
  sql += ' ORDER BY ug.priority DESC, ug.name';
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

export async function createGroup(data: { tenant_id?: number; code: string; name: string; description?: string; group_type?: string; priority?: number }) {
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO user_groups (tenant_id, code, name, description, group_type, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [data.tenant_id || null, data.code, data.name, data.description || null, data.group_type || 'custom', data.priority || 0]
  );
  return { id: result.insertId, ...data };
}

export async function updateGroup(id: number, data: { name?: string; description?: string; priority?: number; is_active?: boolean }) {
  const fields: string[] = []; const params: (string | number | boolean | null)[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.priority !== undefined) { fields.push('priority = ?'); params.push(data.priority); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
  if (fields.length === 0) return;
  params.push(id);
  await db.execute(`UPDATE user_groups SET ${fields.join(', ')} WHERE id = ?`, params);
  await invalidateAccessCache();
}

export async function getGroupMembers(groupId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT gm.*, u.full_name, u.email, u.role FROM group_memberships gm
     JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ? AND (gm.ends_at IS NULL OR gm.ends_at > NOW())
     ORDER BY u.full_name`,
    [groupId]
  );
  return rows;
}

export async function addGroupMember(groupId: number, userId: number) {
  await db.execute(
    `INSERT INTO group_memberships (group_id, user_id) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE ends_at = NULL, starts_at = NOW()`,
    [groupId, userId]
  );
  await invalidateAccessCache();
}

export async function removeGroupMember(groupId: number, userId: number) {
  await db.execute('UPDATE group_memberships SET ends_at = NOW() WHERE group_id = ? AND user_id = ?', [groupId, userId]);
  await invalidateAccessCache();
}

// ============================================================
// Access Audit
// ============================================================
export async function logAccessAudit(
  userId: number | null, userName: string | null,
  action: string, subjectType: string | null, subjectId: number | null,
  targetKey: string | null, beforeValue: unknown, afterValue: unknown,
  reason: string | null, ip: string | null
) {
  await db.execute(
    `INSERT INTO access_audit_logs (user_id, user_name, action, subject_type, subject_id, target_key, before_value, after_value, reason, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, userName, action, subjectType, subjectId, targetKey,
     beforeValue ? JSON.stringify(beforeValue) : null,
     afterValue ? JSON.stringify(afterValue) : null,
     reason, ip]
  );
}

export async function getAccessAuditLogs(filters?: { subject_type?: string; subject_id?: number; limit?: number }) {
  let sql = 'SELECT * FROM access_audit_logs WHERE 1=1';
  const params: (string | number | boolean | null)[] = [];
  if (filters?.subject_type) { sql += ' AND subject_type = ?'; params.push(filters.subject_type); }
  if (filters?.subject_id) { sql += ' AND subject_id = ?'; params.push(filters.subject_id); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(filters?.limit || 100);
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}
