import type { AuthResponse, RegisterRequest } from '@/types/auth';
import { api } from './api';

export async function loginUser(phoneNumber: string): Promise<AuthResponse> {
  const normalized = phoneNumber.trim();
     console.log("normalizated",normalized)
  if (!normalized) {
    throw new Error('Phone number is required h');
  }

  const response = await api.post<AuthResponse>('/users/login', {
    phoneNumber: normalized,
  });
  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/users/register', data);
  return response.data;
}
