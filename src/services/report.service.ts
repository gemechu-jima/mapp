import { api } from './api';
export type ReportDateRange = { from?: string; to?: string };
export const ReportService = {
  async getGameSummary(params?: ReportDateRange) { return (await api.get('/reports/games', { params })).data; },
  async getFinancialSummary(params?: ReportDateRange) { return (await api.get('/reports/financial', { params })).data; },
  async getReservationSummary(params?: ReportDateRange) { return (await api.get('/reports/reservations', { params })).data; },
};
