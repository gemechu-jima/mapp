import { api } from './api';
import type { CreateDrawDto, DrawResponse } from '@/types/draw';

export interface OfficialDrawResult {
  id: number;
  gameId: number;
  status: 'COMPLETED';
  winners: { place: number; reservationId: number; number: number; displayName: string; prizeAmount: number }[];
  createdAt: string;
}

export const DrawService = {
  async createDraw(data: CreateDrawDto): Promise<DrawResponse> {
    return (await api.post<DrawResponse>('/draws', data)).data;
  },
  async getById(id: number): Promise<DrawResponse> {
    return (await api.get<DrawResponse>(`/draws/${id}`)).data;
  },
  async getByGame(gameId: number): Promise<DrawResponse[]> {
    return (await api.get<DrawResponse[]>(`/draws/game/${gameId}`)).data;
  },
  async resetGame(gameId: number): Promise<void> {
    await api.delete(`/draws/game/${gameId}`);
  },
  async drawNow(gameId: number): Promise<OfficialDrawResult> {
    return (await api.post<OfficialDrawResult>(`/draws/game/${gameId}/draw-now`)).data;
  },
  async getOfficialResults(gameId: number): Promise<OfficialDrawResult[]> {
    return (await api.get<OfficialDrawResult[]>(`/draws/game/${gameId}/results`)).data;
  },
};
