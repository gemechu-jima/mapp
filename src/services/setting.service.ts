import {api} from "./api"; 

export interface SystemSettings {
  id?: number;
  platformName: string;
  currency: string;
  defaultReservationMinutes: number;
  updatedAt?: string;
}

export const SettingService = {
  async get(): Promise<SystemSettings> {
    const res = await api.get("/settings");
    return res.data;
  },

  async update(payload: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await api.put("/settings", payload);
    return res.data;
  },
};