export const NumberStatus= {
  AVAILABLE : 'AVAILABLE',
  RESERVED :'RESERVED',
  CONFIRMED : 'CONFIRMED',
} as const;

type ValueOf<T> = T[keyof T];
export type NumberStatus = ValueOf<typeof NumberStatus>;

export interface GameNumber {
  id: number;
  gameId: number;
  number: number;
  status: NumberStatus;
}

export interface ResponseGameNumber{
  data:GameNumber[],
  status:200,
  message:"successfully"
}