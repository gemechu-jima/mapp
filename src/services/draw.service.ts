import { api } from './api';
import type { CreateDrawDto, DrawResponse } from '@/types/draw';

export interface OfficialDrawWinner {
  place: number;
  tierName?: string;
  pct?: number;
  reservationId: number;
  numberId?: number;
  number: number;
  displayName: string;
  prizeAmount: number;
  userId?: number;
}

export interface OfficialDrawResult {
  id: number;
  gameId: number;
  status: 'COMPLETED';
  winners: OfficialDrawWinner[];
  createdAt: string;
}

export interface DrawHistoryRecord {
  id: number;
  gameId: number;
  gameTitle: string;
  gameTotalNumbers?: number;
  numberPrice?: number;
  status: 'COMPLETED';
  winners: OfficialDrawWinner[];
  totalPrize: number;
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
  async getDrawHistory(): Promise<DrawHistoryRecord[]> {
    return (await api.get<DrawHistoryRecord[]>('/draws/history')).data;
  },
};
