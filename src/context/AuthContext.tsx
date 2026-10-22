
import {createContext,useCallback,useContext,useMemo,useState,type ReactNode,} from 'react';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(
    (authenticatedUser: AuthUser, accessToken: string) => {
      setUser(authenticatedUser);
      setToken(accessToken);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

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
    [user, token, isLoading, login, logout, hasRole]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}
