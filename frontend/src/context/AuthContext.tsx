import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, apiRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateStatus: (status: 'available' | 'on_break' | 'offline') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('polarise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('polarise_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await apiRequest<User>('/auth/me');
      setUser(userData);
      localStorage.setItem('polarise_user', JSON.stringify(userData));
    } catch {
      localStorage.removeItem('polarise_token');
      localStorage.removeItem('polarise_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ access_token: string; user: User }>('/auth/login', 'POST', {
      email,
      password
    });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('polarise_token', res.access_token);
    localStorage.setItem('polarise_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      localStorage.removeItem('polarise_token');
      localStorage.removeItem('polarise_user');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  };

  const updateStatus = async (status: 'available' | 'on_break' | 'offline') => {
    await apiRequest('/auth/status', 'POST', { status });
    await refreshUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateStatus, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
