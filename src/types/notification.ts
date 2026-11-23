export type NotificationType = 'WIN' | 'PAYMENT' | 'RESERVATION' | 'ANNOUNCEMENT' | 'SYSTEM';

export interface AppNotification {
  id: number;
  userId?: number;
  title: string;
  message: string;
  type: NotificationType | string;
  metadata?: {
    drawId?: number;
    gameId?: number;
    number?: number;
    place?: number;
    prizeAmount?: number;
    proofId?: number;
    numberId?: number;
  } | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AnnouncementDto {
  title: string;
  message: string;
  audience: 'ALL' | 'GAME';
  gameId?: number;
}
