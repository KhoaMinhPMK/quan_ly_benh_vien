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
  is_completed: boolean; completed_at: string | null; notes: string | null;
  completed_by_name: string | null;
}

export interface DashboardStats {
  total_patients: number;
  beds: { total_beds: number; empty_beds: number; occupied_beds: number; locked_beds: number; cleaning_beds: number; };
  discharge_pending: number;
  patients_missing_checklist: number;
  rooms: Room[];
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
  id: number; patient_id: number; bed_id: number; action: string;
  notes: string; created_at: string; patient_name: string;
  patient_code: string; bed_code: string; performed_by_name: string;
}

export interface SearchResults {
  patients: { id: number; patient_code: string; full_name: string; status: string }[];
  rooms: { id: number; room_code: string; name: string }[];
  beds: { id: number; room_id: number; bed_code: string; room_code: string; room_name: string }[];
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

export const transferBed = async (currentBedId: number, data: { patient_id: number; target_bed_id: number; reason?: string }) =>
  (await httpClient.post<ApiRes<any>>(`/beds/${currentBedId}/transfer`, data)).data.data;

export const createBed = async (data: { bed_code: string; room_id: number }) =>
  (await httpClient.post<ApiRes<Bed>>('/beds', data)).data.data;

export const fetchBedHistory = async (bedId: number) =>
  (await httpClient.get<ApiRes<BedHistoryEntry[]>>(`/beds/${bedId}/history`)).data.data;

// ============================================================
// Patients
// ============================================================
export const fetchPatients = async (p?: { status?: string; search?: string; room_id?: number }) =>
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
export const fetchDischargeList = async (date?: string) =>
  (await httpClient.get<ApiRes<Patient[]>>('/patients/discharge-list', { params: { date } })).data.data;

// ============================================================
// Checklists
// ============================================================
export const fetchChecklists = async (patientId: number) =>
  (await httpClient.get<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists`)).data.data;

export const toggleChecklist = async (patientId: number, templateId: number, completed: boolean) =>
  (await httpClient.post<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists/toggle`, { template_id: templateId, completed })).data.data;

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

// ============================================================
// Search
// ============================================================
export const globalSearch = async (q: string) =>
  (await httpClient.get<ApiRes<SearchResults>>('/search', { params: { q } })).data.data;

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
