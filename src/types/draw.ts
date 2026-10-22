export interface DrawResponse {
  id: number;

  gameId: number;
  numberId: number;
  userId: number;

  number: number;
  drawOrder: number;
  drawnBy: number;

  createdAt: string;
  updatedAt: string;
}
 export interface CreateDrawDto {
  gameId: number;
  numberId: number;
  userId: number;
  number: number;
  drawnBy: number;
}


export interface ConfirmedReservation {
  id: number;
  userId: number;
  gameId: number;
  numberId: number;
  // status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    phoneNumber?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}