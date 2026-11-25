import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api, { TOKEN_STORAGE_KEY } from '../api/axios';
import type { ApiResponse, User, UserRole } from '../types';

interface AuthPayload {
  user: User;
  token: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      if (response.data.data) {
        setUser(response.data.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      void refreshUser();
    } else {
      setLoading(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<User> => {
    const response = await api.post<ApiResponse<AuthPayload>>(
      '/auth/login',
      input
    );
    const payload = response.data.data;
    if (!payload) {
      throw new Error(response.data.message || 'Login failed');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const response = await api.post<ApiResponse<AuthPayload>>(
      '/auth/register',
      input
    );
    const payload = response.data.data;
    if (!payload) {
      throw new Error(response.data.message || 'Registration failed');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
