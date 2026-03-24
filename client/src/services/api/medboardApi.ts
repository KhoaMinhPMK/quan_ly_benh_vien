import httpClient from '../httpClient';

// ============================================================
// Types
// ============================================================
export interface Room {
  id: number;
  room_code: string;
  name: string;
  department_id: number;
  department_name: string;
  room_type: string;
  max_beds: number;
  status: string;
  floor: number;
  notes: string;
  total_beds: number;
  occupied_beds: number;
}

export interface Bed {
  id: number;
  bed_code: string;
  room_id: number;
  room_code: string;
  room_name: string;
  status: string;
  notes: string;
  patient_id: number | null;
  patient_name: string | null;
  patient_code: string | null;
}

export interface Patient {
  id: number;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  diagnosis: string;
  doctor_name: string;
  bed_id: number | null;
  bed_code: string | null;
  room_code: string | null;
  room_name: string | null;
  status: string;
  admitted_at: string;
  expected_discharge: string;
  discharged_at: string | null;
  notes: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface ChecklistItem {
  template_id: number;
  name: string;
  description: string;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  completed_by_name: string | null;
}

export interface DashboardStats {
  total_patients: number;
  beds: {
    total_beds: number;
    empty_beds: number;
    occupied_beds: number;
    locked_beds: number;
    cleaning_beds: number;
  };
  discharge_pending: number;
  patients_missing_checklist: number;
  rooms: Room[];
}

interface ApiRes<T> { success: boolean; data: T; message?: string; }

// ============================================================
// Rooms
// ============================================================
export async function fetchRooms(params?: { department_id?: number; status?: string; search?: string }) {
  const res = await httpClient.get<ApiRes<Room[]>>('/rooms', { params });
  return res.data.data;
}

export async function fetchRoom(id: number) {
  const res = await httpClient.get<ApiRes<Room>>(`/rooms/${id}`);
  return res.data.data;
}

export async function createRoom(data: Partial<Room>) {
  const res = await httpClient.post<ApiRes<Room>>('/rooms', data);
  return res.data.data;
}

export async function updateRoom(id: number, data: Partial<Room>) {
  const res = await httpClient.put<ApiRes<Room>>(`/rooms/${id}`, data);
  return res.data.data;
}

export async function fetchDepartments() {
  const res = await httpClient.get<ApiRes<Department[]>>('/rooms/departments');
  return res.data.data;
}

// ============================================================
// Beds
// ============================================================
export async function fetchBedsByRoom(roomId: number) {
  const res = await httpClient.get<ApiRes<Bed[]>>(`/beds/room/${roomId}`);
  return res.data.data;
}

export async function assignBed(bedId: number, patientId: number) {
  const res = await httpClient.post<ApiRes<Bed>>(`/beds/${bedId}/assign`, { patient_id: patientId });
  return res.data.data;
}

export async function releaseBed(bedId: number) {
  const res = await httpClient.post<ApiRes<Bed>>(`/beds/${bedId}/release`);
  return res.data.data;
}

export async function createBed(data: { bed_code: string; room_id: number }) {
  const res = await httpClient.post<ApiRes<Bed>>('/beds', data);
  return res.data.data;
}

// ============================================================
// Patients
// ============================================================
export async function fetchPatients(params?: { status?: string; search?: string; room_id?: number }) {
  const res = await httpClient.get<ApiRes<Patient[]>>('/patients', { params });
  return res.data.data;
}

export async function fetchPatient(id: number) {
  const res = await httpClient.get<ApiRes<Patient>>(`/patients/${id}`);
  return res.data.data;
}

export async function createPatient(data: Partial<Patient>) {
  const res = await httpClient.post<ApiRes<Patient>>('/patients', data);
  return res.data.data;
}

export async function updatePatient(id: number, data: Partial<Patient>) {
  const res = await httpClient.put<ApiRes<Patient>>(`/patients/${id}`, data);
  return res.data.data;
}

export async function dischargePatient(id: number) {
  const res = await httpClient.post<ApiRes<Patient>>(`/patients/${id}/discharge`);
  return res.data.data;
}

// ============================================================
// Discharge
// ============================================================
export async function fetchDischargeList(date?: string) {
  const res = await httpClient.get<ApiRes<Patient[]>>('/patients/discharge-list', { params: { date } });
  return res.data.data;
}

// ============================================================
// Checklists
// ============================================================
export async function fetchChecklists(patientId: number) {
  const res = await httpClient.get<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists`);
  return res.data.data;
}

export async function toggleChecklist(patientId: number, templateId: number, completed: boolean) {
  const res = await httpClient.post<ApiRes<ChecklistItem[]>>(`/patients/${patientId}/checklists/toggle`, { template_id: templateId, completed });
  return res.data.data;
}

// ============================================================
// Dashboard
// ============================================================
export async function fetchDashboardStats() {
  const res = await httpClient.get<ApiRes<DashboardStats>>('/dashboard/stats');
  return res.data.data;
}
