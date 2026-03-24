import httpClient from '../httpClient';
import type { ApiResponse, LoginResponse, UserInfo } from '@shared/types/auth';

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await httpClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data!;
}

export async function getMeApi(): Promise<UserInfo> {
  const response = await httpClient.get<ApiResponse<UserInfo>>('/auth/me');
  return response.data.data!;
}
