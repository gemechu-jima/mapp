import { NumberService } from './number.service';
import type { ReservationResponse, CreateReservationDto } from '@/types/reservation';

function toReservationResponse(n: any): ReservationResponse {
  const status = n.status === 'RESERVED' ? 'PENDING' : n.status;
  return {
    id: n.id,
    userId: n.userId,
    numberId: n.numberId || n.id,
    gameId: n.gameId,
    status,
    expiresAt: n.expiresAt || '',
    createdAt: n.createdAt || new Date().toISOString(),
    updatedAt: n.updatedAt,
    user: n.user,
    number: {
      id: n.id,
      number: n.number,
      status: n.status,
    },
    gameTitle: n.gameTitle,
  };
}

export const ReservationService = {
  async createReservation(data: CreateReservationDto): Promise<ReservationResponse> {
    const res = await NumberService.reserve(data);
    return toReservationResponse(res);
  },
  async reserve(data: CreateReservationDto): Promise<ReservationResponse> {
    const res = await NumberService.reserve(data);
    return toReservationResponse(res);
  },
  async getAll(): Promise<ReservationResponse[]> {
    const list = await NumberService.getAllActive();
    return list.map(toReservationResponse);
  },
  async getByGame(gameId: number): Promise<ReservationResponse[]> {
    const list = await NumberService.getReservedByGame(gameId);
    return list.map(toReservationResponse);
  },
  async getConfirmedByGame(gameId: number): Promise<ReservationResponse[]> {
    const list = await NumberService.getConfirmedByGame(gameId);
    return list.map(toReservationResponse);
  },
  async getByUser(userId: number | string): Promise<ReservationResponse[]> {
    const list = await NumberService.getByUser(userId);
    return list.map(toReservationResponse);
  },
  async getMine(): Promise<ReservationResponse[]> {
    const list = await NumberService.getMine();
    return list.map(toReservationResponse);
  },
  async getPublic(): Promise<ReservationResponse[]> {
    const list = await NumberService.getAllActive();
    return list.map(toReservationResponse);
  },
  async confirm(id: number): Promise<ReservationResponse> {
    const res = await NumberService.confirm(id);
    return toReservationResponse(res);
  },
  async cancel(id: number): Promise<ReservationResponse> {
    const res = await NumberService.cancel(id);
    return toReservationResponse(res);
  },
  async restoreExpired(id: number): Promise<ReservationResponse> {
    const res = await NumberService.restore(id);
    return toReservationResponse(res);
  },
};
