import { api } from './api';
import type { CreateGameDto, Game } from '@/types/game';

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
  async deleteGame(id: number): Promise<void> {
    await api.delete(`/games/${id}`);
  },
};
