import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser, LoginInput, RegisterInput } from '@applytrack/shared';
import { apiRequest } from '../../lib/apiClient';
import { setAccessToken } from '../../lib/tokenStore';

type AuthResponse = { user: PublicUser; accessToken: string };

type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to rebuild the session from the refresh cookie.
  useEffect(() => {
    async function restore() {
      try {
        const data = await apiRequest<AuthResponse>('/api/auth/refresh', {
          method: 'POST',
          retry: false,
        });
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  async function login(input: LoginInput) {
    const data = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: input,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function register(input: RegisterInput) {
    const data = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: input,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await apiRequest<void>('/api/auth/logout', { method: 'POST', retry: false });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}