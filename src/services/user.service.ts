import { api } from './api';
import type { ManagedUser } from '@/types/user';
import type { GamePermission, GrantGamePermissionDto } from '@/types/security';
export const UserService = {
  async list(): Promise<ManagedUser[]> { return (await api.get<ManagedUser[]>('/users')).data; },
  async updateStatus(id: number, status: 'ACTIVE' | 'BLOCKED'): Promise<ManagedUser> { return (await api.patch<ManagedUser>(`/users/${id}/status`, { status })).data; },
  async grantGamePermission(data: GrantGamePermissionDto): Promise<GamePermission> { return (await api.post<GamePermission>('/users/game-permissions', data)).data; },
  async revokeGamePermission(id: number): Promise<void> { await api.delete(`/users/game-permissions/${id}`); },
};
