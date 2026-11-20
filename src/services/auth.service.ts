import type { AuthResponse, RegisterRequest } from '@/types/auth';
import { api } from './api';

export async function loginUser(phoneNumber: string, activationCode?: string) {
  const normalized = phoneNumber.trim();
  if (!normalized) {
    throw new Error('Phone number is required');
  }

  const payload: { phoneNumber: string; activationCode?: string } = {
    phoneNumber: normalized,
  };

  if (activationCode && activationCode.trim()) {
    payload.activationCode = activationCode.trim();
  }

  const response = await api.post('/users/login', payload);
  return response.data;
}
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/users/register', data);
  return response.data;
}
