// ============================================================
// Shared Access Platform Types — dùng chung client + server
// ============================================================

// --- Module ---
export interface FeatureModule {
  id: number;
  module_key: string;
  module_name: string;
  description: string | null;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  is_core: boolean;
  dependencies: string[] | null;
  default_enabled: boolean;
}

// --- Capability ---
export interface Capability {
  id: number;
  capability_key: string;
  module_id: number;
  module_key?: string;
  description: string | null;
  action_group: string;
  is_sensitive: boolean;
}

// --- Subject types ---
export type SubjectType = 'plan' | 'tenant' | 'department' | 'group' | 'user' | 'role_template';
export type EntitlementEffect = 'enabled' | 'disabled' | 'inherit';
export type PolicyEffect = 'allow' | 'deny' | 'inherit';

// --- Module Entitlement ---
export interface ModuleEntitlement {
  id: number;
  subject_type: SubjectType;
  subject_id: number;
  module_key: string;
  effect: EntitlementEffect;
  reason: string | null;
  updated_by: number | null;
  updated_at: string;
}

// --- Policy Assignment ---
export interface PolicyAssignment {
  id: number;
  subject_type: SubjectType;
  subject_id: number;
  capability_key: string;
  effect: PolicyEffect;
  scope_json: AccessScope | null;
  conditions_json: PolicyCondition | null;
  source: string | null;
  is_active: boolean;
  updated_by: number | null;
}

export interface AccessScope {
  departmentIds?: number[];
  roomIds?: number[];
  patientRelation?: 'all' | 'own' | 'assigned' | 'department_only';
  canCrossDepartment?: boolean;
}

export interface PolicyCondition {
  expires_at?: string;
  reason?: string;
}

// --- Effective Access (resolved) ---
export interface EffectiveAccess {
  userId: number;
  tenantId: number | null;
  version: number;
  modules: Record<string, boolean>;
  capabilities: Record<string, EffectiveCapability>;
  scopes: AccessScope;
  generatedAt: string;
}

export interface EffectiveCapability {
  effect: 'allow' | 'deny';
  source: string; // e.g. "role_template:admin", "group:3", "user:12"
  scopes?: AccessScope;
}

// --- User Group ---
export interface UserGroup {
  id: number;
  tenant_id: number | null;
  code: string;
  name: string;
  description: string | null;
  group_type: 'operational' | 'department' | 'shift' | 'custom';
  priority: number;
  is_active: boolean;
  member_count?: number;
}

// --- Role Template ---
export interface RoleTemplate {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  capabilities?: string[];
}

// --- Rule ---
export type RuleCategory = 'workflow' | 'validation' | 'visibility' | 'recommendation';

export interface RuleDefinition {
  id: number;
  rule_key: string;
  rule_name: string;
  category: RuleCategory;
  module_key: string;
  description: string | null;
  config_schema: Record<string, unknown> | null;
  default_config: Record<string, unknown> | null;
  is_active: boolean;
}

export interface RuleAssignment {
  id: number;
  subject_type: 'tenant' | 'department' | 'group' | 'user';
  subject_id: number;
  rule_key: string;
  config_json: Record<string, unknown>;
  is_active: boolean;
}

// --- Access Audit ---
export interface AccessAuditLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  action: 'module_change' | 'capability_change' | 'scope_change' | 'rule_change' | 'group_change' | 'publish';
  subject_type: string | null;
  subject_id: number | null;
  target_key: string | null;
  before_value: unknown;
  after_value: unknown;
  reason: string | null;
  created_at: string;
}

// --- API payloads ---
export interface AccessCatalogResponse {
  modules: FeatureModule[];
  capabilities: Capability[];
  roleTemplates: RoleTemplate[];
}

export interface SubjectAccessResponse {
  modules: ModuleEntitlement[];
  capabilities: PolicyAssignment[];
  effectiveModules: Record<string, boolean>;
  effectiveCapabilities: Record<string, EffectiveCapability>;
}
