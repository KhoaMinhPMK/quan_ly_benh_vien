import { db } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ── Bed allocation rules CRUD ──

export async function getAllRules(filters?: { department_id?: number; is_active?: boolean }) {
  let sql = 'SELECT * FROM bed_allocation_rules WHERE 1=1';
  const params: (string | number)[] = [];
  if (filters?.department_id) { sql += ' AND (department_id = ? OR department_id IS NULL)'; params.push(filters.department_id); }
  if (filters?.is_active !== undefined) { sql += ' AND is_active = ?'; params.push(filters.is_active ? 1 : 0); }
  sql += ' ORDER BY priority DESC, id';
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

export async function getRuleById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM bed_allocation_rules WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createRule(data: {
  name: string; rule_type: string; priority?: number; conditions: any;
  actions: any; description?: string; department_id?: number; created_by?: number;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO bed_allocation_rules (name, rule_type, priority, conditions, actions, description, department_id, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.rule_type, data.priority || 0, JSON.stringify(data.conditions),
     JSON.stringify(data.actions), data.description || null, data.department_id || null, data.created_by || null]
  );
  return getRuleById(result.insertId);
}

export async function updateRule(id: number, data: Partial<{
  name: string; rule_type: string; priority: number; conditions: any;
  actions: any; description: string; is_active: boolean; department_id: number;
}>) {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.rule_type !== undefined) { fields.push('rule_type = ?'); params.push(data.rule_type); }
  if (data.priority !== undefined) { fields.push('priority = ?'); params.push(data.priority); }
  if (data.conditions !== undefined) { fields.push('conditions = ?'); params.push(JSON.stringify(data.conditions)); }
  if (data.actions !== undefined) { fields.push('actions = ?'); params.push(JSON.stringify(data.actions)); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
  if (data.department_id !== undefined) { fields.push('department_id = ?'); params.push(data.department_id); }
  if (fields.length === 0) return getRuleById(id);
  params.push(id);
  await db.execute(`UPDATE bed_allocation_rules SET ${fields.join(', ')} WHERE id = ?`, params);
  return getRuleById(id);
}

export async function deleteRule(id: number) {
  await db.execute('DELETE FROM bed_allocation_rules WHERE id = ?', [id]);
}

// ── Auto bed suggestion engine (#25, #97) ──

interface BedSuggestion {
  bed_id: number; bed_code: string; room_id: number; room_code: string;
  room_name: string; room_type: string; floor: number; department_name: string;
  score: number; reasons: string[];
}

export async function suggestBeds(patientInfo: {
  gender?: string; diagnosis?: string; department_id?: number;
  severity?: string; isolation_required?: boolean; room_type_preference?: string;
}): Promise<BedSuggestion[]> {
  // Get all empty beds
  const [beds] = await db.execute<RowDataPacket[]>(`
    SELECT b.id AS bed_id, b.bed_code, b.room_id, r.room_code, r.name AS room_name,
      r.room_type, r.floor, d.name AS department_name, r.department_id
    FROM beds b
    JOIN rooms r ON b.room_id = r.id
    JOIN departments d ON r.department_id = d.id
    WHERE b.status = 'empty' AND r.status = 'active'
    ORDER BY r.room_code, b.bed_code
  `);

  // Get active rules
  const rules = await getAllRules({ is_active: true });

  // Score each bed
  const suggestions: BedSuggestion[] = beds.map((bed: RowDataPacket) => {
    let score = 50; // base score
    const reasons: string[] = [];

    // Department match bonus
    if (patientInfo.department_id && bed.department_id === patientInfo.department_id) {
      score += 30;
      reasons.push('Cùng khoa');
    }

    // Apply rules
    for (const rule of rules) {
      const cond = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : rule.conditions;
      const act = typeof rule.actions === 'string' ? JSON.parse(rule.actions) : rule.actions;

      if (rule.rule_type === 'gender_separation' && patientInfo.gender) {
        // Check current patients in room
        // Simple: prefer rooms with same gender or empty rooms
        score += 5;
      }

      if (rule.rule_type === 'room_type_match') {
        if (patientInfo.isolation_required && bed.room_type === 'isolation') {
          score += 40;
          reasons.push('Phòng cách ly phù hợp');
        }
        if (patientInfo.room_type_preference && bed.room_type === patientInfo.room_type_preference) {
          score += 20;
          reasons.push('Loại phòng phù hợp');
        }
      }

      if (rule.rule_type === 'severity' && patientInfo.severity === 'critical') {
        if (bed.room_type === 'icu') {
          score += 40;
          reasons.push('ICU cho ca nặng');
        }
      }
    }

    return { ...bed, score, reasons } as BedSuggestion;
  });

  // Sort by score descending
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 20);
}

// ── Workflow gates ──

export async function getWorkflowGates(gateType: string, departmentId?: number) {
  let sql = 'SELECT * FROM workflow_gates WHERE gate_type = ? AND is_active = TRUE';
  const params: (string | number)[] = [gateType];
  if (departmentId) {
    sql += ' AND (department_id = ? OR department_id IS NULL)';
    params.push(departmentId);
  } else {
    sql += ' AND department_id IS NULL';
  }
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

// ── SLA tracking ──

export async function getSLADefinitions() {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM sla_definitions WHERE is_active = TRUE ORDER BY name');
  return rows;
}

export async function getSLATracking(filters?: { status?: string; sla_type?: string }) {
  let sql = `
    SELECT st.*, sd.name AS sla_name, sd.sla_type, sd.target_hours
    FROM sla_tracking st
    JOIN sla_definitions sd ON st.sla_definition_id = sd.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (filters?.status) { sql += ' AND st.status = ?'; params.push(filters.status); }
  if (filters?.sla_type) { sql += ' AND sd.sla_type = ?'; params.push(filters.sla_type); }
  sql += ' ORDER BY st.target_at ASC LIMIT 200';
  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

export async function createSLATracking(data: {
  sla_definition_id: number; entity_type: string; entity_id: number;
  started_at: string; target_at: string;
}) {
  await db.execute(
    `INSERT INTO sla_tracking (sla_definition_id, entity_type, entity_id, started_at, target_at)
     VALUES (?, ?, ?, ?, ?)`,
    [data.sla_definition_id, data.entity_type, data.entity_id, data.started_at, data.target_at]
  );
}

export async function updateSLAStatus() {
  // Auto-update SLA statuses
  await db.execute(`
    UPDATE sla_tracking SET status = 'breached'
    WHERE status IN ('on_track','warning') AND completed_at IS NULL AND target_at < NOW()
  `);
  await db.execute(`
    UPDATE sla_tracking st
    JOIN sla_definitions sd ON st.sla_definition_id = sd.id
    SET st.status = 'warning'
    WHERE st.status = 'on_track' AND st.completed_at IS NULL
      AND NOW() > DATE_SUB(st.target_at, INTERVAL (sd.target_hours * (100 - sd.warning_threshold_pct) / 100) HOUR)
  `);
}

export async function getSLASummary() {
  const [rows] = await db.execute<RowDataPacket[]>(`
    SELECT sd.sla_type, sd.name,
      COUNT(*) AS total,
      SUM(CASE WHEN st.status = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN st.status = 'breached' THEN 1 ELSE 0 END) AS breached,
      SUM(CASE WHEN st.status = 'warning' THEN 1 ELSE 0 END) AS warning,
      SUM(CASE WHEN st.status = 'on_track' THEN 1 ELSE 0 END) AS on_track,
      ROUND(AVG(CASE WHEN st.completed_at IS NOT NULL
        THEN TIMESTAMPDIFF(MINUTE, st.started_at, st.completed_at) END), 0) AS avg_minutes
    FROM sla_tracking st
    JOIN sla_definitions sd ON st.sla_definition_id = sd.id
    WHERE st.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY sd.id
    ORDER BY sd.name
  `);
  return rows;
}
