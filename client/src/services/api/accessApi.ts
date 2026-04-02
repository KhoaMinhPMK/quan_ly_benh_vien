import httpClient from '../httpClient';
import type {
  FeatureModule, Capability, RoleTemplate, UserGroup,
  ModuleEntitlement, PolicyAssignment, EffectiveAccess,
  AccessAuditLog, AccessCatalogResponse, SubjectAccessResponse,
  EntitlementEffect, PolicyEffect, AccessScope, PolicyCondition,
} from '../../../../shared/types/access';

interface ApiRes<T> { success: boolean; data: T; }

// ============================================================
// Catalog
// ============================================================
export const fetchAccessCatalog = async () =>
  (await httpClient.get<ApiRes<AccessCatalogResponse>>('/access/catalog')).data.data;

// ============================================================
// My effective access
// ============================================================
export const fetchMyAccess = async () =>
  (await httpClient.get<ApiRes<EffectiveAccess>>('/access/me')).data.data;

// ============================================================
// Subject modules (entitlements)
// ============================================================
export const fetchSubjectModules = async (type: string, id: number) =>
  (await httpClient.get<ApiRes<ModuleEntitlement[]>>(`/access/subjects/${type}/${id}/modules`)).data.data;

export const setSubjectModule = async (type: string, id: number, moduleKey: string, effect: EntitlementEffect, reason?: string) =>
  (await httpClient.put<ApiRes<void>>(`/access/subjects/${type}/${id}/modules`, { module_key: moduleKey, effect, reason })).data;

// ============================================================
// Subject capabilities (policies)
// ============================================================
export const fetchSubjectCapabilities = async (type: string, id: number) =>
  (await httpClient.get<ApiRes<PolicyAssignment[]>>(`/access/subjects/${type}/${id}/capabilities`)).data.data;

export const setSubjectCapabilities = async (
  type: string, id: number,
  policies: Array<{ capability_key: string; effect: PolicyEffect; scope_json?: AccessScope | null; conditions_json?: PolicyCondition | null; reason?: string }>
) =>
  (await httpClient.put<ApiRes<void>>(`/access/subjects/${type}/${id}/capabilities`, { policies })).data;

// ============================================================
// User groups
// ============================================================
export const fetchGroups = async () =>
  (await httpClient.get<ApiRes<UserGroup[]>>('/access/groups')).data.data;

export const createGroup = async (data: { code: string; name: string; description?: string; group_type?: string; priority?: number }) =>
  (await httpClient.post<ApiRes<UserGroup>>('/access/groups', data)).data.data;

export const updateGroup = async (id: number, data: Partial<Pick<UserGroup, 'name' | 'description' | 'priority' | 'is_active'>>) =>
  (await httpClient.put<ApiRes<void>>(`/access/groups/${id}`, data)).data;

export const fetchGroupMembers = async (groupId: number) =>
  (await httpClient.get<ApiRes<Array<{ user_id: number; full_name: string; email: string; role: string }>>>(`/access/groups/${groupId}/members`)).data.data;

export const addGroupMember = async (groupId: number, userId: number) =>
  (await httpClient.post<ApiRes<void>>(`/access/groups/${groupId}/members`, { user_id: userId })).data;

export const removeGroupMember = async (groupId: number, userId: number) =>
  (await httpClient.delete<ApiRes<void>>(`/access/groups/${groupId}/members/${userId}`)).data;

// ============================================================
// Preview
// ============================================================
export const fetchUserAccessPreview = async (userId: number) =>
  (await httpClient.get<ApiRes<EffectiveAccess>>(`/access/preview/${userId}`)).data.data;

// ============================================================
// Audit
// ============================================================
export const fetchAccessAuditLogs = async (params?: { subject_type?: string; subject_id?: number; limit?: number }) =>
  (await httpClient.get<ApiRes<AccessAuditLog[]>>('/access/audit', { params })).data.data;

export type {
  FeatureModule, Capability, RoleTemplate, UserGroup,
  ModuleEntitlement, PolicyAssignment, EffectiveAccess,
  AccessAuditLog, AccessCatalogResponse, SubjectAccessResponse,
  EntitlementEffect, PolicyEffect, AccessScope, PolicyCondition,
};
