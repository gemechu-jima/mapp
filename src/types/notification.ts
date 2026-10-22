export interface AppNotification { id: number; title: string; message: string; type: string; readAt?: string; createdAt: string; }
export interface AnnouncementDto { title: string; message: string; audience: 'ALL' | 'GAME'; gameId?: number; }
