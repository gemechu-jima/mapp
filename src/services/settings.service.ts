import { api } from './api';
import type { AppSettings, UpdateAppSettingsDto } from '@/types/settings';

export const SettingsService = {
  async get(): Promise<AppSettings> { return (await api.get<AppSettings>('/settings')).data; },
  async update(data: UpdateAppSettingsDto): Promise<AppSettings> { return (await api.patch<AppSettings>('/settings', data)).data; },
};
