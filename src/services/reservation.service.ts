import { api } from './api';
import type { ReservationResponse, CreateReservationDto } from '@/types/reservation';

export const ReservationService = {
  async createReservation(data: CreateReservationDto): Promise<ReservationResponse> {
    return (await api.post<ReservationResponse>('/reservations', data)).data;
  },
  async reserve(data: CreateReservationDto): Promise<ReservationResponse> {
    return (await api.post<ReservationResponse>('/reservations', data)).data;
  },
  async getAll(): Promise<ReservationResponse[]> {
    const response = await api.get<ReservationResponse[] | { data?: ReservationResponse[] }>('/reservations');
    return Array.isArray(response.data) ? response.data : response.data.data ?? [];
  },
  async getByGame(gameId: number): Promise<ReservationResponse[]> {
    return (await api.get<ReservationResponse[]>(`/reservations/game/${gameId}`)).data;
  },
  async getConfirmedByGame(gameId: number): Promise<ReservationResponse[]> {
    return (await api.get<ReservationResponse[]>(`/reservations/game/${gameId}/confirmed`)).data;
  },
  async getByUser(userId: number | string): Promise<ReservationResponse[]> {
    return (await api.get<ReservationResponse[]>(`/reservations/user/${userId}`)).data;
  },
  async getMine(): Promise<ReservationResponse[]> {
    return (await api.get<ReservationResponse[]>('/reservations/me')).data;
  },
  async getPublic(): Promise<ReservationResponse[]> {
    return (await api.get<ReservationResponse[]>('/reservations/public')).data;
  },
  async confirm(id: number): Promise<ReservationResponse> {
    return (await api.patch<ReservationResponse>(`/reservations/${id}/confirm`)).data;
  },
  async cancel(id: number): Promise<ReservationResponse> {
    return (await api.patch<ReservationResponse>(`/reservations/${id}/cancel`)).data;
  },
  async restoreExpired(id: number): Promise<ReservationResponse> {
    return (await api.post<ReservationResponse>(`/reservations/${id}/restore`)).data;
  },
};
