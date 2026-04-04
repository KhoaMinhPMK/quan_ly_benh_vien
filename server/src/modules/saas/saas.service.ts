import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ── Service Plans ──

export async function getPlans() {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM service_plans WHERE is_active = TRUE ORDER BY sort_order'
  );
  return rows.map(r => ({ ...r, features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features }));
}

export async function getPlanById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM service_plans WHERE id = ?', [id]);
  if (rows[0]) rows[0].features = typeof rows[0].features === 'string' ? JSON.parse(rows[0].features) : rows[0].features;
  return rows[0] || null;
}

export async function createPlan(data: {
  plan_code: string; name: string; description?: string;
  max_users?: number; max_departments?: number; max_rooms?: number; max_beds?: number;
  features: string[]; price_monthly?: number; price_yearly?: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO service_plans (plan_code, name, description, max_users, max_departments, max_rooms, max_beds, features, price_monthly, price_yearly)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.plan_code, data.name, data.description || null,
     data.max_users || 10, data.max_departments || 3, data.max_rooms || 20, data.max_beds || 100,
     JSON.stringify(data.features), data.price_monthly || 0, data.price_yearly || 0]
  );
  return getPlanById(result.insertId);
}

export async function updatePlan(id: number, data: Record<string, any>) {
  const fields: string[] = [];
  const params: any[] = [];
  const allowed = ['name', 'description', 'max_users', 'max_departments', 'max_rooms', 'max_beds', 'price_monthly', 'price_yearly', 'is_active', 'sort_order'];
  for (const key of allowed) {
    if (data[key] !== undefined) { fields.push(`${key} = ?`); params.push(data[key]); }
  }
  if (data.features !== undefined) { fields.push('features = ?'); params.push(JSON.stringify(data.features)); }
  if (fields.length === 0) return getPlanById(id);
  params.push(id);
  await db.execute(`UPDATE service_plans SET ${fields.join(', ')} WHERE id = ?`, params);
  return getPlanById(id);
}

// ── Tenants ──

export async function getTenants() {
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT t.*, sp.name AS plan_name, sp.plan_code
    FROM tenants t
    LEFT JOIN service_plans sp ON t.plan = sp.plan_code
    ORDER BY t.name
  `);
  return rows;
}

export async function getTenantById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT t.*, sp.name AS plan_name, sp.max_users, sp.max_departments, sp.max_rooms, sp.max_beds, sp.features AS plan_features
    FROM tenants t
    LEFT JOIN service_plans sp ON t.plan = sp.plan_code
    WHERE t.id = ?`, [id]);
  return rows[0] || null;
}

export async function updateTenant(id: number, data: Record<string, any>) {
  const fields: string[] = [];
  const params: any[] = [];
  const allowed = ['name', 'subdomain', 'custom_domain', 'logo_url', 'plan', 'is_active', 'billing_email', 'expires_at', 'settings'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(key === 'settings' ? JSON.stringify(data[key]) : data[key]);
    }
  }
  if (fields.length === 0) return getTenantById(id);
  params.push(id);
  await db.execute(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, params);
  return getTenantById(id);
}

// ── Resource limits check (#92) ──

export async function checkResourceLimits(tenantId: number) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) return { allowed: true };

  const [userCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM users WHERE tenant_id = ? AND is_active = TRUE', [tenantId]);
  const [deptCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM departments WHERE is_active = TRUE');
  const [roomCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM rooms WHERE status = "active"');
  const [bedCount] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM beds');

  return {
    users: { current: Number(userCount[0].cnt), max: tenant.max_users || 999 },
    departments: { current: Number(deptCount[0].cnt), max: tenant.max_departments || 999 },
    rooms: { current: Number(roomCount[0].cnt), max: tenant.max_rooms || 999 },
    beds: { current: Number(bedCount[0].cnt), max: tenant.max_beds || 9999 },
  };
}

// ── HIS/EMR Integration (#93) ──

export async function getIntegrations(tenantId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM his_integrations WHERE tenant_id = ? ORDER BY integration_name', [tenantId]
  );
  return rows;
}

export async function getIntegrationById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM his_integrations WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createIntegration(data: {
  tenant_id: number; integration_name: string; integration_type: string;
  endpoint_url?: string; auth_config?: any; field_mapping?: any;
  sync_direction?: string; sync_interval_minutes?: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO his_integrations (tenant_id, integration_name, integration_type, endpoint_url, auth_config, field_mapping, sync_direction, sync_interval_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.tenant_id, data.integration_name, data.integration_type,
     data.endpoint_url || null, data.auth_config ? JSON.stringify(data.auth_config) : null,
     data.field_mapping ? JSON.stringify(data.field_mapping) : null,
     data.sync_direction || 'inbound', data.sync_interval_minutes || 60]
  );
  return getIntegrationById(result.insertId);
}

export async function updateIntegration(id: number, data: Record<string, any>) {
  const fields: string[] = [];
  const params: any[] = [];
  const allowed = ['integration_name', 'integration_type', 'endpoint_url', 'sync_direction', 'sync_interval_minutes', 'is_active'];
  for (const key of allowed) {
    if (data[key] !== undefined) { fields.push(`${key} = ?`); params.push(data[key]); }
  }
  if (data.auth_config !== undefined) { fields.push('auth_config = ?'); params.push(JSON.stringify(data.auth_config)); }
  if (data.field_mapping !== undefined) { fields.push('field_mapping = ?'); params.push(JSON.stringify(data.field_mapping)); }
  if (fields.length === 0) return getIntegrationById(id);
  params.push(id);
  await db.execute(`UPDATE his_integrations SET ${fields.join(', ')} WHERE id = ?`, params);
  return getIntegrationById(id);
}

export async function deleteIntegration(id: number) {
  await db.execute('DELETE FROM his_integrations WHERE id = ?', [id]);
}

export async function getIntegrationLogs(integrationId: number, limit = 50) {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM his_sync_logs WHERE integration_id = ? ORDER BY created_at DESC LIMIT ?',
    [integrationId, limit]
  );
  return rows;
}
