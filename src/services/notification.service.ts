import { api } from './api';
import type { AnnouncementDto, AppNotification } from '@/types/notification';

export const NotificationService = {
  async getMine(): Promise<AppNotification[]> {
    return (await api.get<AppNotification[]>('/notifications/me')).data;
  },
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return (await api.get<{ unreadCount: number }>('/notifications/unread-count')).data;
  },
  async markRead(id: number): Promise<AppNotification> {
    return (await api.patch<AppNotification>(`/notifications/${id}/read`)).data;
  },
  async markAllRead(): Promise<{ success: boolean }> {
    return (await api.patch<{ success: boolean }>('/notifications/read-all')).data;
  },
  async getTemplates() {
    return (await api.get('/notifications/templates')).data;
  },
  async sendAnnouncement(data: AnnouncementDto) {
    return (await api.post('/notifications/announcements', data)).data;
  },
};
