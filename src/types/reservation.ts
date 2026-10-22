import type { User } from './user';

export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface ReservationNumber {
  id: number;
  number: number;
  status: string;
}

export interface ReservationResponse {
  id: number;
  userId: number;
  numberId: number;
  gameId: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  number?: ReservationNumber;
  gameTitle?: string;
}

export type Reservation = ReservationResponse;

export interface CreateReservationDto {
  userId: number;
  numberId: number;
  gameId: number;
  minutes: number;
}
