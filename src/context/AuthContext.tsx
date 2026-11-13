import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/services/api';

export type UserRole = 'PLAYER' | 'ADMIN';

export type AuthUser = {
  id: string;
  name?: string;
  phone: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
};

const AUTH_KEY = 'bingo_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on startup
  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((raw: string | null) => {
        if (raw) {
          const saved = JSON.parse(raw) as { user: AuthUser; token: string };
          setUser(saved.user);
          setToken(saved.token);
          setAuthToken(saved.token);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((authenticatedUser: AuthUser, accessToken: string) => {
    setUser(authenticatedUser);
    setToken(accessToken);
    setAuthToken(accessToken);
    AsyncStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ user: authenticatedUser, token: accessToken }),
    ).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
  }, []);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoading, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
