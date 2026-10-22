export interface AuditEvent { id: number; actorId: number; action: string; entityType: string; entityId: string; reason?: string; beforeValue?: unknown; afterValue?: unknown; createdAt: string; }
export interface GamePermission { id: number; userId: number; gameId: number; permission: string; reason: string; }
export interface GrantGamePermissionDto { userId: number; gameId: number; permission: string; reason: string; }
