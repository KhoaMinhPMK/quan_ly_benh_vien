// Shared types between client and server

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId: number | null;
  isActive: boolean;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'records_staff' | 'receptionist';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
