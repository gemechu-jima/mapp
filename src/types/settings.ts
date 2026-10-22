export interface AppSettings {
  platformName: string;
  currencyCode: string;
  defaultReservationMinutes: number;
  updatedAt?: string;
}
export type UpdateAppSettingsDto = Partial<Pick<AppSettings, 'platformName' | 'currencyCode' | 'defaultReservationMinutes'>>;
