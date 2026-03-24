import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserInfo } from '@shared/types/auth';
import { loginApi, getMeApi } from '../services/api/authApi';

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medboard_token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // On mount, try to restore session from stored token
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('medboard_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userInfo = await getMeApi();
        setUser(userInfo);
        setToken(storedToken);
      } catch {
        // Token invalid, clear
        localStorage.removeItem('medboard_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginApi(email, password);
    localStorage.setItem('medboard_token', result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medboard_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
