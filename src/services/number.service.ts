import { api } from './api';
import type { GameNumber, ResponseGameNumber, ReserveNumberDto } from '@/types/number';

export const NumberService = {
  async getByGame(gameId: number): Promise<ResponseGameNumber> {
    return (await api.get<ResponseGameNumber>(`/numbers/${gameId}`)).data;
  },
  async getForGame(gameId: number): Promise<GameNumber[]> {
    const result = await api.get<GameNumber[] | { data?: GameNumber[] }>(`/numbers/${gameId}`);
    const payload = result.data as GameNumber[] | { data?: GameNumber[] };
    return Array.isArray(payload) ? payload : payload.data ?? [];
  },
  async getAvailability(gameId: number) {
    return (await api.get(`/numbers/${gameId}/summary`)).data;
  },
  async reserve(data: ReserveNumberDto): Promise<GameNumber> {
    return (await api.post<GameNumber>('/numbers/reserve', data)).data;
  },
  async getMine(): Promise<GameNumber[]> {
    const res = await api.get<GameNumber[]>('/numbers/me');
    return Array.isArray(res.data) ? res.data : [];
  },
  async getByUser(userId: number | string): Promise<GameNumber[]> {
    const res = await api.get<GameNumber[]>(`/numbers/user/${userId}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async getConfirmedByGame(gameId: number): Promise<GameNumber[]> {
    const res = await api.get<GameNumber[]>(`/numbers/game/${gameId}/confirmed`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async getReservedByGame(gameId: number): Promise<GameNumber[]> {
    const res = await api.get<GameNumber[]>(`/numbers/game/${gameId}/active`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async getAllActive(): Promise<GameNumber[]> {
    const res = await api.get<GameNumber[]>('/numbers/active/all');
    return Array.isArray(res.data) ? res.data : [];
  },
  async confirm(id: number): Promise<GameNumber> {
    return (await api.patch<GameNumber>(`/numbers/${id}/confirm`)).data;
  },
  async cancel(id: number): Promise<GameNumber> {
    return (await api.patch<GameNumber>(`/numbers/${id}/cancel`)).data;
  },
  async restore(id: number): Promise<GameNumber> {
    return (await api.post<GameNumber>(`/numbers/${id}/restore`)).data;
  },
};
