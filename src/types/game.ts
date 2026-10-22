
export enum GameStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DRAWING = "DRAWING",
    COMPLETED = 'COMPLETED',
    CANCELLED = "CANCELLED",

}
export  interface GameIdProps{
   gameId:number
}

export interface Game {
  id: number;
  title: string;
  totalNumbers: number;
  status: GameStatus;
  telegramChatId?: string;
  telegramMessageId?: string;
  createdBy: number;
  reservationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameDto {
  id:string;
  title: string;
  totalNumbers: number;
  reservationMinutes: number;
  createdBy: string;
}

export interface ResponseGame{
  data:Game[],
  status:200,
  message:"successfully"
}