import { db } from '../../config/database';
import { RowDataPacket } from 'mysql2';
import type { EffectiveAccess, EffectiveCapability, AccessScope, PolicyEffect } from '../../../../shared/types/access';

// ============================================================
// Access Resolver — resolve quyền hiệu lực cho một user
// Thứ tự kế thừa: system default < role_template < tenant < department < group(priority) < user
// Luật: deny thắng allow ở cùng cấp; cấp cao hơn override cấp thấp
// ============================================================

interface PolicyRow extends RowDataPacket {
  capability_key: string;
  effect: PolicyEffect;
  scope_json: string | null;
  conditions_json: string | null;
  source: string | null;
  subject_type: string;
  subject_id: number;
  priority?: number;
}

interface ModuleEntRow extends RowDataPacket {
  module_key: string;
  effect: 'enabled' | 'disabled' | 'inherit';
  subject_type: string;
  subject_id: number;
}

interface ModuleRow extends RowDataPacket {
  module_key: string;
  default_enabled: boolean;
  is_core: boolean;
  dependencies: string | null;
}

// Cache snapshots in memory (per process)
const snapshotCache = new Map<number, { version: number; data: EffectiveAccess; exp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

/**
 * Get effective access for a user. Uses cached snapshot if version matches.
 */
export async function getEffectiveAccess(userId: number, tenantId: number | null = null): Promise<EffectiveAccess> {
  const now = Date.now();
  const cached = snapshotCache.get(userId);

  // Check global version
  const [vRows] = await db.execute<RowDataPacket[]>(
    `SELECT version FROM access_versions WHERE scope_type = 'global' AND scope_id IS NULL`
  );
  const globalVersion = vRows[0]?.version ?? 1;

  if (cached && cached.version === globalVersion && cached.exp > now) {
    return cached.data;
  }

  // Resolve fresh
  const result = await resolveAccess(userId, tenantId);
  result.version = globalVersion;

  // Save to cache
  snapshotCache.set(userId, { version: globalVersion, data: result, exp: now + CACHE_TTL });

  // Persist snapshot (async, non-blocking)
  persistSnapshot(userId, tenantId, result).catch(() => {});

  return result;
}

/**
 * Invalidate cache globally — bump version so all users re-resolve
 */
export async function invalidateAccessCache(): Promise<void> {
  await db.execute(
    `INSERT INTO access_versions (scope_type, scope_id, version) VALUES ('global', NULL, 1)
     ON DUPLICATE KEY UPDATE version = version + 1`
  );
  snapshotCache.clear();
}

/**
 * Preview: resolve access for a user without caching
 */
export async function previewAccess(userId: number, tenantId: number | null = null): Promise<EffectiveAccess> {
  return resolveAccess(userId, tenantId);
}

// ============================================================
// Core resolution logic
// ============================================================
async function resolveAccess(userId: number, tenantId: number | null): Promise<EffectiveAccess> {
  // 1. Load user info
  const [userRows] = await db.execute<RowDataPacket[]>(
    'SELECT id, role, department_id, tenant_id FROM users WHERE id = ?', [userId]
  );
  if (userRows.length === 0) throw new Error('User not found');
  const user = userRows[0];
  const effectiveTenant = tenantId ?? user.tenant_id ?? null;

  // 2. Load all modules
  const [moduleRows] = await db.execute<ModuleRow[]>('SELECT module_key, default_enabled, is_core, dependencies FROM feature_modules');
  const moduleMap = new Map(moduleRows.map(m => [m.module_key, m]));

  // 3. Load user's groups
  const [groupRows] = await db.execute<RowDataPacket[]>(
    `SELECT ug.id, ug.priority FROM user_groups ug
     JOIN group_memberships gm ON gm.group_id = ug.id
     WHERE gm.user_id = ? AND ug.is_active = TRUE
     AND (gm.ends_at IS NULL OR gm.ends_at > NOW())
     ORDER BY ug.priority DESC`,
    [userId]
  );
  const groupIds = groupRows.map(g => g.id);

  // ── Resolve modules ──
  const modules = resolveModules(moduleRows, userId, user, effectiveTenant, groupIds);

  // ── Resolve capabilities ──
  const { capabilities, scopes } = await resolveCapabilities(userId, user, effectiveTenant, groupIds, modules);

  return {
    userId,
    tenantId: effectiveTenant,
    version: 0,
    modules,
    capabilities,
    scopes,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================
// Module resolution
// ============================================================
function resolveModules(
  allModules: ModuleRow[],
  _userId: number,
  _user: RowDataPacket,
  _tenantId: number | null,
  _groupIds: number[]
): Record<string, boolean> {
  // For now: simple — all default_enabled or core modules are on
  // TODO: layer module_entitlements by subject hierarchy
  const result: Record<string, boolean> = {};
  for (const m of allModules) {
    result[m.module_key] = m.is_core || m.default_enabled;
  }
  return result;
}

// ============================================================
// Capability resolution
// ============================================================
async function resolveCapabilities(
  userId: number,
  user: RowDataPacket,
  tenantId: number | null,
  groupIds: number[],
  enabledModules: Record<string, boolean>
): Promise<{ capabilities: Record<string, EffectiveCapability>; scopes: AccessScope }> {
  const caps: Record<string, EffectiveCapability> = {};
  const mergedScope: AccessScope = {
    departmentIds: user.department_id ? [user.department_id] : [],
    patientRelation: 'all',
    canCrossDepartment: false,
  };

  // Layer 1: Role template defaults
  const [rtRows] = await db.execute<PolicyRow[]>(
    `SELECT rtc.capability_key, rtc.effect, 'role_template' as subject_type, rt.id as subject_id, NULL as scope_json, NULL as conditions_json, 'role_template' as source
     FROM role_template_capabilities rtc
     JOIN role_templates rt ON rt.id = rtc.role_template_id
     WHERE rt.code = ?`,
    [user.role]
  );
  applyPolicies(caps, rtRows, 'role_template');

  // Layer 2: Tenant policies
  if (tenantId) {
    const [tenantPols] = await db.execute<PolicyRow[]>(
      `SELECT capability_key, effect, scope_json, conditions_json, source, subject_type, subject_id
       FROM policy_assignments WHERE subject_type = 'tenant' AND subject_id = ? AND is_active = TRUE`,
      [tenantId]
    );
    applyPolicies(caps, tenantPols, 'tenant');
  }

  // Layer 3: Department policies
  if (user.department_id) {
    const [deptPols] = await db.execute<PolicyRow[]>(
      `SELECT capability_key, effect, scope_json, conditions_json, source, subject_type, subject_id
       FROM policy_assignments WHERE subject_type = 'department' AND subject_id = ? AND is_active = TRUE`,
      [user.department_id]
    );
    applyPolicies(caps, deptPols, 'department');
  }

  // Layer 4: Group policies (ordered by priority DESC — higher priority overrides)
  if (groupIds.length > 0) {
    const placeholders = groupIds.map(() => '?').join(',');
    const [groupPols] = await db.execute<PolicyRow[]>(
      `SELECT pa.capability_key, pa.effect, pa.scope_json, pa.conditions_json, pa.source, pa.subject_type, pa.subject_id, ug.priority
       FROM policy_assignments pa
       JOIN user_groups ug ON ug.id = pa.subject_id
       WHERE pa.subject_type = 'group' AND pa.subject_id IN (${placeholders}) AND pa.is_active = TRUE
       ORDER BY ug.priority ASC`,
      groupIds
    );
    applyPolicies(caps, groupPols, 'group');
  }

  // Layer 5: User overrides
  const [userPols] = await db.execute<PolicyRow[]>(
    `SELECT capability_key, effect, scope_json, conditions_json, source, subject_type, subject_id
     FROM policy_assignments WHERE subject_type = 'user' AND subject_id = ? AND is_active = TRUE`,
    [userId]
  );
  // Filter expired conditions
  const activePols = userPols.filter(p => {
    if (!p.conditions_json) return true;
    const cond = typeof p.conditions_json === 'string' ? JSON.parse(p.conditions_json) : p.conditions_json;
    if (cond.expires_at && new Date(cond.expires_at) < new Date()) return false;
    return true;
  });
  applyPolicies(caps, activePols, 'user');

  // Remove capabilities whose module is disabled
  for (const [key, cap] of Object.entries(caps)) {
    const moduleKey = key.split('.')[0];
    if (!enabledModules[moduleKey]) {
      delete caps[key];
    }
  }

  // Admin gets cross-department scope
  if (user.role === 'admin') {
    mergedScope.canCrossDepartment = true;
    mergedScope.departmentIds = [];
    mergedScope.patientRelation = 'all';
  }

  return { capabilities: caps, scopes: mergedScope };
}

function applyPolicies(
  caps: Record<string, EffectiveCapability>,
  policies: PolicyRow[],
  layer: string
): void {
  for (const p of policies) {
    if (p.effect === 'inherit') continue;

    const source = `${layer}:${p.subject_id}`;
    const scope = p.scope_json ? (typeof p.scope_json === 'string' ? JSON.parse(p.scope_json) : p.scope_json) : undefined;

    // Higher layer overrides lower. Within same layer, deny wins.
    const existing = caps[p.capability_key];
    if (!existing || p.effect === 'deny' || existing.effect !== 'deny') {
      caps[p.capability_key] = {
        effect: p.effect as 'allow' | 'deny',
        source,
        scopes: scope,
      };
    }
  }
}

// ============================================================
// Persist snapshot to DB
// ============================================================
async function persistSnapshot(userId: number, tenantId: number | null, access: EffectiveAccess): Promise<void> {
  await db.execute(
    `INSERT INTO effective_access_snapshots (user_id, tenant_id, version, modules_json, capabilities_json, scopes_json, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE version = VALUES(version), modules_json = VALUES(modules_json),
       capabilities_json = VALUES(capabilities_json), scopes_json = VALUES(scopes_json), generated_at = NOW()`,
    [userId, tenantId, access.version, JSON.stringify(access.modules), JSON.stringify(access.capabilities), JSON.stringify(access.scopes)]
  );
}
