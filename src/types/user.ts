export const UserRole ={ PLAYER : 'PLAYER', ADMIN :'ADMIN' } as const;
export type UserRole= (typeof UserRole)[keyof typeof UserRole];
export interface User {
  id: number;
  telegramId?: string;
  username?: string;
  firstName: string;
  lastName?: string;
  phoneNumber:string,
  role: UserRole;
  balance?: number;
}
export interface ManagedUser {
  id: number;
  displayName: string;
  phoneMasked?: string;
  role: 'PLAYER' | 'ADMIN' | 'SPECIAL';
  status: 'ACTIVE' | 'BLOCKED';
}
