export const NumberStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  CONFIRMED: 'CONFIRMED',
} as const;

type ValueOf<T> = T[keyof T];
export type NumberStatus = ValueOf<typeof NumberStatus>;

export interface GameNumber {
  id: number;
  gameId: number;
  number: number;
  status: NumberStatus;
  userId?: number | null;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  gameTitle?: string;
  user?: {
    id: number;
    name: string;
    phoneNumber?: string;
  } | null;
}

export interface ResponseGameNumber {
  data: GameNumber[];
  status: 200;
  message: string;
}

export interface ReserveNumberDto {
  userId?: string | number;
  numberId: number;
  gameId: number;
  minutes: number;
}
