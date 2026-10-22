import { api } from './api';
import type { AuditEvent, GrantGamePermissionDto, GamePermission } from '@/types/security';
export const SecurityService = {
  async getAuditEvents(): Promise<AuditEvent[]> { return (await api.get<AuditEvent[]>('/security/audit')).data; },
  async getPermissions(): Promise<GamePermission[]> { return (await api.get<GamePermission[]>('/security/permissions')).data; },
  async grantPermission(data: GrantGamePermissionDto): Promise<GamePermission> { return (await api.post<GamePermission>('/security/permissions', data)).data; },
  async reportCorrection(data: { entityType: string; entityId: string; reason: string }) { return (await api.post('/security/correction-reports', data)).data; },
};
