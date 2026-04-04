import httpClient from '../httpClient';

// ============================================================
// Types
// ============================================================
export interface Room {
  id: number; room_code: string; name: string; department_id: number;
  department_name: string; room_type: string; max_beds: number;
  status: string; floor: number; notes: string;
  total_beds: number; occupied_beds: number; empty_beds: number;
}

export interface Bed {
  id: number; bed_code: string; room_id: number; room_code: string;
  room_name: string; status: string; notes: string;
  patient_id: number | null; patient_name: string | null; patient_code: string | null;
  diagnosis?: string | null; doctor_name?: string | null;
  admitted_at?: string | null; expected_discharge?: string | null;
  patient_status?: string | null; days_admitted?: number | null;
  date_of_birth?: string | null; gender?: string | null; phone?: string | null;
}

export interface AvailableBed {
  id: number; bed_code: string; room_id: number; room_code: string;
  room_name: string; floor: number; department_name: string;
}

export interface Patient {
  id: number; // maps to admission_id
  patient_id: number;
  patient_code: string; admission_code: string;
  full_name: string; date_of_birth: string;
  gender: string; phone: string; id_number?: string; insurance_number?: string;
  diagnosis: string; doctor_name: string;
  bed_id: number | null; bed_code: string | null; room_code: string | null;
  room_name: string | null; status: string; admitted_at: string;
  expected_discharge: string; discharged_at: string | null; notes: string;
}

export interface Department { id: number; name: string; code: string; }

export interface ChecklistItem {
  template_id: number; name: string; description: string; sort_order: number;
  question_type: 'checkbox' | 'text' | 'radio' | 'number' | 'note';
  options: string[] | null; is_required: boolean; department_id: number | null;
  is_completed: boolean; completed_at: string | null; notes: string | null;
  answer_text: string | null; completed_by_name: string | null;
}

export interface DashboardStats {
  total_patients: number;
  beds: { total_beds: number; empty_beds: number; occupied_beds: number; locked_beds: number; cleaning_beds: number; };
  discharge_pending: number;
  patients_missing_checklist: number;
  rooms: Room[];
  waiting_bed_count: number;
  overdue_records_count: number;
  near_full_rooms: { id: number; room_code: string; name: string; department_name: string; total_beds: number; empty_beds: number }[];
}

export interface User {
  id: number; email: string; full_name: string; role: string;
  department_id: number | null; department_name: string | null;
  is_active: boolean; created_at: string;
}

export interface Notification {
  id: number; type: string; title: string; message: string;
  is_read: boolean; reference_type: string | null; reference_id: number | null;
  created_at: string;
}

export interface BedHistoryEntry {
  id: number; admission_id: number; bed_id: number; action: string;
  notes: string; created_at: string; patient_name: string;
  patient_code: string; bed_code: string; performed_by_name: string;
}

export interface SearchResults {
  patients: { id: number; patient_id: number; patient_code: string; full_name: string; admission_code: string; status: string; doctor_name: string | null; bed_code: string | null; room_code: string | null; room_name: string | null }[];
  rooms: { id: number; room_code: string; name: string }[];
  beds: { id: number; room_id: number; bed_code: string; room_code: string; room_name: string }[];
}

export interface ReadmissionPatient {
  patient_id: number;
  patient_code: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string;
  phone: string | null;
  address: string | null;
  id_number: string | null;
  insurance_number: string | null;
  total_admissions: number;
  last_discharged_at: string | null;
  last_diagnosis: string | null;
}

export interface AuditLog {
  id: number; user_id: number; user_name: string; action: string;
  entity_type: string; entity_id: number; details: any;
  ip_address: string; created_at: string;
}

export interface SystemConfig {
  id: number; config_key: string; config_value: string; description: string;
}

export interface OccupancyReport {
  id: number; room_code: string; name: string; department_name: string;
  max_beds: number; total_beds: number; occupied_beds: number;
  empty_beds: number; occupancy_rate: number;
}

export interface DischargeReport {
  id: number; patient_code: string; full_name: string; diagnosis: string;
  doctor_name: string; admitted_at: string; discharged_at: string;
  room_code: string; room_name: string; bed_code: string;
}

interface ApiRes<T> { success: boolean; data: T; message?: string; }

// ============================================================
// Rooms
// ============================================================
export const fetchRooms = async (p?: { department_id?: number; status?: string; search?: string }) =>
  (await httpClient.get<ApiRes<Room[]>>('/rooms', { params: p })).data.data;

export const fetchRoom = async (id: number) =>
  (await httpClient.get<ApiRes<Room>>(`/rooms/${id}`)).data.data;

export const createRoom = async (data: Partial<Room>) =>
  (await httpClient.post<ApiRes<Room>>('/rooms', data)).data.data;

export const updateRoom = async (id: number, data: Partial<Room>) =>
  (await httpClient.put<ApiRes<Room>>(`/rooms/${id}`, data)).data.data;

export const fetchDepartments = async () =>
  (await httpClient.get<ApiRes<Department[]>>('/rooms/departments')).data.data;

// ============================================================
// Beds
// ============================================================
export const fetchBedsByRoom = async (roomId: number) =>
  (await httpClient.get<ApiRes<Bed[]>>(`/beds/room/${roomId}`)).data.data;

export const fetchAvailableBeds = async (p?: { department_id?: number; room_id?: number }) =>
  (await httpClient.get<ApiRes<AvailableBed[]>>('/beds/available', { params: p })).data.data;

export const assignBed = async (bedId: number, patientId: number) =>
  (await httpClient.post<ApiRes<Bed>>(`/beds/${bedId}/assign`, { patient_id: patientId })).data.data;

export const releaseBed = async (bedId: number) =>
  (await httpClient.post<ApiRes<Bed>>(`/beds/${bedId}/release`)).data.data;

export const markBedClean = async (bedId: number) =>
  (await httpClient.patch<ApiRes<Bed>>(`/beds/${bedId}/status`, { status: 'empty' })).data.data;

export const transferBed = async (currentBedId: number, data: { patient_id: number; target_bed_id: number; reason?: string }) =>
  (await httpClient.post<ApiRes<any>>(`/beds/${currentBedId}/transfer`, data)).data.data;

export const createBed = async (data: { bed_code: string; room_id: number }) =>
  (await httpClient.post<ApiRes<Bed>>('/beds', data)).data.data;

export const fetchBedHistory = async (bedId: number) =>
  (await httpClient.get<ApiRes<BedHistoryEntry[]>>(`/beds/${bedId}/history`)).data.data;

// ============================================================
// Patients
// ============================================================
export const fetchPatients = async (p?: { status?: string; search?: string; room_id?: number; doctor_name?: string }) =>
  (await httpClient.get<ApiRes<Patient[]>>('/patients', { params: p })).data.data;

export const fetchPatient = async (id: number) =>
  (await httpClient.get<ApiRes<Patient>>(`/patients/${id}`)).data.data;

export const createPatient = async (data: Partial<Patient>) =>
  (await httpClient.post<ApiRes<Patient>>('/patients', data)).data.data;

export const updatePatient = async (id: number, data: Partial<Patient>) =>
  (await httpClient.put<ApiRes<Patient>>(`/patients/${id}`, data)).data.data;

export const dischargePatient = async (id: number) =>
  (await httpClient.post<ApiRes<Patient>>(`/patients/${id}/discharge`)).data.data;

// ============================================================
// Discharge
// ============================================================
export const fetchDischargeList = async (date?: string, filters?: { department_id?: number; doctor_name?: string; search?: string }) =>
  (await httpClient.get<ApiRes<Patient[]>>('/patients/discharge-list', { params: { date, ...filters } })).data.data;

// ============================================================
// Waiting Queue
// ============================================================
export interface WaitingPatient {
  id: number; patient_id: number; patient_code: string; admission_code: string;
  full_name: string; date_of_birth: string; gender: string; phone: string;
  diagnosis: string; doctor_name: string; status: string; admitted_at: string;
  expected_discharge: string; notes: string; hours_waiting: number;
}

export const fetchWaitingQueue = async (search?: string) =>
  (await httpClient.get<ApiRes<WaitingPatient[]>>('/patients/waiting-queue', { params: { search } })).data.data;

// ============================================================
// Checklists
// ============================================================
export const fetchChecklists = async (patientId: number) =>
  (await httpClient.get<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists`)).data.data;

export const toggleChecklist = async (patientId: number, templateId: number, completed: boolean, answerText?: string, notes?: string) =>
  (await httpClient.post<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists/toggle`, { template_id: templateId, completed, answer_text: answerText, notes })).data.data;

// ============================================================
// Dashboard
// ============================================================
export const fetchDashboardStats = async () =>
  (await httpClient.get<ApiRes<DashboardStats>>('/dashboard/stats')).data.data;

// ============================================================
// Users
// ============================================================
export const fetchUsers = async (p?: { role?: string; is_active?: string; search?: string }) =>
  (await httpClient.get<ApiRes<User[]>>('/users', { params: p })).data.data;

export const fetchUser = async (id: number) =>
  (await httpClient.get<ApiRes<User>>(`/users/${id}`)).data.data;

export const createUser = async (data: { email: string; password: string; full_name: string; role: string; department_id?: number }) =>
  (await httpClient.post<ApiRes<User>>('/users', data)).data.data;

export const updateUser = async (id: number, data: Partial<User>) =>
  (await httpClient.put<ApiRes<User>>(`/users/${id}`, data)).data.data;

export const deleteUser = async (id: number) =>
  (await httpClient.delete<ApiRes<void>>(`/users/${id}`)).data;

export const resetUserPassword = async (id: number, newPassword: string) =>
  (await httpClient.post<ApiRes<void>>(`/users/${id}/reset-password`, { new_password: newPassword })).data;

export const changePassword = async (currentPassword: string, newPassword: string) =>
  (await httpClient.post<ApiRes<void>>('/users/change-password', { current_password: currentPassword, new_password: newPassword })).data;

// ============================================================
// Notifications
// ============================================================
export const fetchNotifications = async (limit = 20) =>
  (await httpClient.get<ApiRes<Notification[]>>('/notifications', { params: { limit } })).data.data;

export const fetchUnreadCount = async () =>
  (await httpClient.get<ApiRes<{ count: number }>>('/notifications/unread-count')).data.data.count;

export const markNotificationRead = async (id: number) =>
  (await httpClient.post<ApiRes<void>>(`/notifications/${id}/read`)).data;

export const markAllNotificationsRead = async () =>
  (await httpClient.post<ApiRes<void>>('/notifications/read-all')).data;

export const subscribeToPush = async (subscription: any) =>
  (await httpClient.post<ApiRes<void>>('/notifications/subscribe', { subscription })).data;  

export const unsubscribeFromPush = async (endpoint: string) =>
  (await httpClient.post<ApiRes<void>>('/notifications/unsubscribe', { endpoint })).data;

export const getVapidPublicKey = async () =>
  (await httpClient.get<ApiRes<{ publicKey: string }>>('/notifications/vapid-public-key')).data.data.publicKey;

// ============================================================
// Search
// ============================================================
export const globalSearch = async (q: string) =>
  (await httpClient.get<ApiRes<SearchResults>>('/search', { params: { q } })).data.data;

export const searchReadmission = async (q: string): Promise<ReadmissionPatient[]> =>
  (await httpClient.get<ApiRes<ReadmissionPatient[]>>('/search/readmission', { params: { q } })).data.data;

// ============================================================
// Reports
// ============================================================
export const fetchOccupancyReport = async () =>
  (await httpClient.get<ApiRes<OccupancyReport[]>>('/reports/occupancy')).data.data;

export const fetchDischargeReport = async (from?: string, to?: string) =>
  (await httpClient.get<ApiRes<DischargeReport[]>>('/reports/discharge', { params: { from, to } })).data.data;

export const fetchMissingRecordsReport = async () =>
  (await httpClient.get<ApiRes<any[]>>('/reports/missing-records')).data.data;

export const fetchDepartmentReport = async () =>
  (await httpClient.get<ApiRes<any[]>>('/reports/department')).data.data;

// ============================================================
// Audit
// ============================================================
export const fetchAuditLogs = async (p?: { entity_type?: string; user_id?: number; from?: string; to?: string }) =>
  (await httpClient.get<ApiRes<AuditLog[]>>('/audit', { params: p })).data.data;

// ============================================================
// Config
// ============================================================
export const fetchSystemConfig = async () =>
  (await httpClient.get<ApiRes<SystemConfig[]>>('/config')).data.data;

export const updateSystemConfig = async (key: string, value: string) =>
  (await httpClient.put<ApiRes<void>>(`/config/${key}`, { value })).data;

export const fetchChecklistTemplates = async () =>
  (await httpClient.get<ApiRes<any[]>>('/config/checklist-templates')).data.data;

export const createChecklistTemplate = async (data: { name: string; description?: string; sort_order?: number }) =>
  (await httpClient.post<ApiRes<any>>('/config/checklist-templates', data)).data.data;

export const updateChecklistTemplate = async (id: number, data: any) =>
  (await httpClient.put<ApiRes<void>>(`/config/checklist-templates/${id}`, data)).data;

export const fetchConfigDepartments = async () =>
  (await httpClient.get<ApiRes<Department[]>>('/config/departments')).data.data;

export const createDepartment = async (data: { name: string; code: string; description?: string }) =>
  (await httpClient.post<ApiRes<any>>('/config/departments', data)).data.data;

export const updateDepartment = async (id: number, data: any) =>
  (await httpClient.put<ApiRes<void>>(`/config/departments/${id}`, data)).data;

// ============================================================
// Wards (#3)
// ============================================================
export interface Ward {
  id: number; name: string; code: string; description: string | null;
  floor_start: number; floor_end: number; is_active: boolean;
  room_count: number; bed_count: number;
}

export const fetchWards = async (params?: { is_active?: string; search?: string }) =>
  (await httpClient.get<ApiRes<Ward[]>>('/wards', { params })).data.data;

export const fetchWard = async (id: number) =>
  (await httpClient.get<ApiRes<Ward>>(`/wards/${id}`)).data.data;

export const createWard = async (data: Partial<Ward>) =>
  (await httpClient.post<ApiRes<Ward>>('/wards', data)).data.data;

export const updateWard = async (id: number, data: Partial<Ward>) =>
  (await httpClient.put<ApiRes<Ward>>(`/wards/${id}`, data)).data.data;

export const deleteWard = async (id: number) =>
  (await httpClient.delete<ApiRes<void>>(`/wards/${id}`)).data;

// ============================================================
// Reports — Enhanced (#42, #60, #80)
// ============================================================
export interface DischargeHistoryItem {
  id: number; patient_code: string; full_name: string; admission_code: string;
  diagnosis: string; doctor_name: string; admitted_at: string; discharged_at: string;
  room_code: string; room_name: string; bed_code: string; department_name: string;
  stay_days: number;
}

export interface TrendDataPoint {
  stat_date: string; total_patients: number; new_admissions: number;
  discharges: number; occupied_beds?: number; occupancy_rate?: number;
}

export const fetchDischargeHistory = async (params?: { from?: string; to?: string; doctor_name?: string; department_id?: number; search?: string }) =>
  (await httpClient.get<ApiRes<DischargeHistoryItem[]>>('/reports/discharge-history', { params })).data.data;

export const fetchTrendData = async (days = 30, departmentId?: number) =>
  (await httpClient.get<ApiRes<TrendDataPoint[]>>('/reports/trends', { params: { days, department_id: departmentId } })).data.data;

export const exportReportCSV = async (type: string, params?: Record<string, string>) => {
  const response = await httpClient.get(`/reports/export/${type}`, { params, responseType: 'blob' });
  const blob = new Blob([response.data as BlobPart], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================================
// Doctor Report (#81)
// ============================================================
export interface DoctorReport {
  doctor_name: string; department_name: string; total_patients: number;
  active_patients: number; discharged_patients: number; avg_stay_days: number;
}

export const fetchDoctorReport = async (departmentId?: number) =>
  (await httpClient.get<ApiRes<DoctorReport[]>>('/reports/doctor', { params: { department_id: departmentId } })).data.data;

// ============================================================
// Bed Allocation Rules (#28, #68)
// ============================================================
export interface BedAllocationRule {
  id: number; name: string; description: string; rule_type: string;
  priority: number; conditions: any; actions: any; is_active: boolean;
  department_id: number | null; created_at: string;
}

export const fetchBedRules = async () =>
  (await httpClient.get<ApiRes<BedAllocationRule[]>>('/bed-rules/rules')).data.data;

export const createBedRule = async (data: Partial<BedAllocationRule>) =>
  (await httpClient.post<ApiRes<BedAllocationRule>>('/bed-rules/rules', data)).data.data;

export const updateBedRule = async (id: number, data: Partial<BedAllocationRule>) =>
  (await httpClient.put<ApiRes<BedAllocationRule>>(`/bed-rules/rules/${id}`, data)).data.data;

export const deleteBedRule = async (id: number) =>
  (await httpClient.delete<ApiRes<void>>(`/bed-rules/rules/${id}`)).data;

// ============================================================
// Auto Bed Suggestion (#25, #97)
// ============================================================
export interface BedSuggestion {
  bed_id: number; bed_code: string; room_id: number; room_code: string;
  room_name: string; room_type: string; floor: number; department_name: string;
  score: number; reasons: string[];
}

export const suggestBeds = async (patientInfo: {
  gender?: string; diagnosis?: string; department_id?: number;
  severity?: string; isolation_required?: boolean; room_type_preference?: string;
}) => (await httpClient.post<ApiRes<BedSuggestion[]>>('/bed-rules/suggest', patientInfo)).data.data;

// ============================================================
// SLA (#99)
// ============================================================
export interface SLASummary {
  sla_type: string; name: string; total: number; completed: number;
  breached: number; warning: number; on_track: number; avg_minutes: number;
}

export const fetchSLASummary = async () =>
  (await httpClient.get<ApiRes<SLASummary[]>>('/bed-rules/sla/summary')).data.data;

export const fetchSLATracking = async (filters?: { status?: string; sla_type?: string }) =>
  (await httpClient.get<ApiRes<any[]>>('/bed-rules/sla/tracking', { params: filters })).data.data;

// ============================================================
// Session Management (#76)
// ============================================================
export interface UserSession {
  id: number; ip_address: string; device_info: string;
  last_active_at: string; created_at: string; expires_at: string; is_active: boolean;
}

export const fetchSessions = async () =>
  (await httpClient.get<ApiRes<UserSession[]>>('/auth/sessions')).data.data;

export const revokeSession = async (sessionId: number) =>
  (await httpClient.delete<ApiRes<void>>(`/auth/sessions/${sessionId}`)).data;

export const revokeAllSessions = async () =>
  (await httpClient.post<ApiRes<void>>('/auth/sessions/revoke-all')).data;

// ============================================================
// SaaS / Plans (#91, #92)
// ============================================================
export interface ServicePlan {
  id: number; plan_code: string; name: string; description: string;
  max_users: number; max_departments: number; max_rooms: number; max_beds: number;
  features: string[]; price_monthly: number; price_yearly: number;
  is_active: boolean; sort_order: number;
}

export interface Tenant {
  id: number; name: string; subdomain: string; custom_domain: string;
  logo_url: string; plan: string; plan_name: string;
  is_active: boolean; billing_email: string; expires_at: string;
  max_users: number; max_departments: number; max_rooms: number; max_beds: number;
  settings: any;
}

export interface ResourceLimits {
  users: { current: number; max: number };
  departments: { current: number; max: number };
  rooms: { current: number; max: number };
  beds: { current: number; max: number };
}

export const fetchPlans = async () =>
  (await httpClient.get<ApiRes<ServicePlan[]>>('/saas/plans')).data.data;

export const createPlan = async (data: Partial<ServicePlan>) =>
  (await httpClient.post<ApiRes<ServicePlan>>('/saas/plans', data)).data.data;

export const updatePlan = async (id: number, data: Partial<ServicePlan>) =>
  (await httpClient.put<ApiRes<ServicePlan>>(`/saas/plans/${id}`, data)).data.data;

export const fetchTenants = async () =>
  (await httpClient.get<ApiRes<Tenant[]>>('/saas/tenants')).data.data;

export const fetchTenant = async (id: number) =>
  (await httpClient.get<ApiRes<Tenant>>(`/saas/tenants/${id}`)).data.data;

export const updateTenant = async (id: number, data: Partial<Tenant>) =>
  (await httpClient.put<ApiRes<Tenant>>(`/saas/tenants/${id}`, data)).data.data;

export const fetchResourceLimits = async (tenantId: number) =>
  (await httpClient.get<ApiRes<ResourceLimits>>(`/saas/tenants/${tenantId}/limits`)).data.data;

// ============================================================
// HIS/EMR Integration (#93)
// ============================================================
export interface HISIntegration {
  id: number; tenant_id: number; integration_name: string; integration_type: string;
  endpoint_url: string; sync_direction: string; sync_interval_minutes: number;
  is_active: boolean; last_sync_at: string; last_sync_status: string;
  last_sync_message: string;
}

export const fetchIntegrations = async (tenantId = 1) =>
  (await httpClient.get<ApiRes<HISIntegration[]>>('/saas/integrations', { params: { tenant_id: tenantId } })).data.data;

export const createIntegration = async (data: Partial<HISIntegration>) =>
  (await httpClient.post<ApiRes<HISIntegration>>('/saas/integrations', data)).data.data;

export const updateIntegration = async (id: number, data: Partial<HISIntegration>) =>
  (await httpClient.put<ApiRes<HISIntegration>>(`/saas/integrations/${id}`, data)).data.data;

export const deleteIntegration = async (id: number) =>
  (await httpClient.delete<ApiRes<void>>(`/saas/integrations/${id}`)).data;

// ============================================================
// QR Codes (#96)
// ============================================================
export interface QRCode {
  id: number; entity_type: string; entity_id: number; qr_data: string; is_active: boolean;
}

export const fetchQRCode = async (entityType: string, entityId: number) =>
  (await httpClient.get<ApiRes<QRCode>>(`/extras/${entityType}/${entityId}`)).data.data;

export const batchGenerateQR = async (entityType: string) =>
  (await httpClient.post<ApiRes<void>>(`/extras/batch/${entityType}`)).data;

// ============================================================
// Dashboard Widgets (#69)
// ============================================================
export interface DashboardWidget {
  id: number; widget_key: string; widget_name: string; widget_type: string;
  is_visible: boolean; sort_order: number; settings: any;
}

export const fetchDashboardWidgets = async () =>
  (await httpClient.get<ApiRes<DashboardWidget[]>>('/extras/dashboard-widgets/user')).data.data;

export const updateDashboardWidget = async (widgetId: number, data: { is_visible?: boolean; sort_order?: number; settings?: any }) =>
  (await httpClient.put<ApiRes<void>>(`/extras/dashboard-widgets/user/${widgetId}`, data)).data;

// ============================================================
// Patient Notes (#36)
// ============================================================
export interface PatientNote {
  id: number; admission_id: number; content: string; note_type: string;
  created_by_name: string; created_at: string;
}

export const fetchPatientNotes = async (admissionId: number) =>
  (await httpClient.get<ApiRes<PatientNote[]>>(`/patients/${admissionId}/notes`)).data.data;

export const createPatientNote = async (admissionId: number, content: string, noteType = 'general') =>
  (await httpClient.post<ApiRes<PatientNote[]>>(`/patients/${admissionId}/notes`, { content, note_type: noteType })).data.data;

// ============================================================
// Transfer History (#34)
// ============================================================
export const fetchTransferHistory = async (admissionId: number) =>
  (await httpClient.get<ApiRes<BedHistoryEntry[]>>(`/patients/${admissionId}/transfer-history`)).data.data;

// ============================================================
// Checklist Review History (#48)
// ============================================================
export interface ChecklistReviewEntry {
  id: number; admission_id: number; checklist_name: string; reviewed_by_name: string;
  action: string; answer_text: string; notes: string; created_at: string;
}

export const fetchChecklistHistory = async (admissionId: number) =>
  (await httpClient.get<ApiRes<ChecklistReviewEntry[]>>(`/patients/${admissionId}/checklist-history`)).data.data;

// ============================================================
// Audit Summary (#100)
// ============================================================
export interface AuditSummary {
  by_action: { action: string; count: number }[];
  by_entity: { entity_type: string; count: number }[];
  by_user: { user_id: number; full_name: string; count: number }[];
  by_day: { log_date: string; count: number }[];
}

export const fetchAuditSummary = async (days = 7) =>
  (await httpClient.get<ApiRes<AuditSummary>>('/audit/summary', { params: { days } })).data.data;
