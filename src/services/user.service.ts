import { api } from './api';
import type { User } from '@/types/user';
import type { GamePermission, GrantGamePermissionDto } from '@/types/security';

export const UserService = {
  async list(): Promise<User[]> {
    return (await api.get<User[]>('/users')).data;
  },
  async updateActivation(id: number, isActivated: boolean): Promise<User> {
    return (await api.patch<User>(`/users/${id}/activation`, { isActivated })).data;
  },
  async updateProfile(data: { name: string; phoneNumber: string }) {
    const response = await api.patch('/users/me', data);
    return response.data; // returns { token, user: { id, name, phone, role }, success: true }
  },
  async profile(userId?: number | string) {
    const response = await api.get('/users/me');
    return response.data; // returns { token, user: { id, name, phone, role }, success: true }
  },
  async grantGamePermission(data: GrantGamePermissionDto): Promise<GamePermission> {
    return (await api.post<GamePermission>('/users/game-permissions', data)).data;
  },
  async revokeGamePermission(id: number): Promise<void> {
    await api.delete(`/users/game-permissions/${id}`);
  },
async updateByAdmin(
    userId: number | string,
    data: { firstName: string; lastName: string; phoneNumber: string }
  ) {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: number | string) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
async toggleActivation(userId: number | string, isActivated: boolean) {
    const response = await api.patch(`/users/${userId}/activation`, {
      isActivated,
    });
    return response.data;
  },
  
};