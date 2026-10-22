import { api } from './api';
import type { AnnouncementDto, AppNotification } from '@/types/notification';

export const NotificationService = {
  async getMine(): Promise<AppNotification[]> { return (await api.get<AppNotification[]>('/notifications/me')).data; },
  async markRead(id: number): Promise<AppNotification> { return (await api.patch<AppNotification>(`/notifications/${id}/read`)).data; },
  async getTemplates() { return (await api.get('/notifications/templates')).data; },
  async sendAnnouncement(data: AnnouncementDto) { return (await api.post('/notifications/announcements', data)).data; },
};
