import { api } from './api';
import { GameStatus, type CreateGameDto, type Game } from '@/types/game';
export const GameService = {
  async create(data: CreateGameDto): Promise<Game> {
    return (await api.post<Game>('/games', data)).data;
  },
  async getAll(): Promise<Game[]> {
    const response = await api.get<Game[] | { success?: boolean; data?: Game[] }>('/games');
    const payload = response.data as Game[] | { success?: boolean; data?: Game[] };
    if (Array.isArray(payload)) return payload;
    return payload.data ?? [];
  },
  async getById(id: number): Promise<Game> {
    return (await api.get<Game>(`/games/${id}`)).data;
  },
  async update(id: number, data: Partial<Game>): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}`, data)).data;
  },
  async activeGame(id: number): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}/active`)).data;
  },
  async closeGame(id: number): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}/close`)).data;
  },
  async cancel(id: number): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}/cancel`)).data;
  },
  async pending(id: number): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}/pending`)).data;
  },
  async drawing(id: number): Promise<Game> {
    return (await api.patch<Game>(`/games/${id}/drawing`)).data;
  },
  async deleteGame(id: number): Promise<void> {
    await api.delete(`/games/${id}`);
  },
  async updateFull(id: number | string, payload: Partial<Game>): Promise<Game> {
  const res = await api.patch(`/games/${id}`, payload);
  return res.data;
},

async remove(id: number | string): Promise<void> {
  await api.delete(`/games/${id}`);
},
  async updateStatus(id: number | string, status: GameStatus): Promise<Game> {
    const numericId = Number(id);

    switch (status) {
      case GameStatus.ACTIVE:
        return this.activeGame(numericId);
      case GameStatus.COMPLETED:
        return this.closeGame(numericId);
      case GameStatus.CANCELLED:
        return this.cancel(numericId);
      case GameStatus.PENDING:
        return this.pending(numericId);
      case GameStatus.DRAWING:
        return this.drawing(numericId);
      default:
        throw new Error(`Unsupported status transition: ${status}`);
    }
  },
};
