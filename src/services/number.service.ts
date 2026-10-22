import { api } from './api';
import type { GameNumber, ResponseGameNumber } from '@/types/number';

export const NumberService = {
  async getByGame(gameId: number): Promise<ResponseGameNumber> {
    return (await api.get<ResponseGameNumber>(`/numbers/${gameId}`)).data;
  },
  async getForGame(gameId: number): Promise<GameNumber[]> {
    const result = await api.get<GameNumber[] | { data?: GameNumber[] }>(`/games/${gameId}/numbers`);
    const payload = result.data as GameNumber[] | { data?: GameNumber[] };
    return Array.isArray(payload) ? payload : payload.data ?? [];
  },
  async getAvailability(gameId: number) {
    return (await api.get(`/games/${gameId}/numbers/summary`)).data;
  },
};
